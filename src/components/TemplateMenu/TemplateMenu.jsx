import React from 'react';
import { MenuButton, Menu, MenuItem, MenuGroup } from '@twilio-paste/core/menu';
import { useUID } from '@twilio-paste/core/uid-library';

const TemplateMenu = ({ templates, isOpen, onClose, onTemplateSelect }) => {
  const menuId = useUID();

  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    const category = template.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(template);
    return acc;
  }, {});

  if (!isOpen) return null; // Don't render the menu if it's not open

  return (
    <div>
      <MenuButton id={menuId} data-testid="template-menu-button" onClick={onClose}>
        Close Menu
      </MenuButton>
      <Menu aria-label="Templates" data-testid="template-menu">
        {Object.entries(groupedTemplates).map(([category, templates]) => (
          <MenuGroup label={category} key={category}>
            {templates.map((template) => (
              <MenuItem
                key={template.sid}
                onClick={() => {
                  onTemplateSelect(template);
                  onClose(); // Close menu after selection
                }}
                data-testid={`template-${template.sid}`}
              >
                {template.friendly_name}
              </MenuItem>
            ))}
          </MenuGroup>
        ))}
      </Menu>
    </div>
  );
};

export default TemplateMenu;
