# Twilio Flex Outbound Engagement

The **Twilio Flex Outbound Engagement* is a Twilio Flex plugin designed to streamline outbound messaging campaigns for contact center agents. This plugin provides a user-friendly interface to manage messaging channels, contacts, templates, and personalization while maintaining seamless integration with Twilio services.

## Features

### Outbound Messaging Component
- Supports sending messages through multiple channels (e.g., SMS, WhatsApp).
- Wizard-based interface for:
  1. **Channel Selection**
  2. **Contact Management**
  3. **Template Selection**
  4. **Message Validation**
  5. **Message Sending**

### Template Management
- Integration with Twilio Content API to fetch, categorize, and display content templates.
- Features for:
  - Template search
  - Pinning favorite templates
  - Real-time approval status display

### Personalization
- Map variables in templates to specific data sources (CSV, assets, or external databases).
- Easy-to-use "+" button to link variables to data columns.

### Supervisor Features
- SOS button for agents to report application issues, triggering debug logs and diagnostics.
- Supervisor coaching messages visible only to agents during active conversations.
- Coaching messages available in the conversation transcript for monitoring.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repository/flex-outbound-plugin.git
   ```

2. Navigate to the project directory:
   ```bash
   cd flex-outbound-plugin
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the local development server:
   ```bash
   twilio flex:plugins:start
   ```

## Configuration

### Environment Variables
Ensure the following environment variables are set in your `.env` file for secure API access:

```plaintext
REACT_APP_TWILIO_ACCOUNT_SID=your_account_sid
REACT_APP_TWILIO_AUTH_TOKEN=your_auth_token
REACT_APP_TWILIO_CONTENT_API_BASE_URL=https://content.twilio.com/v1
```

### Twilio Services
- Enable the **Twilio Content API** for managing templates.
- Use the **Twilio Sync Service** for storing temporary mappings and settings.
- Configure **Twilio Messaging Service SID** for outbound message delivery.

## Usage

1. Launch the plugin from the Twilio Flex interface.
2. Select the "Outbound Messaging" option in the Flex sidebar.
3. Follow the wizard to:
   - Choose a messaging channel.
   - Select contacts (or import from an external source).
   - Pick and customize a message template.
   - Validate and preview the message.
   - Send the message and monitor delivery status.

## Development

### File Structure
- **index.js**: Entry point for the plugin.
- **FlexOutboundPlugin.js**: Core plugin logic and initialization.
- **OutboundMessaging.jsx**: Main component for the outbound messaging workflow.
- **TemplateMenu.jsx**: Component for displaying and managing templates.
- **ContactModal.jsx**: Modal for managing contact lists.
- **MessageActionsSendTemplateButton.jsx**: Button component to send templates in conversations.
- **DatabaseConnection.js**: Utility for interacting with external databases.
- **SideModalStyles.css**: Styling for side modals used in the plugin.

### Testing
Run unit tests with:
```bash
npm test
```

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature name"
   ```
4. Push the branch:
   ```bash
   git push origin feature-name
   ```
5. Open a Pull Request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

**Contact**
If you have any questions or need support, please contact the maintainer at [your-email@example.com].

