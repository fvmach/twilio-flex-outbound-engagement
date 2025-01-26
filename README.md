# Twilio Flex Outbound Engagement

The **Twilio Flex Outbound Engagement** plugin is a Twilio Flex plugin designed to streamline outbound messaging campaigns for contact center agents. This plugin provides a user-friendly interface to manage messaging channels, contacts, templates, and personalization while maintaining seamless integration with Twilio services.

## Features

### Outbound Messaging Component
- Supports sending messages through WhatsApp (multi-channel selection WIP: RCS, SMS, Email, and Voice)
- Wizard-based interface for:
  1. **Channel Selection**
  2. **Contact Management**
  3. **Template Selection**
  4. **Message Personalization**
  5. **Message Sending**

### Template Management
- Integration with Twilio Content API to fetch, categorize, and display content templates.
- Features for:
  - Template search
  - Pinning favorite templates
  - Real-time approval status display

### Personalization
- Map variables in templates to specific data sources (CSV, assets, or external databases).
- Link variables to data columns.
- Unified Profiles-based personalization WIP.

### Template Sending During Conversations
- Agents can send templates during an active conversation using the **Send Template** button in the Message Input Actions.
- The feature integrates directly into the MessageInputActions asset, enabling:
  - Template selection by category.
  - Search and pinning for frequently used templates.
  - Real-time personalization of templates before sending.

### Start New Conversation With Template (WIP)
- This feature will allow agents to start new 1:1 conversations by selecting and sending a template, including:
  - Task creation.
  - Task assignment through known agent routing.

## Disclaimer

This plugin is classified as a **Class B Plugin**. It is provided as **sample code** and is currently a **work in progress**. While it demonstrates features and functionalities that can be implemented, it is not production-ready and should be used with caution.

Feedback and contributions are welcome as we continue to improve and expand its capabilities. If you encounter any issues or have suggestions, please reach out via the contact information below.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/fvmach/twilio-flex-outbound-engagement
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
TWILIO_WHATSAPP_NUMBER=whatsapp:+55119XXXXXXXXX
TWILIO_FUNCTIONS_URL=https://<your-serverless-service-name>-<four-numbers>.twil.io
SERVERLESS_SERVICE_SID=ZSXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
SENDGRID_API_KEY=SG.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
SEGMENT_SPACE_ID=spa_XXXXXXXXXXXXXXX
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
4. During a live conversation, use the **Send Template** button in the MessageInputActions to:
   - Select and personalize a template.
   - Send the template directly to the customer.

## Development

- **serverless-functions/**: Contains serverless functions for backend operations.
  - **whatsapp/**:
    - **list-templates-approvals.js**: Function to list template approvals.
    - **send-whatsapp-templates.js**: Function to send WhatsApp templates.
- **src/**: Source files for the plugin.
  - **components/**: React components for the plugin.
    - **ContactModal/**:
      - **ContactModal.jsx**: Component for managing contacts.
    - **DatabaseConnection/**:
      - **DatabaseConnection.js**: Utility for interacting with external databases.
    - **MessageActionsSendTemplateButton/**:
      - **MessageActionsSendTemplateButton.jsx**: Button for sending templates during conversations.
    - **MessagePersonalization/**:
      - **MessagePersonalization.jsx**: Component for personalizing message templates.
    - **OutboundMessaging/**:
      - **OutboundMessaging.jsx**: Main component for outbound messaging workflows.
    - **TemplateMenu/**:
      - **TemplateMenu.jsx**: Component for managing templates.
    - **TemplateModal/**:
      - **TemplateModal.jsx**: Modal for displaying template details.
  - **FlexOutboundPlugin.js**: Core plugin logic and initialization.
  - **index.js**: Entry point for the plugin.
  - **SideModalStyles.css**: Styling for side modals used in the plugin.
- **webpack.config.js**: Webpack configuration for production builds.
- **webpack.dev.js**: Webpack configuration for development builds.

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
