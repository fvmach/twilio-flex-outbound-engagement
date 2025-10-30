# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Plugin Overview
This is a Twilio Flex plugin (`flex-outbound`) that provides outbound messaging capabilities for contact center agents. It's a Class B plugin (sample code, work in progress) that integrates with Twilio services including Content API, Messaging Service, and Sync Service.

## Architecture
The plugin follows Twilio Flex plugin architecture patterns:
- **Plugin Entry**: `src/index.js` loads the main plugin class
- **Plugin Core**: `src/FlexOutboundPlugin.js` contains initialization logic and UI registration
- **Component Architecture**: React components organized in `src/components/` with functional separation
- **UI Integration**: Uses SideModal pattern with fullscreen toggle for outbound messaging interface
- **Message Actions**: Adds "Send Template" button to MessageInputActions for in-conversation template sending

### Key Components
- `OutboundMessaging.jsx`: Main wizard-based interface (5 steps: Channel → Contacts → Template → Personalization → Send)
- `ContactModal.jsx`: Contact selection and CSV import functionality
- `TemplateModal.jsx`: Template browsing with search, categorization, and pinning
- `MessagePersonalization.jsx`: Variable mapping and template customization
- `MessageActionsSendTemplateButton.jsx`: In-conversation template sending
- `DatabaseConnection.js`: External database integration utilities

### State Management
Plugin uses React hooks for state management with props drilling pattern:
- `selectedContacts`: Array of contact objects
- `selectedTemplate`: Template object with variables
- `selectedChannel`: Channel selection (WhatsApp primary, others WIP)
- `templateVariables`: Variable mappings for personalization

## Development Commands

### Start Development Server
```bash
twilio flex:plugins:start
```

### Install Dependencies
```bash
npm install
```

### Run Tests
```bash
npm test
```

### Build for Production
```bash
# Build handled by Twilio Flex CLI - check webpack.config.js for customizations
```

## Configuration Requirements

### Environment Variables (.env)
```
TWILIO_WHATSAPP_NUMBER=whatsapp:+55119XXXXXXXXX
TWILIO_FUNCTIONS_URL=https://<your-serverless-service-name>-<numbers>.twil.io
SERVERLESS_SERVICE_SID=ZSXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
SENDGRID_API_KEY=SG.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
SEGMENT_SPACE_ID=spa_XXXXXXXXXXXXXXX
```

### Twilio Services Setup
- Enable Twilio Content API for template management
- Configure Twilio Sync Service for temporary data storage
- Set up Twilio Messaging Service SID for message delivery
- WhatsApp Business Account approval for template sending

### Serverless Functions Dependencies
The plugin expects external serverless functions at the configured `TWILIO_FUNCTIONS_URL`:
- `/list-templates-approvals`: Fetches approved templates from Content API
- `/whatsapp_send_template`: Handles template message sending with parameters

## Key Integration Points

### Flex UI Integration
- Adds button to `MainHeader.Content` for SideModal trigger
- Extends `MessageInputActions` with template sending capability
- Uses Twilio Paste Design System components throughout

### API Integrations
- Twilio Content API for template management
- External databases (MongoDB referenced in dependencies)
- CSV parsing for contact imports (papaparse library)
- Segment integration for analytics (Unified Profiles WIP)

### Message Flow
1. Channel selection (WhatsApp primary support)
2. Contact import/selection (CSV, database, manual)
3. Template selection with approval status checking
4. Variable personalization and mapping
5. Bulk message sending with progress tracking

## Development Guidelines

### Component Development
- Use Twilio Paste components for consistency
- Follow React functional component patterns with hooks
- Maintain separation between UI and business logic
- Handle loading states and error conditions gracefully

### Template Variable Handling
Template variables use `{{number}}` format (e.g., `{{1}}`, `{{2}}`). Variable extraction logic in `handleTemplateSelect()` creates mapping objects for personalization.

### Error Handling Patterns
- Graceful degradation when template fetching fails
- Manual Content SID input as fallback
- User-friendly error messages with actionable guidance

### Styling Approach
- Primary styling via Twilio Paste theme system
- Custom CSS in `SideModalStyles.css` for specific modal behaviors
- Fullscreen mode implementation for better user experience

## Testing Strategy
- Jest configuration in `jest.config.js`
- React Test Renderer for component testing
- Focus on component rendering and state management logic
- Mock external API calls for reliable testing

## Plugin Deployment
This plugin follows Twilio Flex plugin deployment patterns. Ensure all serverless functions are deployed and accessible before plugin deployment. The plugin expects specific API endpoints to be available at the configured `TWILIO_FUNCTIONS_URL`.