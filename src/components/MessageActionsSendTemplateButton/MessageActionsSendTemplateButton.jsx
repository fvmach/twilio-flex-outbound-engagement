import React, { useEffect, useState, forwardRef } from 'react';
import { withTaskContext } from '@twilio/flex-ui';
import {
  Menu,
  MenuButton,
  MenuItem,
  SubMenuButton,
  useMenuState,
} from '@twilio-paste/core/menu';
import { ChevronDownIcon } from '@twilio-paste/icons/esm/ChevronDownIcon';
import { Theme } from '@twilio-paste/core/theme';
import { Box, Text, Label, Input, Modal, ModalHeader, ModalHeading, ModalBody, ModalFooter, Button } from '@twilio-paste/core';
import { ENDPOINTS } from '../../config';

// Utility to capitalize the first letter of each word
const capitalizeWords = (text) =>
  text
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

// Fetch templates function
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

// Utility to extract the `body` from template `types`
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

// SubMenu Component for each category
const CategorySubMenu = forwardRef(({ category, templates, onSelect }, ref) => {
  const menu = useMenuState();

  return (
    <>
      <SubMenuButton ref={ref} {...menu}>
        {capitalizeWords(category)}
      </SubMenuButton>
      <Menu {...menu} aria-label={`${category} Templates`}>
        {templates.map((template) => (
          <MenuItem
            key={template.sid}
            {...menu}
            onClick={() => onSelect(template)}
          >
            <Box>
              <Text as="span" fontWeight="bold">
                {capitalizeWords(template.friendly_name)}
              </Text>
              <Text
                as="span"
                fontSize="fontSize20"
                color="colorTextWeak"
                display="block"
              >
                {extractTemplateBody(template.types)}
              </Text>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
});

const MessageActionsSendTemplateButton = ({ task }) => {
  const menu = useMenuState();
  const [groupedTemplates, setGroupedTemplates] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [variables, setVariables] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const getTemplates = async () => {
      const templates = await fetchTemplates();

      // Filter out templates named "verify_auto_created"
      const filteredTemplates = templates.filter(
        (template) => template.friendly_name !== 'verify_auto_created'
      );

    // Group templates by category
    const grouped = filteredTemplates.reduce((acc, template) => {
      let category = template.approval_requests?.category.toLowerCase() || 'Uncategorized';
      
      // Replace "n/a" with "Session Message"
      if (category === 'n/a') {
        category = 'Interactive Content';
      }

      if (!acc[category]) acc[category] = [];
      acc[category].push(template);
      return acc;
    }, {});

      setGroupedTemplates(grouped);
    };

    getTemplates();
  }, []);

  const handleSelect = (template) => {
    setSelectedTemplate(template);

    // Initialize variables for editing by parsing placeholders
    const variablesObj = {};
    const body = extractTemplateBody(template.types);
    const variableMatches = body.match(/{{\d+}}/g);
    if (variableMatches) {
      variableMatches.forEach((variable, index) => {
        variablesObj[variable] = ''; // Initialize variables with empty strings
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
      const cleanKey = key.replace(/[{}]/g, ''); // Remove curly braces from variable keys
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
            fallback: true, // Enable fallback to Content API if Conversations API fails
            recipient,
          }),
        }
      );
  
      const result = await response.json();
  
      if (response.ok && result.success) {
        console.log('Template successfully sent to conversation or fallback used:', result);
      } else {
        console.error('Failed to send template:', result.error);
      }
    } catch (error) {
      console.error('Error invoking Twilio Function:', error);
    }
  
    setIsModalOpen(false);
  };
  

  return (
    <Theme.Provider theme="default">
      <>
        <MenuButton {...menu} variant="primary" data-testid="send-template-menu-button">
          Send Template <ChevronDownIcon decorative />
        </MenuButton>
        <Menu {...menu} aria-label="Send Template Actions" data-testid="send-template-menu">
          {Object.keys(groupedTemplates).length > 0 ? (
            Object.entries(groupedTemplates).map(([category, templates]) => (
              <CategorySubMenu
                key={category}
                category={category}
                templates={templates}
                onSelect={handleSelect}
              />
            ))
          ) : (
            <MenuItem {...menu} disabled>
              No templates available
            </MenuItem>
          )}
        </Menu>

        {isModalOpen && selectedTemplate && (
          <Modal
            isOpen={isModalOpen}
            onDismiss={() => setIsModalOpen(false)}
            size="default"
          >
        <ModalHeader>
          <ModalHeading as="h3">
            Template Variables Personalization
        </ModalHeading>
        </ModalHeader>
        <ModalBody>
          <Text as="h2" marginBottom="space50">
            {capitalizeWords(selectedTemplate.friendly_name)}
          </Text>
          <Box
            marginBottom="space50"
            padding="space40"
            borderRadius="borderRadius20"
            backgroundColor="colorBackground"
            style={{ color: '#333', fontSize: '16px' }}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: extractTemplateBody(selectedTemplate.types).replace(/{{\d+}}/g, (match) => {
                  const value = variables[match] || match;
                  return `<span style="font-weight: bold; color: #0056D2;">${value}</span>`;
                }),
              }}
            />
          </Box>
          <Text as="h2" marginBottom="space50">
            Please fill in the variables below:
          </Text>
          {Object.keys(variables).length > 0 ? (
            Object.keys(variables).map((variable, index) => (
              <Box key={index} marginBottom="space50">
                <Label htmlFor={variable}>Variable {variable}</Label>
                <Input
                  id={variable}
                  value={variables[variable]}
                  onChange={(e) =>
                    setVariables({ ...variables, [variable]: e.target.value })
                  }
                />
              </Box>
            ))
          ) : (
            <Text as="span" color="colorTextWeak">
              No variables to edit.
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
      </>
    </Theme.Provider>
  );
};

// Wrap the component with Task Context
const WrappedSendTemplateButton = withTaskContext(MessageActionsSendTemplateButton);

export const addSendTemplateButton = (flex) => {
  flex.MessageInputActions.Content.add(
    <WrappedSendTemplateButton key="send-template-button" />,
    {
      sortOrder: 1,
    }
  );
};

export default WrappedSendTemplateButton;
