import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@twilio-paste/core/modal';
import { Button } from '@twilio-paste/core/button';
import { Box } from '@twilio-paste/core/box';
import { Input } from '@twilio-paste/core/input';
import { DataGrid, DataGridHead, DataGridRow, DataGridHeader, DataGridBody, DataGridCell } from '@twilio-paste/core/data-grid';
import { Text } from '@twilio-paste/core/text';
import { Select, Option } from '@twilio-paste/core/select';
import { Heading } from '@twilio-paste/core/heading';

// Helper function to handle nested objects with multiple keys dynamically
function getNestedValue(obj, keyPaths) {
  if (!obj || !keyPaths) return 'N/A';

  for (const key of keyPaths) {
    const parts = key.split('.');
    let value = obj;
    for (const part of parts) {
      if (value && value[part] !== undefined) {
        value = value[part];
      } else {
        value = undefined;
        break;
      }
    }
    if (value !== undefined) return value;
  }

  return 'N/A';
}

const TemplateModal = ({ templates, isOpen, onClose, onTemplateSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTemplates, setFilteredTemplates] = useState(templates);
  const [selectedFilters, setSelectedFilters] = useState({
    language: '',
    category: '',
    status: '',
  });

  // Filter templates based on search term, language, category, and status
  useEffect(() => {
    setFilteredTemplates(
      templates.filter((template) =>
        (template.friendly_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (template.language || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          getNestedValue(template, ['approval_requests.category']).toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!selectedFilters.language || template.language === selectedFilters.language) &&
        (!selectedFilters.category || getNestedValue(template, ['approval_requests.category']) === selectedFilters.category) &&
        (!selectedFilters.status || getNestedValue(template, ['approval_requests.status']) === selectedFilters.status)
      )
    );
  }, [searchTerm, templates, selectedFilters]);

  const handleTemplateSelect = (template) => {
    const { body, contentType } = extractBodyAndContentType(template.types || {});
    onTemplateSelect({ ...template, body, contentType }); // Add body and contentType to selected template
    onClose();
  };
  

  const handleClearAll = () => {
    setSearchTerm('');
    setSelectedFilters({
      language: '',
      category: '',
      status: '',
    });
  };

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  // Extract body and content type dynamically based on the template structure
  const extractBodyAndContentType = (types) => {
    const bodyPaths = [
      'twilio/flows.body',
      'twilio/quick-reply.body',
      'twilio/text.body',
      'whatsapp/card.body',
      'twilio/catalog.body',
      'twilio/list-picker.body',
      'twilio/card.body'  // Adding call-now body path
    ];

    const contentTypePaths = [
      'twilio/flows',
      'twilio/quick-reply',
      'twilio/text',
      'whatsapp/card',
      'twilio/catalog',
      'twilio/list-picker',
      'twilio/card'  // Adding call-now content type
    ];

    const body = getNestedValue(types, bodyPaths);

    let contentType = 'N/A';
    for (const path of contentTypePaths) {
      if (types[path]) {
        contentType = path.replace('/', '/');
        break;
      }
    }

    if (contentType === 'twilio/quick-reply') {
      const quickReplyBody = types['twilio/quick-reply']?.body;
      if (quickReplyBody) {
        return { body: quickReplyBody, contentType: 'twilio/quick-reply' };
      }
    }

    if (contentType === 'twilio/card') {
      const callNowBody = types['twilio/card']?.body || 'Call Now Action';  // Default text for call now
      return { body: callNowBody, contentType: 'twilio/card' };
    }

    return { body, contentType };
  };

  return (
    <Modal isOpen={isOpen} onDismiss={onClose} ariaLabel="Template Modal" size="wide" style={{ width: '90vw', maxWidth: '1200px' }}>
      <ModalHeader>Select a WhatsApp Template</ModalHeader>
      <ModalBody>
        <Heading as="h3" variant="heading40">Filters</Heading>
        <Box display="flex" columnGap="space30" marginBottom="space50">
          <Box>
            <Select id="language-select" value={selectedFilters.language} onChange={(e) => handleFilterChange('language', e.target.value)}>
              <Option value="">All Languages</Option>
              <Option value="en">English</Option>
              <Option value="es">Spanish</Option>
              <Option value="pt_BR">Portuguese (BR)</Option>
            </Select>
          </Box>

          <Box>
            <Select id="category-select" value={selectedFilters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
              <Option value="">All Categories</Option>
              <Option value="MARKETING">MARKETING</Option>
              <Option value="UTILITY">UTILITY</Option>
              <Option value="N/A">SESSION MESSAGE</Option>
            </Select>
          </Box>

          <Box>
            <Select id="status-select" value={selectedFilters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
              <Option value="">All Statuses</Option>
              <Option value="approved">Approved</Option>
              <Option value="pending">Pending</Option>
              <Option value="rejected">Rejected</Option>
              <Option value="unsubmitted">Unsubmitted</Option>
            </Select>
          </Box>

          <Box>
            <Button variant="secondary" onClick={handleClearAll}>
              Clear Filters
            </Button>
          </Box>
        </Box>

        <Box marginBottom="space40">
          <Input
            id="search-template"
            type="text"
            value={searchTerm}
            placeholder="Search templates"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>

        {filteredTemplates && filteredTemplates.length > 0 ? (
          <DataGrid aria-label="Template DataGrid">
            <DataGridHead>
              <DataGridRow>
                <DataGridHeader>
                  <Box width="100px">Actions</Box>
                </DataGridHeader>
                <DataGridHeader>
                  <Box width="100px">Friendly Name</Box>
                </DataGridHeader>
                <DataGridHeader>
                  <Box width="300px">Body</Box>
                </DataGridHeader>
                <DataGridHeader>
                  <Box width="100px">Content Type</Box>
                </DataGridHeader>
                <DataGridHeader>
                  <Box width="100px">Language</Box>
                </DataGridHeader>
                <DataGridHeader>
                  <Box width="100px">Category</Box>
                </DataGridHeader>
                <DataGridHeader>
                  <Box width="100px">Status</Box>
                </DataGridHeader>
                <DataGridHeader>
                  <Box width="100px">SID</Box>
                </DataGridHeader>
              </DataGridRow>
            </DataGridHead>
            <DataGridBody>
              {filteredTemplates.map((template, index) => {
                const sid = template.sid || 'N/A';
                const friendlyName = template.friendly_name || 'N/A';
                const language = template.language || 'N/A';
                const approvalCategory = getNestedValue(template, ['approval_requests.category']) || 'N/A';
                const approvalStatus = getNestedValue(template, ['approval_requests.status']) || 'N/A';

                const { body, contentType } = extractBodyAndContentType(template.types || {});

                return (
                  <DataGridRow key={index}>
                    <DataGridCell>
                      <Box width="100px">
                        <Button variant="primary" onClick={() => handleTemplateSelect(template)}>
                          Select
                        </Button>
                      </Box>
                    </DataGridCell>
                    <DataGridCell>
                      <Box width="100px">{friendlyName}</Box>
                    </DataGridCell>
                    <DataGridCell>
                      <Box width="300px">{body}</Box>
                    </DataGridCell>
                    <DataGridCell>
                      <Box width="100px">{contentType}</Box>
                    </DataGridCell>
                    <DataGridCell>
                      <Box width="100px">{language}</Box>
                    </DataGridCell>
                    <DataGridCell>
                      <Box width="100px">{approvalCategory}</Box>
                    </DataGridCell>
                    <DataGridCell>
                      <Box width="100px">{approvalStatus}</Box>
                    </DataGridCell>
                    <DataGridCell>
                      <Box width="100px">{sid}</Box>
                    </DataGridCell>
                  </DataGridRow>
                );
              })}
            </DataGridBody>
          </DataGrid>
        ) : (
          <Text>No templates available.</Text>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default TemplateModal;
