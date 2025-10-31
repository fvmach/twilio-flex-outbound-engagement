import React, { useEffect, useState } from 'react';
import { withTaskContext } from '@twilio/flex-ui';
import {
  Box,
  Button,
  Card,
  Heading,
  Text,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalHeading,
  ModalBody,
  ModalFooter,
  Badge,
  Spinner,
} from '@twilio-paste/core';
import { Theme } from '@twilio-paste/core/theme';
import { SendIcon } from '@twilio-paste/icons/esm/SendIcon';
import { ENDPOINTS } from '../../config';

const capitalizeWords = (text) =>
  text
    .replace('twilio/', '')
    .replace('whatsapp/', '')
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const extractTemplateBody = (types) => {
  const bodyPaths = [
    'whatsapp/authentication.body',
    'twilio/text.body',
    'twilio/quick-reply.body',
    'twilio/card.body',
    'twilio/list-picker.body',
    'twilio/catalog.body',
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

const fetchTemplates = async () => {
  try {
    const response = await fetch(
      ENDPOINTS.LIST_TEMPLATES,
      { method: 'GET' }
    );
    const data = await response.json();
    return data.templates || [];
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return [];
  }
};

const AgentTemplatePanel = ({ task }) => {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [variables, setVariables] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const getTemplates = async () => {
      const fetchedTemplates = await fetchTemplates();
      const filtered = fetchedTemplates.filter(
        (template) => template.friendly_name !== 'verify_auto_created'
      );
      setTemplates(filtered);
      setFilteredTemplates(filtered);
      setLoading(false);
    };
    getTemplates();
  }, []);

  useEffect(() => {
    let filtered = templates;

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.friendly_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          extractTemplateBody(t.types).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(
        (t) =>
          t.approval_requests?.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    setFilteredTemplates(filtered);
  }, [searchTerm, categoryFilter, templates]);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    const body = extractTemplateBody(template.types);
    const variableMatches = body.match(/{{(\d+)}}/g);
    
    const variablesObj = {};
    if (variableMatches) {
      variableMatches.forEach((variable) => {
        variablesObj[variable] = '';
      });
    }
    setVariables(variablesObj);
    setIsModalOpen(true);
  };

  const handleSendTemplate = async () => {
    if (!task || !task.attributes) {
      console.error('No active task or missing task attributes.');
      return;
    }

    const recipient =
      task.attributes?.from ||
      task.attributes?.customerAddress ||
      task.attributes?.customers?.phone;

    if (!recipient) {
      console.error('Recipient information is missing in task attributes.');
      return;
    }

    const mappedVariables = Object.entries(variables).reduce((acc, [key, value]) => {
      const cleanKey = key.replace(/[{}]/g, '');
      acc[cleanKey] = value;
      return acc;
    }, {});

    try {
      const response = await fetch(
        ENDPOINTS.POST_TEMPLATE_TO_CONVERSATION,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversationSid: task.attributes.conversationSid,
            contentSid: selectedTemplate.sid,
            contentVariables: mappedVariables,
            fallback: true,
            recipient,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('Template successfully sent:', result);
      } else {
        console.error('Failed to send template:', result.error);
      }
    } catch (error) {
      console.error('Error invoking Twilio Function:', error);
    }

    setIsModalOpen(false);
    setSelectedTemplate(null);
  };

  const categories = ['all', ...new Set(templates.map((t) => t.approval_requests?.category).filter(Boolean))];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" padding="space80">
        <Spinner decorative={false} title="Loading templates" />
      </Box>
    );
  }

  return (
    <Theme.Provider theme="default">
      <Box>
        <Box marginBottom="space40">
          <Input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>

        <Box marginBottom="space40" display="flex" columnGap="space20" flexWrap="wrap">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? 'primary' : 'secondary'}
              size="small"
              onClick={() => setCategoryFilter(cat)}
            >
              {capitalizeWords(cat)}
            </Button>
          ))}
        </Box>

        <Box maxHeight="400px" overflowY="auto">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((template) => {
              const body = extractTemplateBody(template.types);
              const status = template.approval_requests?.status || 'unsubmitted';
              const category = template.approval_requests?.category || 'N/A';

              return (
                <Card
                  key={template.sid}
                  padding="space50"
                  marginBottom="space30"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box flex="1">
                      <Box display="flex" alignItems="center" columnGap="space20" marginBottom="space20">
                        <Text as="span" fontWeight="fontWeightBold" fontSize="fontSize30">
                          {capitalizeWords(template.friendly_name)}
                        </Text>
                        <Badge
                          variant={status === 'approved' ? 'success' : 'neutral'}
                          as="span"
                        >
                          {capitalizeWords(status)}
                        </Badge>
                      </Box>
                      <Text as="p" color="colorTextWeak" fontSize="fontSize20">
                        {body.length > 80 ? `${body.substring(0, 80)}...` : body}
                      </Text>
                    </Box>
                    <SendIcon decorative={false} title="Send template" />
                  </Box>
                </Card>
              );
            })
          ) : (
            <Box padding="space60" textAlign="center">
              <Text as="p" color="colorTextWeak">
                No templates found
              </Text>
            </Box>
          )}
        </Box>

        {isModalOpen && selectedTemplate && (
          <Modal isOpen={isModalOpen} onDismiss={() => setIsModalOpen(false)} size="default">
            <ModalHeader>
              <ModalHeading as="h3">Personalize Template</ModalHeading>
            </ModalHeader>
            <ModalBody>
              <Heading as="h4" variant="heading40" marginBottom="space40">
                {capitalizeWords(selectedTemplate.friendly_name)}
              </Heading>
              
              <Box
                marginBottom="space50"
                padding="space40"
                borderRadius="borderRadius20"
                backgroundColor="colorBackground"
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: extractTemplateBody(selectedTemplate.types).replace(
                      /{{(\d+)}}/g,
                      (match) => {
                        const value = variables[match] || match;
                        return `<span style="font-weight: bold; color: #0263E0;">${value}</span>`;
                      }
                    ),
                  }}
                />
              </Box>

              {Object.keys(variables).length > 0 ? (
                Object.keys(variables).map((variable, index) => (
                  <Box key={index} marginBottom="space40">
                    <Label htmlFor={variable}>Variable {variable}</Label>
                    <Input
                      id={variable}
                      value={variables[variable]}
                      onChange={(e) =>
                        setVariables({ ...variables, [variable]: e.target.value })
                      }
                      placeholder={`Enter value for ${variable}`}
                    />
                  </Box>
                ))
              ) : (
                <Text as="p" color="colorTextWeak">
                  No variables to configure
                </Text>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSendTemplate}>
                Send Template
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </Box>
    </Theme.Provider>
  );
};

const WrappedAgentTemplatePanel = withTaskContext(AgentTemplatePanel);

export default WrappedAgentTemplatePanel;
