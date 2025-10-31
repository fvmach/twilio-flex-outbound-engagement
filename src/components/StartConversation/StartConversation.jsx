import React, { useState, useEffect } from 'react';
import { Actions } from '@twilio/flex-ui';
import {
  Box,
  Card,
  Heading,
  Text,
  Button,
  Label,
  Input,
  Select,
  Option,
  Alert,
  Spinner,
} from '@twilio-paste/core';
import { Theme } from '@twilio-paste/core/theme';
import TemplateLibrary from '../TemplateLibrary/TemplateLibrary';
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

const StartConversation = ({ manager }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateVariables, setTemplateVariables] = useState({});
  const [customerAddress, setCustomerAddress] = useState('');
  const [channel, setChannel] = useState('whatsapp');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState(null);

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

  const handleStartConversation = async () => {
    if (!customerAddress) {
      setMessage({ type: 'error', text: 'Please enter a customer phone number' });
      return;
    }

    setCreating(true);
    setMessage({ type: 'neutral', text: 'Creating conversation...' });

    try {
      const formattedAddress = channel === 'whatsapp' 
        ? `whatsapp:${customerAddress.replace(/^whatsapp:/, '')}`
        : customerAddress;

      // Prepare template data if selected
      let messageBody = null;
      if (selectedTemplate) {
        const body = extractTemplateBody(selectedTemplate.types);
        messageBody = body;
        
        // Replace variables
        Object.keys(templateVariables).forEach((key) => {
          messageBody = messageBody.replace(new RegExp(`{{${key}}}`, 'g'), templateVariables[key]);
        });
      }

      // Call serverless function to create conversation
      const response = await fetch(ENDPOINTS.START_CONVERSATION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerAddress: formattedAddress,
          channel,
          workerSid: manager.workerClient.sid,
          workerFriendlyName: manager.workerClient.friendlyName,
          templateSid: selectedTemplate?.sid,
          templateVariables,
          messageBody,
          Token: manager.user.token,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${response.status}`);
      }

      const result = await response.json();
      console.log('Conversation created:', result);

      setMessage({ type: 'neutral', text: 'Conversation created successfully!' });
      
      // Clear form
      setCustomerAddress('');
      setSelectedTemplate(null);
      setTemplateVariables({});
      
    } catch (error) {
      console.error('Error creating conversation:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to create conversation: ${error.message || 'Please try again.'}` 
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" padding="space80">
        <Spinner decorative={false} title="Loading templates" size="sizeIcon110" />
      </Box>
    );
  }

  return (
    <Theme.Provider theme="default">
      <Box 
        padding="space60" 
        height="100%" 
        overflowY="auto"
        maxWidth="900px"
        marginLeft="auto"
        marginRight="auto"
      >
        <Box marginBottom="space50">
          <Heading as="h3" variant="heading30">
            Start New Conversation
          </Heading>
        </Box>

        {message && (
          <Box marginBottom="space50">
            <Alert variant={message.type === 'error' ? 'error' : 'neutral'}>
              {message.text}
            </Alert>
          </Box>
        )}

        <Card padding="space50" marginBottom="space50">
          <Box marginBottom="space40">
            <Label htmlFor="channel">Channel</Label>
            <Select
              id="channel"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
            >
              <Option value="whatsapp">WhatsApp</Option>
              <Option value="sms">SMS</Option>
              <Option value="chat">Web Chat</Option>
            </Select>
          </Box>

          <Box marginBottom="space40">
            <Label htmlFor="customer-address">
              Customer {channel === 'whatsapp' ? 'Phone Number' : 'Address'}
            </Label>
            <Input
              id="customer-address"
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder={channel === 'whatsapp' ? '+5511999999999' : 'Enter customer address'}
            />
            <Text as="p" fontSize="fontSize20" color="colorTextWeak" marginTop="space20">
              {channel === 'whatsapp' ? 'Enter phone number in E.164 format' : 'Enter customer identifier'}
            </Text>
          </Box>
        </Card>

        <Card padding="space50" marginBottom="space50">
          <Box marginBottom="space40">
            <Heading as="h4" variant="heading40">
              Optional: Select Opening Template
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
          <Card padding="space50" marginBottom="space50">
            <Box marginBottom="space40">
              <Heading as="h4" variant="heading40">
                Configure Template Variables
              </Heading>
            </Box>
            {Object.keys(templateVariables).map((key) => (
              <Box key={key} marginBottom="space40">
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
            ))}
          </Card>
        )}

        <Button
          variant="primary"
          fullWidth
          onClick={handleStartConversation}
          disabled={!customerAddress || creating}
          loading={creating}
        >
          {creating ? 'Creating...' : 'Start Conversation'}
        </Button>
      </Box>
    </Theme.Provider>
  );
};

export default StartConversation;
