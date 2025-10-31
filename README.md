# Twilio Flex Outbound Engagement

The **Twilio Flex Outbound Engagement** plugin is a Twilio Flex plugin designed to streamline outbound messaging campaigns and conversations for contact center agents. This plugin provides a user-friendly interface to manage messaging channels, contacts, templates, and personalization while maintaining seamless integration with Twilio services.

## Features

### 1. Start New Outbound Conversations
- **Agent-initiated conversations**: Agents can start new 1:1 WhatsApp conversations directly from Flex
- **Template integration**: Select and send approved templates when initiating conversations
- **Automatic routing**: Creates Flex tasks using the Interactions API with proper routing to the initiating agent
- **Variable personalization**: Customize template variables before sending
- Features:
  - Channel selection (WhatsApp, SMS, Web Chat)
  - Customer phone number input with E.164 validation
  - Template library browser with search and filtering
  - Variable mapping interface
  - Template preview before sending

### 2. Bulk Campaign Mode
- **Mass messaging**: Send WhatsApp templates to multiple contacts simultaneously
- **CSV contact import**: Upload contact lists via CSV files
- **Campaign workflow**:
  1. Contact selection and import
  2. Template selection from approved library
  3. Variable personalization for bulk sending
  4. Campaign execution with progress tracking
- **Template compliance**: Only approved WhatsApp templates can be sent

### 3. In-Conversation Template Sending
- **Send Template button**: Available in the message input area during active conversations
- **Quick access**: Template library integrated directly into conversation UI
- **Real-time personalization**: Map variables to customer data before sending
- Features:
  - Template browsing by category
  - Search and pinning for frequently used templates
  - Variable personalization modal
  - Preview before sending

### 4. Template Management
- **Content API integration**: Fetches approved templates from Twilio Content API
- **Template library**: Browse, search, and filter templates
- **Approval status**: Real-time display of template approval status
- **Categorization**: Organize templates by type and usage
- **Pinning**: Save favorite templates for quick access

## Disclaimer

This plugin is classified as a **Class B Plugin**. It is provided as **sample code** and is currently a **work in progress**. While it demonstrates features and functionalities that can be implemented, it is not production-ready and should be used with caution.

Feedback and contributions are welcome as we continue to improve and expand its capabilities. If you encounter any issues or have suggestions, please reach out via the contact information below.

## Installation

### Prerequisites
- Node.js (v14 or higher)
- Twilio CLI with Flex Plugin CLI
- Twilio Flex instance
- WhatsApp Business Account (for WhatsApp messaging)
- Approved WhatsApp templates in Twilio Content API

### Step 1: Clone and Install

1. Clone the repository:
   ```bash
   git clone https://github.com/fvmach/twilio-flex-outbound-engagement
   ```

2. Navigate to the project directory:
   ```bash
   cd flex-outbound
   ```

3. Install plugin dependencies:
   ```bash
   npm install
   ```

### Step 2: Deploy Serverless Functions

1. Navigate to the serverless directory:
   ```bash
   cd serverless/whatsapp
   ```

2. Deploy the functions:
   ```bash
   twilio serverless:deploy
   ```

3. Note the deployed service URL (e.g., `https://flex-outbound-plugin-3999.twil.io`)

### Step 3: Configure Environment Variables

#### A. Serverless Functions Environment Variables

Set these environment variables in your Twilio Functions service:

**Required:**
```bash
# TaskRouter Configuration
TASKROUTER_WORKSPACE_SID=WSXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TASKROUTER_WORKFLOW_SID=WWXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  # Optional but recommended
TASKROUTER_QUEUE_SID=WQXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX      # Fallback queue for routing

# Messaging Configuration
TWILIO_WHATSAPP_NUMBER=whatsapp:+15551234567  # Include whatsapp: prefix
TWILIO_PHONE_NUMBER=+15551234567               # Without prefix
```

Set via Twilio CLI:
```bash
twilio serverless:env:set TASKROUTER_WORKSPACE_SID=WSXXXX --service-sid=ZSXXXX
twilio serverless:env:set TASKROUTER_QUEUE_SID=WQXXXX --service-sid=ZSXXXX
twilio serverless:env:set TWILIO_WHATSAPP_NUMBER="whatsapp:+15551234567" --service-sid=ZSXXXX
twilio serverless:env:set TWILIO_PHONE_NUMBER="+15551234567" --service-sid=ZSXXXX
```

Or set via Twilio Console:
1. Go to **Functions & Assets** > **Services**
2. Select your service
3. Go to **Environment Variables**
4. Add the required variables

#### B. Plugin Frontend Configuration

Create or update `.env` file in the plugin root:

```bash
# Base URL for your Twilio Serverless Functions
# This should be your Functions Service domain (without trailing slash)
REACT_APP_TWILIO_FUNCTIONS_URL=https://flex-outbound-plugin-3999.twil.io
```

**Important:** Make sure the URL does NOT have a double `.twil.io.twil.io` - this is a common error.


### Step 4: Configure Twilio Services

**Required Services:**

1. **Flex Interactions API** (automatically available in Flex)
   - Used for creating outbound tasks and routing
   - No additional setup required

2. **Content API**
   - Enable in your Twilio Console
   - Upload and approve WhatsApp templates
   - Required for template messaging

3. **Conversations API** (automatically available)
   - Handles the underlying messaging infrastructure

4. **WhatsApp Business Account**
   - Link your WhatsApp number to Twilio
   - Submit templates for approval (24-48 hour process)

