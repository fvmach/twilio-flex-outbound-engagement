import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Input,
  Text,
  Heading,
  Badge,
  Button,
  Stack,
  Separator,
} from '@twilio-paste/core';
import { SearchIcon } from '@twilio-paste/icons/esm/SearchIcon';

const capitalizeWords = (text) =>
  text
    .replace('twilio/', '')
    .replace('whatsapp/', '')
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

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

const TemplateLibrary = ({ templates = [], onTemplateSelect, selectedTemplate = null, mode = 'compact' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [filteredTemplates, setFilteredTemplates] = useState(templates);

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
        (t) => t.approval_requests?.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    setFilteredTemplates(filtered);
  }, [searchTerm, categoryFilter, templates]);

  const categories = ['all', ...new Set(templates.map((t) => t.approval_requests?.category).filter(Boolean))];

  return (
    <Box>
      <Box marginBottom="space60">
        <Input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          insertBefore={<SearchIcon decorative />}
        />
      </Box>

      <Box marginBottom="space60" display="flex" columnGap="space30" flexWrap="wrap">
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

      <Stack orientation="vertical" spacing="space40">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => {
            const body = extractTemplateBody(template.types);
            const isSelected = selectedTemplate?.sid === template.sid;
            const status = template.approval_requests?.status || 'unsubmitted';
            const category = template.approval_requests?.category || 'N/A';

            return (
              <Card
                key={template.sid}
                padding="space60"
                style={{
                  cursor: 'pointer',
                  border: isSelected ? '2px solid #0263E0' : '1px solid #E1E3EA',
                  backgroundColor: isSelected ? '#F0F6FF' : 'white',
                  boxShadow: isSelected ? '0 2px 8px rgba(2, 99, 224, 0.12)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#FAFBFC';
                    e.currentTarget.style.borderColor = '#96A0B5';
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#E1E3EA';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
                onClick={() => onTemplateSelect(template)}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box flex="1">
                    <Box display="flex" alignItems="center" columnGap="space30" marginBottom="space30">
                      <Heading as="h4" variant="heading40" style={{ color: isSelected ? '#0263E0' : 'inherit' }}>
                        {capitalizeWords(template.friendly_name)}
                      </Heading>
                      {isSelected && (
                        <Badge variant="info" as="span">
                          Selected
                        </Badge>
                      )}
                      <Badge
                        variant={status === 'approved' ? 'success' : status === 'pending' ? 'warning' : 'neutral'}
                        as="span"
                      >
                        {capitalizeWords(status)}
                      </Badge>
                      <Badge variant="neutral" as="span">
                        {capitalizeWords(category)}
                      </Badge>
                    </Box>
                    <Text as="p" color="colorTextWeak" fontSize="fontSize30">
                      {body.length > 150 && mode === 'compact' ? `${body.substring(0, 150)}...` : body}
                    </Text>
                  </Box>
                  {mode === 'full' && (
                    <Button variant="primary" size="small" onClick={() => onTemplateSelect(template)}>
                      Select
                    </Button>
                  )}
                </Box>
              </Card>
            );
          })
        ) : (
          <Box padding="space80" textAlign="center">
            <Text as="p" color="colorTextWeak">
              No templates found
            </Text>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default TemplateLibrary;
