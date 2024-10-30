import React from 'react';
import {
  Box,
  Button,
  Label,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalHeading,
  Select,
  Text,
  Separator,
} from '@twilio-paste/core';

const MessagePersonalization = ({
  isOpen,
  onClose,
  templateVariables,
  setTemplateVariables,
  columnOptions,
  templateBody,
}) => {
  const handleVariableChange = (key, value) => {
    setTemplateVariables((prevVars) => ({
      ...prevVars,
      [key]: value,
    }));
  };

  const handleColumnSelect = (key, column) => {
    setTemplateVariables((prevVars) => ({
      ...prevVars,
      [key]: `{{${column}}}`,
    }));
  };

  // Helper function to generate preview with variables filled in
  const getTemplatePreviewWithVariables = () => {
    if (!templateBody) return "No template body available";

    return templateBody.replace(/{{(\d+)}}/g, (match, p1) => {
      const value = templateVariables[p1] || `{{${p1}}}`;
      return `<span style="font-weight:bold; color:#006DFA; border:1px solid #99CDFF; padding:1px;">${value}</span>`;
    });
  };

  return (
    <Modal isOpen={isOpen} onDismiss={onClose} size="wide" ariaLabelledby="message-personalization">
      <ModalHeader>
        <ModalHeading as="h3">Personalize Message Variables</ModalHeading>
      </ModalHeader>
      <ModalBody>
        <Box marginBottom="space60">
          <Text as="p" fontSize="fontSize30" fontWeight="fontWeightBold" marginBottom="space20">
            Template Preview:
          </Text>
          <Text
            as="p"
            fontSize="fontSize20"
            style={{ color: '#555', lineHeight: '1.5' }}
            dangerouslySetInnerHTML={{ __html: getTemplatePreviewWithVariables() }}
          />
        </Box>
        <Separator orientation="horizontal" verticalSpacing="space60" />
        {Object.keys(templateVariables).map((key) => (
          <Box key={key} display="flex" alignItems="center" marginBottom="space40" paddingY="space30">
            <Label htmlFor={`variable-${key}`} marginRight="space30" style={{ minWidth: '120px' }}>
              Variable {key}
            </Label>
            <Input
              id={`variable-${key}`}
              type="text"
              value={templateVariables[key]}
              onChange={(e) => handleVariableChange(key, e.target.value)}
              placeholder={`Enter value for {{${key}}}`}
              style={{
                fontWeight: 'bold',
                borderColor: '#99CDFF',
                flexGrow: 2,
                marginRight: '8px',
                padding: '8px',
              }}
            />
            <Select
              onChange={(e) => handleColumnSelect(key, e.target.value)}
              value={templateVariables[key].startsWith('{{') ? templateVariables[key] : ''}
              placeholder="Select from data source"
              style={{ flexGrow: 1, padding: '8px' }}
            >
              <option value="">Select Column</option>
              {columnOptions.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </Select>
          </Box>
        ))}
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>Close</Button>
        <Button variant="primary" onClick={onClose}>Save Changes</Button>
      </ModalFooter>
    </Modal>
  );
};

export default MessagePersonalization;
