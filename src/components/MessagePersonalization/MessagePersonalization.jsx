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
        <Box>
          <Text as="p" fontSize="fontSize30" fontWeight="fontWeightBold">
            Template Preview:
          </Text>
          <Box padding={10} textAlign='center' border="borderWidth10" borderColor={templateBody ? 'colorBorderWeaker' : 'colorBorderStrong'}>
            {templateBody}
          </Box>
        </Box>
        {Object.keys(templateVariables).map((key) => (
          <Box key={key} alignItems="center" padding={10}>
            <Box padding={5}>
              <Label htmlFor={`variable-${key}`}>
                Variable {key}
              </Label>
              <Input
                id={`variable-${key}`}
                type="text"
                value={templateVariables[key]}
                onChange={(e) => handleVariableChange(key, e.target.value)}
                placeholder={`Enter value for {{${key}}}`}
                style={{ marginRight: '8px' }}
              />
            </Box>
            <Box padding={5}>
              <Select
                onChange={(e) => handleColumnSelect(key, e.target.value)}
                value={templateVariables[key].startsWith('{{') ? templateVariables[key] : ''}
                placeholder="Select from data source"
              >
                <option value="">Select Column</option>
                {columnOptions.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </Select>
            </Box>
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