**Optional Services:**
- **Sync Service**: For storing campaign settings
- **Messaging Service**: For SMS delivery

### Step 5: Start Development Server

```bash
cd /path/to/flex-outbound
twilio flex:plugins:start
```

The plugin will be available at `http://localhost:3000`

### Step 6: Deploy to Production

```bash
twilio flex:plugins:deploy --changelog="Deploy outbound engagement plugin"
twilio flex:plugins:release --plugin flex-outbound@latest
```

## Usage Guide

### Feature 1: Starting New Outbound Conversations

1. **Access the Feature**
   - Click the **Start Conversation** button in the Flex main header (phone icon)
   - A side modal will open

2. **Select Channel**
   - Choose **WhatsApp**, **SMS**, or **Web Chat**

3. **Enter Customer Information**
   - Enter customer phone number in E.164 format (e.g., `+5511999999999`)
   - For WhatsApp, do not include the `whatsapp:` prefix

4. **Select Template (Optional)**
   - Click **Browse Templates**
   - Search or browse approved templates
   - Select a template

5. **Personalize Template**
   - If template has variables (e.g., `{{1}}`, `{{2}}`)
   - Click **Personalize** button
   - Fill in variable values
   - Preview the final message

6. **Send and Create Task**
   - Click **Start Conversation**
   - A new Flex task will be created and routed to you
   - Template message will be sent automatically
   - Conversation appears in your task list

### Feature 2: Bulk Campaign Mode

1. **Access Campaign Mode**
   - Click **Start Campaign** button in the main header
   - Campaign modal opens

2. **Import Contacts**
   - Click **Select Contacts**
   - Upload CSV file with contact information
   - CSV should have columns: `name`, `telephone` or `phone`
   - Contacts are displayed in the preview

3. **Select Template**
   - Click **Select Template**
   - Choose an approved WhatsApp template
   - Only approved templates can be used for campaigns

4. **Personalize Variables**
   - Click **Personalize**
   - Map template variables to contact data or static values
   - Preview shows how variables will be replaced

5. **Review and Send**
   - Review selected contacts and template
   - Click **Send Campaign**
   - Progress indicator shows message delivery status

### Feature 3: Send Template During Conversation

1. **During Active Conversation**
   - Open any active chat task
   - Look for **Send Template** button in the message input area

2. **Select Template**
   - Click **Send Template** button
   - Template library modal opens
   - Search or browse templates by category

3. **Personalize and Send**
   - If template has variables, fill them in
   - Preview the message
   - Click **Send**
   - Template is sent to the customer in the active conversation

## Architecture

### Serverless Functions

Located in `serverless/whatsapp/functions/`:

- **`start-outbound-conversation.js`**: Creates new outbound conversations using Flex Interactions API
  - Creates interaction with participant
  - Routes to agent using TaskRouter
  - Sends template message if provided
  - Task channel: `chat`

- **`whatsapp-send-templates.js`**: Handles bulk campaign template sending
  - Iterates through contact list
  - Sends WhatsApp templates using Content API
  - Supports variable personalization

- **`list-templates-approvals.js`**: Fetches approved templates from Content API
  - Returns only approved WhatsApp templates
  - Provides template metadata and approval status

### Plugin Components

Located in `src/components/`:

- **`StartConversation/`**: New conversation initiation component
  - Channel selection UI
  - Customer address input
  - Template selection and personalization
  - Calls `start-outbound-conversation` function

- **`CampaignMode/`**: Bulk campaign interface
  - Contact import and management
  - Template selection
  - Variable mapping
  - Campaign execution

- **`AgentTemplatePanel/`**: In-conversation template sending
  - Template library browser
  - Variable personalization modal
  - Sends via `post-template-to-conversation` function

- **`TemplateLibrary/`**: Reusable template selection component
  - Search and filtering
  - Category organization
  - Template pinning

- **`ContactModal/`**: Contact selection and CSV import
  - CSV parsing using PapaParse
  - Contact preview and validation

### Key Technical Details

- **Interactions API**: Used instead of direct TaskRouter task creation for proper Flex integration
- **Task Routing**: Tasks are created with `task_channel_unique_name: 'chat'` to route to chat-enabled workers
- **WhatsApp Format**: Phone numbers must include `whatsapp:` prefix for WhatsApp channels
- **CORS**: Serverless functions configured to accept requests from `localhost` and `flex.twilio.com`

## Testing

Run unit tests:
```bash
npm test
```

## Troubleshooting

### Common Issues

**1. "Routing is invalid" error**
- Ensure `TASKROUTER_WORKSPACE_SID` and `TASKROUTER_QUEUE_SID` are set
- Verify the queue exists in your workspace
- Check that task channel is set to `chat`

**2. "The 'From' number is not a valid phone number"**
- Ensure `TWILIO_WHATSAPP_NUMBER` includes `whatsapp:` prefix
- Example: `whatsapp:+15551234567`

**3. Double `.twil.io.twil.io` in URLs**
- Check `.env` file for correct URL format
- Should be: `https://your-service-1234.twil.io`
- Not: `https://your-service-1234.twil.io.twil.io`

**4. Templates not loading**
- Verify `list-templates-approvals` function is deployed
- Check Content API is enabled
- Ensure templates are approved in Twilio Console

**5. Tasks not appearing in Flex**
- Verify Interactions API permissions
- Check TaskRouter workspace and workflow configuration
- Ensure worker has available capacity

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
