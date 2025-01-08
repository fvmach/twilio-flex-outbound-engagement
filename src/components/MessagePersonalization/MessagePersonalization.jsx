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

  return (
    <Modal isOpen={isOpen} onDismiss={onClose} size="wide" ariaLabelledby="message-personalization">
      <ModalHeader>
        <ModalHeading as="h3">Personalize Message Variables</ModalHeading>
      </ModalHeader>
      <ModalBody>
        <Box marginBottom="space60">
          <Text as="p" fontSize="fontSize30" fontWeight="fontWeightBold">
            Template Preview:
          </Text>
          <Text as="p" fontSize="fontSize20" style={{ color: '#555' }}>
            {templateBody}
          </Text>
        </Box>
        {Object.keys(templateVariables).map((key) => (
          <Box key={key} display="flex" alignItems="center" marginBottom="space40" padding="space30" borderBottom="borderWidth10">
            <Label htmlFor={`variable-${key}`} style={{ marginRight: '8px' }}>
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
              style={{ flexGrow: 1 }}
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
