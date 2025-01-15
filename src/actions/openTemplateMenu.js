import { Actions } from '@twilio/flex-ui';

export const registerOpenTemplateMenuAction = (setTemplateMenuOpen, setTemplates) => {
  Actions.registerAction('OpenTemplateMenu', (payload) => {
    const { templates = [], onTemplateSelect } = payload;

    // Update the templates and open the menu
    setTemplates(templates); // Pass templates to state
    setTemplateMenuOpen(true);

    // Optionally handle selected template in the action payload
    if (onTemplateSelect) {
      onTemplateSelect();
    }
  });
};
