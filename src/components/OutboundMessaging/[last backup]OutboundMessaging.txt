import React, { useEffect, useState } from 'react';
import { Box, Button, Label, Input, Text, Card, Heading, Grid, Column, Separator, Combobox } from '@twilio-paste/core';
import { Theme } from '@twilio-paste/core/theme';
import { SendIcon } from '@twilio-paste/icons/esm/SendIcon';  // Import the SendIcon
import TemplateModal from '../TemplateModal/TemplateModal';
import ContactModal from '../ContactModal/ContactModal'; // Import the ContactModal

const OutboundMessaging = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [manualContentSid, setManualContentSid] = useState("");  // For manual input
  const [selectedContacts, setSelectedContacts] = useState([]);  // Selected contacts
  const [selectedTemplate, setSelectedTemplate] = useState(null);  // Selected template
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);  // Template modal state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);  // Contact modal state
  const [selectedChannel, setSelectedChannel] = useState("");  // Channel selection

  // Options for channels in the Combobox
  const channelOptions = ['WhatsApp', 'RCS', 'SMS', 'Email', 'Phone'];

  useEffect(() => {
    // Fetch content templates
    const fetchTemplates = async () => {
      try {
        const response = await fetch('https://flex-omnichannel-campaigns-3419.twil.io/list-templates-approvals', {
          method: 'GET'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch templates');
        }

        const data = await response.json();
        setTemplates(data.templates);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch templates. Please input a Content SID manually.');
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Manual Content SID input handler
  const handleInputChange = (event) => {
    setManualContentSid(event.target.value);
  };

  // Open and close modals
  const openTemplateModal = () => setIsTemplateModalOpen(true);
  const closeTemplateModal = () => setIsTemplateModalOpen(false);

  const openContactModal = () => setIsContactModalOpen(true);
  const closeContactModal = () => setIsContactModalOpen(false);

  // Template selection handler
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);  // Set selected template
    closeTemplateModal();  // Close the template modal
  };

  // Contact selection handler
  const handleContactsSelect = (contacts) => {
    setSelectedContacts(contacts);  // Set selected contacts
    closeContactModal();  // Close the contact modal
  };

  // Sending messages
  const sendMessages = async () => {
    if (selectedContacts.length === 0 && !manualContentSid) {
      alert('Please select contacts and/or provide a Content SID');
      return;
    }

    // Ensure phone number field is correctly referenced
    const selectedContactDetails = selectedContacts
      .map(contact => `phoneNumber=whatsapp:${contact.telephone || contact.phone}`)  // Check for both 'telephone' and 'phone' fields
      .join('&');  // Format the contact details as URL-encoded parameters

    const templateSid = selectedTemplate?.sid || manualContentSid;  // Use selected template's SID or manual SID

    const queryParams = new URLSearchParams({
      contacts: selectedContactDetails,
      index: '0',
      total_contacts: selectedContacts.length.toString(),
      template_sid: templateSid,
      template_variables: '{}',
      send_now: 'true',
    });

    try {
      const response = await fetch(`https://flex-omnichannel-campaigns-3419.twil.io/whatsapp_send_template?${queryParams.toString()}`, {
        method: 'GET',
      });

      const result = await response.json();
      if (result.success) {
        alert('Messages sent successfully!');
      } else {
        alert('Failed to send messages: ' + result.error);
      }
    } catch (error) {
      console.error('Error sending messages:', error);
      alert('An error occurred while sending messages.');
    }
  };

  return (
    <Theme.Provider theme="default">
      <Box padding="space70">
        {/* Title and Icon */}
        <Box display="flex" alignItems="center" marginBottom="space60" marginRight="space60">
          <SendIcon decorative={false} title="Send Icon" size="sizeIcon70" />  {/* Increased icon size */}
          <Heading as="h2" marginLeft="space40" marginBottom="space0">
            Flex Outbound Communications
          </Heading>
        </Box>

        <Box marginBottom="space60">
          <Separator orientation="horizontal" />
        </Box>

        {/* Select Channel using Combobox */}
        <Label htmlFor="combobox-channel" marginBottom="space30">
          STEP 1 - Select the channel to send the message or call:
        </Label>
        <Combobox
          items={channelOptions}
          onSelectedItemChange={({ selectedItem }) => setSelectedChannel(selectedItem)}
          initialSelectedItem={selectedChannel || "Select Channel"}
        />
        <Box marginBottom="space60" />

        {/* Contact Selection */}
        <Label htmlFor='select-contacts' marginBottom="space30">
          STEP 2 - Select the contacts to send the {selectedChannel || "message"}:
        </Label>
        <Button variant="primary" onClick={openContactModal} marginBottom="space60">Select Contacts</Button>

        <Box marginBottom="space60" />

        {/* Template Selection */}
        <Label htmlFor='select-template' marginTop="space60" marginBottom="space40">
          STEP 3 - Select the {selectedChannel || "message"} templates to be sent:
        </Label>
        <Button variant="primary" onClick={openTemplateModal} marginBottom="space60">Select Template</Button>

        <Separator orientation="horizontal" verticalSpacing="space60" />

        {/* Manual Content SID Input */}
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

        {/* Validation Section */}
        <Text as="p" marginBottom="space40">Validate the selected contacts and templates:</Text>
        <Grid gutter="space60">
          <Column>
            <Heading as="h4" variant="heading40">Selected Contacts</Heading>
            <Card padding="space60">
              {selectedContacts.length > 0 ? (
                selectedContacts.map((contact, index) => (
                  <Text as="p" key={index}>
                    {contact.name} - {contact.telephone || contact.phone}  {/* Adjust field if necessary */}
                  </Text>
                ))
              ) : (
                <Text as="p">No contacts selected</Text>
              )}
            </Card>
          </Column>

          <Column>
            <Heading as="h4" variant="heading40">Selected Template</Heading>
            <Card padding="space60">
              {selectedTemplate ? (
                <Text as="p">Template SID: {selectedTemplate.sid}</Text>
              ) : (
                <Text as="p">No template selected</Text>
              )}
            </Card>
          </Column>
        </Grid>

        <Separator orientation="horizontal" verticalSpacing="space60" />

        {/* Action Button to Send Messages */}
        <Button variant="primary" marginTop="space80" onClick={sendMessages} disabled={selectedContacts.length === 0 && !manualContentSid}>
          Send {selectedChannel || "Message"}
        </Button>

        {/* Modal for selecting templates */}
        <TemplateModal
          isOpen={isTemplateModalOpen}
          onClose={closeTemplateModal}
          templates={templates}
          onTemplateSelect={handleTemplateSelect}
        />

        {/* Modal for selecting contacts */}
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
