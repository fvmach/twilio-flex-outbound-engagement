import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Column,
  Heading,
  Card,
  Text,
  Button,
  Separator,
  Label,
  Input,
  Alert,
  Spinner,
  Select,
  Option,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@twilio-paste/core';
import { TextArea } from '@twilio-paste/core/textarea';
import { Theme } from '@twilio-paste/core/theme';
import TemplateLibrary from '../TemplateLibrary/TemplateLibrary';
import Papa from 'papaparse';
import { ENDPOINTS } from '../../config';

const extractTemplateBody = (types) => {
  const bodyPaths = [
    'twilio/text.body',
    'twilio/quick-reply.body',
    'twilio/card.body',
    'twilio/list-picker.body',
    'twilio/catalog.body',
    'whatsapp/card.body',
  ];

  for (const path of bodyPaths) {
    const keys = path.split('.');
    let value = types;
    for (const key of keys) {
      value = value?.[key];
      if (!value) break;
    }
    if (value) return value;
  }
  return 'No body available';
};

const CampaignMode = ({ manager }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [templateVariables, setTemplateVariables] = useState({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(null);
  const [syncDocuments, setSyncDocuments] = useState([]);
  const [selectedSyncDoc, setSelectedSyncDoc] = useState('');
  const [loadingSyncDocs, setLoadingSyncDocs] = useState(false);
  const [unifiedProfilesQuery, setUnifiedProfilesQuery] = useState('');
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch(ENDPOINTS.LIST_TEMPLATES);
        if (!response.ok) throw new Error('Failed to fetch templates');
        const data = await response.json();
        setTemplates(data.templates || []);
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to fetch templates. Please try again.' });
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    const body = extractTemplateBody(template.types);
    const matches = body.match(/{{(\d+)}}/g);
    
    if (matches) {
      const vars = {};
      matches.forEach((match) => {
        const varNumber = match.replace(/[{}]/g, '');
        vars[varNumber] = '';
      });
      setTemplateVariables(vars);
    } else {
      setTemplateVariables({});
    }
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          setContacts(result.data);
          setMessage({ type: 'success', text: `Loaded ${result.data.length} contacts` });
        },
        error: (error) => {
          setMessage({ type: 'error', text: 'Error parsing CSV file' });
        },
      });
    }
  };

  const handleManualContact = (phoneNumbers) => {
    const phones = phoneNumbers.split('\n').filter(p => p.trim());
    const contactList = phones.map((phone, idx) => ({
      phone: phone.trim(),
      name: `Contact ${idx + 1}`,
    }));
    setContacts(contactList);
    setMessage({ type: 'success', text: `Added ${contactList.length} contacts` });
  };

  const fetchSyncDocuments = async () => {
    setLoadingSyncDocs(true);
    try {
      const response = await fetch(ENDPOINTS.LIST_SYNC_DOCUMENTS);
      if (!response.ok) throw new Error('Failed to fetch Sync documents');
      const data = await response.json();
      setSyncDocuments(data.documents || []);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load Sync documents' });
    } finally {
      setLoadingSyncDocs(false);
    }
  };

  const handleLoadFromSync = async () => {
    if (!selectedSyncDoc) {
      setMessage({ type: 'error', text: 'Please select a Sync document' });
      return;
    }

    try {
      const response = await fetch(
        `${ENDPOINTS.GET_SYNC_DOCUMENT}?documentSid=${selectedSyncDoc}`
      );
      if (!response.ok) throw new Error('Failed to fetch contacts from Sync');
      const data = await response.json();
      
      const contactList = data.contacts || [];
      setContacts(contactList);
      setMessage({ type: 'success', text: `Loaded ${contactList.length} contacts from Sync` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load contacts from Sync document' });
    }
  };

  const handleLoadFromUnifiedProfiles = async () => {
    if (!unifiedProfilesQuery) {
      setMessage({ type: 'error', text: 'Please enter a search query' });
      return;
    }

    setLoadingProfiles(true);
    try {
      const response = await fetch(
        `${ENDPOINTS.SEARCH_UNIFIED_PROFILES}?query=${encodeURIComponent(unifiedProfilesQuery)}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) throw new Error('Failed to search Unified Profiles');
      const data = await response.json();
      
      const contactList = (data.profiles || []).map(profile => ({
        phone: profile.phone_number || profile.attributes?.phone,
        name: profile.display_name || `${profile.attributes?.first_name || ''} ${profile.attributes?.last_name || ''}`.trim(),
        email: profile.attributes?.email,
        profileId: profile.id,
      })).filter(c => c.phone);
      
      setContacts(contactList);
      setMessage({ type: 'success', text: `Found ${contactList.length} profiles` });
    } catch (err) {
      console.error('Error loading Unified Profiles:', err);
      setMessage({ type: 'error', text: 'Failed to load Unified Profiles. Feature may not be enabled.' });
    } finally {
      setLoadingProfiles(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!selectedTemplate || contacts.length === 0) {
      setMessage({ type: 'error', text: 'Please select a template and add contacts' });
      return;
    }

    setSending(true);
    setMessage({ type: 'neutral', text: 'Sending messages...' });

    try {
      const selectedContactDetails = contacts
        .map(contact => `phoneNumber=whatsapp:${contact.phone || contact.telephone}`)
        .join('&');

      const queryParams = new URLSearchParams({
        contacts: selectedContactDetails,
        index: '0',
        total_contacts: contacts.length.toString(),
        template_sid: selectedTemplate.sid,
        template_variables: JSON.stringify(templateVariables),
        send_now: 'true',
      });

      const response = await fetch(
        `${ENDPOINTS.SEND_TEMPLATE}?${queryParams.toString()}`
      );
      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: `Campaign sent successfully to ${contacts.length} contacts!` });
        setContacts([]);
        setSelectedTemplate(null);
      } else {
        setMessage({ type: 'error', text: `Failed to send campaign: ${result.error}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while sending messages.' });
    } finally {
      setSending(false);
    }
  };

  const getPreviewBody = () => {
    if (!selectedTemplate) return '';
    const body = extractTemplateBody(selectedTemplate.types);
    return body.replace(/{{(\d+)}}/g, (match, p1) => {
      const value = templateVariables[p1] || match;
      return `<span style="font-weight:bold; color:#0263E0;">${value}</span>`;
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <Spinner decorative={false} title="Loading templates" size="sizeIcon110" />
      </Box>
    );
  }

  return (
    <Theme.Provider theme="default">
      <Box 
        padding="space70" 
        height="100vh" 
        overflowY="auto"
        maxWidth="1400px"
        marginLeft="auto"
        marginRight="auto"
      >
        <Box marginBottom="space60">
          <Heading as="h2" variant="heading20">
            Bulk Campaign Messaging
          </Heading>
        </Box>

        {message && (
          <Box marginBottom="space60">
            <Alert variant={message.type === 'error' ? 'error' : 'neutral'}>
              {message.text}
            </Alert>
          </Box>
        )}

        <Box>
          <Card padding="space60" marginBottom="space60">
            <Box marginBottom="space50">
              <Heading as="h3" variant="heading30">
                1. Select Template
              </Heading>
            </Box>
            <Box maxHeight="400px" overflowY="auto">
              <TemplateLibrary
                templates={templates}
                onTemplateSelect={handleTemplateSelect}
                selectedTemplate={selectedTemplate}
                mode="compact"
              />
            </Box>
          </Card>

          {selectedTemplate && Object.keys(templateVariables).length > 0 && (
            <Card padding="space60" marginBottom="space60">
              <Box marginBottom="space50">
                <Heading as="h3" variant="heading30">
                  2. Configure Variables
                </Heading>
              </Box>
              <Grid gutter="space40" vertical={[true, false, false]}>
                {Object.keys(templateVariables).map((key) => (
                  <Column key={key} span={[12, 6, 4]}>
                    <Box marginBottom="space40">
                      <Label htmlFor={`var-${key}`}>Variable {key}</Label>
                      <Input
                        id={`var-${key}`}
                        type="text"
                        value={templateVariables[key]}
                        onChange={(e) =>
                          setTemplateVariables({ ...templateVariables, [key]: e.target.value })
                        }
                        placeholder={`Value for {{${key}}}`}
                      />
                    </Box>
                  </Column>
                ))}
              </Grid>
            </Card>
          )}

          <Card padding="space60" marginBottom="space60">
            <Box marginBottom="space50">
              <Heading as="h3" variant="heading30">
                3. Add Contacts
              </Heading>
            </Box>

            <Tabs selectedId="csv" baseId="contact-tabs">
              <TabList aria-label="Contact selection methods">
                <Tab id="csv">CSV Upload</Tab>
                <Tab id="manual">Manual Entry</Tab>
                <Tab id="sync">Twilio Asset/Sync</Tab>
                <Tab id="profiles">Unified Profiles</Tab>
              </TabList>
              <TabPanels paddingTop="space50">
                <TabPanel>
                  <Box marginBottom="space50">
                    <Label htmlFor="csv-upload">Upload CSV File</Label>
                    <input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      style={{
                        display: 'block',
                        marginTop: '8px',
                        padding: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        width: '100%',
                      }}
                    />
                    <Text as="p" fontSize="fontSize20" color="colorTextWeak" marginTop="space20">
                      CSV should include 'phone' or 'telephone' column with E.164 format numbers
                    </Text>
                  </Box>
                </TabPanel>

                <TabPanel>
                  <Box marginBottom="space50">
                    <Label htmlFor="manual-contacts">Enter Phone Numbers</Label>
                    <TextArea
                      id="manual-contacts"
                      placeholder="Enter phone numbers (one per line)\n+5511999999999\n+5511888888888"
                      onChange={(e) => handleManualContact(e.target.value)}
                      rows={8}
                    />
                  </Box>
                </TabPanel>

                <TabPanel>
                  <Box marginBottom="space50">
                    <Label htmlFor="sync-doc">Select Twilio Sync Document</Label>
                    <Box display="flex" columnGap="space40">
                      <Box flex="1">
                        <Select
                          id="sync-doc"
                          value={selectedSyncDoc}
                          onChange={(e) => setSelectedSyncDoc(e.target.value)}
                        >
                          <Option value="">Select a document...</Option>
                          {syncDocuments.map((doc) => (
                            <Option key={doc.sid} value={doc.sid}>
                              {doc.uniqueName || doc.sid}
                            </Option>
                          ))}
                        </Select>
                      </Box>
                      <Button
                        variant="secondary"
                        onClick={fetchSyncDocuments}
                        loading={loadingSyncDocs}
                      >
                        Refresh
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleLoadFromSync}
                        disabled={!selectedSyncDoc}
                      >
                        Load Contacts
                      </Button>
                    </Box>
                    <Text as="p" fontSize="fontSize20" color="colorTextWeak" marginTop="space20">
                      Load contacts from a Twilio Sync document or Asset
                    </Text>
                  </Box>
                </TabPanel>

                <TabPanel>
                  <Box marginBottom="space50">
                    <Label htmlFor="profiles-query">Search Unified Profiles</Label>
                    <Box display="flex" columnGap="space40">
                      <Box flex="1">
                        <Input
                          id="profiles-query"
                          type="text"
                          value={unifiedProfilesQuery}
                          onChange={(e) => setUnifiedProfilesQuery(e.target.value)}
                          placeholder="Enter search criteria (e.g., segment:vip)"
                        />
                      </Box>
                      <Button
                        variant="primary"
                        onClick={handleLoadFromUnifiedProfiles}
                        loading={loadingProfiles}
                        disabled={!unifiedProfilesQuery}
                      >
                        Search
                      </Button>
                    </Box>
                    <Text as="p" fontSize="fontSize20" color="colorTextWeak" marginTop="space20">
                      Search for profiles using traits, segments, or other criteria
                    </Text>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>

            <Separator orientation="horizontal" verticalSpacing="space50" />

            <Box padding="space40" backgroundColor="colorBackgroundStrong" borderRadius="borderRadius20">
              <Text as="p" fontWeight="fontWeightBold">
                Contacts loaded: {contacts.length}
              </Text>
              {contacts.length > 0 && (
                <Box marginTop="space30">
                  {contacts.slice(0, 5).map((contact, idx) => (
                    <Text as="p" key={idx} fontSize="fontSize20">
                      {contact.name || contact.phone || contact.telephone} {contact.email && `(${contact.email})`}
                    </Text>
                  ))}
                  {contacts.length > 5 && <Text as="p">...and {contacts.length - 5} more</Text>}
                </Box>
              )}
            </Box>
          </Card>

          {selectedTemplate && (
            <Card padding="space60" marginBottom="space60">
              <Box marginBottom="space50">
                <Heading as="h3" variant="heading30">
                  4. Message Preview
                </Heading>
              </Box>
              <Box
                padding="space50"
                backgroundColor="colorBackground"
                borderRadius="borderRadius20"
                dangerouslySetInnerHTML={{ __html: getPreviewBody() }}
              />
            </Card>
          )}

          <Box>
            <Button
              variant="primary"
              fullWidth
              size="default"
              onClick={handleSendCampaign}
              disabled={!selectedTemplate || contacts.length === 0 || sending}
              loading={sending}
            >
              {sending ? 'Sending...' : `Send Campaign to ${contacts.length} Contacts`}
            </Button>
          </Box>
        </Box>
      </Box>
    </Theme.Provider>
  );
};

export default CampaignMode;
