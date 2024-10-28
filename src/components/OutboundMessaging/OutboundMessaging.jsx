import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Label,
  Input,
  Text,
  Card,
  Heading,
  Grid,
  Column,
  Separator,
  Combobox,
} from '@twilio-paste/core';
import { Theme } from '@twilio-paste/core/theme';
import { SendIcon } from '@twilio-paste/icons/esm/SendIcon';
import TemplateModal from '../TemplateModal/TemplateModal';
import ContactModal from '../ContactModal/ContactModal';

const OutboundMessaging = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [manualContentSid, setManualContentSid] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [templateVariables, setTemplateVariables] = useState({});

  const channelOptions = ['WhatsApp', 'RCS', 'SMS', 'Email', 'Phone'];

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('https://flex-omnichannel-campaigns-3419.twil.io/list-templates-approvals');
        if (!response.ok) throw new Error('Failed to fetch templates');
        
        const data = await response.json();
        setTemplates(data.templates);
      } catch (err) {
        setError('Failed to fetch templates. Please input a Content SID manually.');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleInputChange = (event) => setManualContentSid(event.target.value);
  const openTemplateModal = () => setIsTemplateModalOpen(true);
  const closeTemplateModal = () => setIsTemplateModalOpen(false);
  const openContactModal = () => setIsContactModalOpen(true);
  const closeContactModal = () => setIsContactModalOpen(false);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setTemplateVariables({});

    const matches = template.body.match(/{{\d+}}/g);
    if (matches) {
      const vars = {};
      matches.forEach((match) => {
        const varNumber = match.replace(/[{}]/g, "");
        vars[varNumber] = "";
      });
      setTemplateVariables(vars);
    }

    closeTemplateModal();
  };

  const handleContactsSelect = (contacts) => {
    setSelectedContacts(contacts);
    closeContactModal();
  };

  const handleVariableChange = (index, value) => {
    setTemplateVariables((prevVars) => ({
      ...prevVars,
      [index]: value,
    }));
  };

  const getTemplateBodyWithVariables = () => {
    if (!selectedTemplate || !selectedTemplate.body) return "";

    return selectedTemplate.body.replace(/{{(\d+)}}/g, (match, p1) => {
      const value = templateVariables[p1] || `{{${p1}}}`;
      return `<span style="font-weight:bold; color:#006DFA; border:1px solid #99CDFF; padding:1px;">${value}</span>`;
    });
  };

  const sendMessages = async () => {
    if (selectedContacts.length === 0 && !manualContentSid) {
      alert('Please select contacts and/or provide a Content SID');
      return;
    }

    const selectedContactDetails = selectedContacts
      .map(contact => `phoneNumber=whatsapp:${contact.telephone || contact.phone}`)
      .join('&');

    const templateSid = selectedTemplate?.sid || manualContentSid;

    const queryParams = new URLSearchParams({
      contacts: selectedContactDetails,
      index: '0',
      total_contacts: selectedContacts.length.toString(),
      template_sid: templateSid,
      template_variables: JSON.stringify(templateVariables),
      send_now: 'true',
    });

    try {
      const response = await fetch(`https://flex-omnichannel-campaigns-3419.twil.io/whatsapp_send_template?${queryParams.toString()}`);
      const result = await response.json();

      if (result.success) {
        alert('Messages sent successfully!');
      } else {
        alert(`Failed to send messages: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending messages:', error);
      alert('An error occurred while sending messages.');
    }
  };

  return (
    <Theme.Provider theme="default">
      <Box padding="space70">
        <Box display="flex" alignItems="center" marginBottom="space60" marginRight="space60">
          <SendIcon decorative={false} title="Send Icon" size="sizeIcon70" />
          <Heading as="h2" marginLeft="space40" marginBottom="space0">
            Flex Outbound Communications
          </Heading>
        </Box>

        <Box marginBottom="space60">
          <Separator orientation="horizontal" />
        </Box>

        <Label htmlFor="combobox-channel" marginBottom="space30">
          STEP 1 - Select the channel to send the message or call:
        </Label>
        <Combobox
          items={channelOptions}
          onSelectedItemChange={({ selectedItem }) => setSelectedChannel(selectedItem)}
          initialSelectedItem={selectedChannel || "Select Channel"}
        />
        <Box marginBottom="space60" />

        <Label htmlFor="select-contacts" marginBottom="space30">
          STEP 2 - Select the contacts to send the {selectedChannel || "message"}:
        </Label>
        <Button variant="primary" onClick={openContactModal} marginBottom="space60">
          Select Contacts
        </Button>

        <Box marginBottom="space60" />

        <Label htmlFor="select-template" marginTop="space60" marginBottom="space40">
          STEP 3 - Select the {selectedChannel || "message"} templates to be sent:
        </Label>
        <Button variant="primary" onClick={openTemplateModal} marginBottom="space60">
          Select Template
        </Button>

        <Separator orientation="horizontal" verticalSpacing="space60" />

        <Label htmlFor="manual-sid" marginBottom="space30">
          Alternatively, please enter the SID of the template manually:
        </Label>
        <Input
          id="manual-sid"
          type="text"
          value={manualContentSid}
          onChange={handleInputChange}
          placeholder="Enter Content SID"
        />

        <Separator orientation="horizontal" verticalSpacing="space60" />

        <Text as="p" marginBottom="space40">
          Validate the selected contacts and templates:
        </Text>
        <Grid gutter="space60">
          <Column>
            <Heading as="h4" variant="heading40">
              Selected Contacts
            </Heading>
            <Card padding="space60">
              {selectedContacts.length > 0 ? (
                <>
                  <Text as="p">Total selected: {selectedContacts.length}</Text>
                  <Box marginBottom="space40" />
                  {selectedContacts.slice(0, 10).map((contact, index) => (
                    <Text as="p" key={index}>
                      {contact.name} - {contact.telephone || contact.phone}
                    </Text>
                  ))}
                  {selectedContacts.length > 10 && (
                    <Text as="p">...and {selectedContacts.length - 10} more</Text>
                  )}
                </>
              ) : (
                <Text as="p">No contacts selected</Text>
              )}
            </Card>
          </Column>

          <Column>
            <Heading as="h4" variant="heading40">
              Selected Template
            </Heading>
            <Card padding="space60">
              {selectedTemplate ? (
                <Text
                  as="p"
                  dangerouslySetInnerHTML={{ __html: getTemplateBodyWithVariables() }}
                />
              ) : (
                <Text as="p">No template selected</Text>
              )}
            </Card>
            <Box marginTop="space40">
              <Heading as="h5" variant="heading50">
                Input Variables
              </Heading>
              {Object.keys(templateVariables).map((key) => (
                <Box key={key} marginBottom="space30">
                  <Label htmlFor={`variable-${key}`}>Variable {key}</Label>
                  <Input
                    id={`variable-${key}`}
                    type="text"
                    value={templateVariables[key]}
                    onChange={(e) => handleVariableChange(key, e.target.value)}
                    placeholder={`Enter value for {{${key}}}`}
                    style={{ fontWeight: 'bold', borderColor: '#99CDFF' }}
                  />
                </Box>
              ))}
            </Box>
          </Column>
        </Grid>

        <Separator orientation="horizontal" verticalSpacing="space60" />

        <Button
          variant="primary"
          marginTop="space80"
          onClick={sendMessages}
          disabled={selectedContacts.length === 0 && !manualContentSid}
        >
          Send {selectedChannel || "Message"}
        </Button>

        <TemplateModal
          isOpen={isTemplateModalOpen}
          onClose={closeTemplateModal}
          templates={templates}
          onTemplateSelect={handleTemplateSelect}
        />

        <ContactModal
          isOpen={isContactModalOpen}
          onClose={closeContactModal}
          onContactsSelect={handleContactsSelect}
        />
      </Box>
    </Theme.Provider>
  );
};

export default OutboundMessaging;
