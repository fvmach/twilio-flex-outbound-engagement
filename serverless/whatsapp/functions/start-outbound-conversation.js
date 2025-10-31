/**
 * Serverless Function: start-outbound-conversation
 * 
 * Creates an outbound conversation using Twilio Interactions API
 * and routes it to a Flex agent via TaskRouter
 * 
 * Required environment variables:
 * - TASKROUTER_WORKSPACE_SID (required)
 * - TASKROUTER_QUEUE_SID (required - fallback queue for routing)
 * - TWILIO_WHATSAPP_NUMBER (required - must include whatsapp: prefix)
 * - TWILIO_PHONE_NUMBER (optional - for SMS/voice channels)
 * 
 * Optional environment variables:
 * - TASKROUTER_WORKFLOW_SID (recommended for advanced routing)
 * - MESSAGING_SERVICE_SID (optional - for message delivery)
 */

exports.handler = async (context, event, callback) => {
  const client = context.getTwilioClient();
  const response = new Twilio.Response();
  
  // --- CORS Headers ---
  const requestOrigin = event.headers?.origin || event.request?.headers?.origin || '';
  const allowedOrigins = ['http://localhost:3000', 'https://flex.twilio.com'];
  const allowOrigin = allowedOrigins.includes(requestOrigin) ? requestOrigin : null;

  if (!allowOrigin) {
    response.appendHeader('Content-Type', 'application/json');
    response.setStatusCode(403);
    response.setBody({ error: 'Origin not allowed' });
    return callback(null, response);
  }

  response.appendHeader('Access-Control-Allow-Origin', allowOrigin);
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Access-Control-Allow-Credentials', 'true');
  response.appendHeader('Content-Type', 'application/json');

  // --- Preflight ---
  const method = event.httpMethod || event.request?.method;
  if (method === 'OPTIONS') {
    console.log('[start-outbound-conversation] CORS preflight response sent');
    response.setStatusCode(204);
    return callback(null, response);
  }

  try {
    // Accept JSON body
    let payload = {};
    try {
      payload = typeof event.body === 'string' ? JSON.parse(event.body) : (event || {});
    } catch {}
    
    const {
      customerAddress,
      channel,
      workerSid,
      workerFriendlyName,
      queueSid,
      templateSid,
      templateVariables,
      messageBody,
    } = payload;

    if (!customerAddress || !channel) {
      response.setStatusCode(400);
      response.setBody({
        success: false,
        error: 'Missing required parameters: customerAddress, channel',
      });
      return callback(null, response);
    }

    // Validate required environment variables
    if (!context.TASKROUTER_WORKSPACE_SID) {
      response.setStatusCode(500);
      response.setBody({
        success: false,
        error: 'Missing environment variable: TASKROUTER_WORKSPACE_SID',
      });
      return callback(null, response);
    }

    console.log('[start-outbound-conversation] Creating outbound interaction:', {
      customerAddress,
      channel,
      workerSid,
      queueSid,
    });

    // Determine the proxy address based on channel
    let proxyAddress = context.TWILIO_PHONE_NUMBER;
    if (channel === 'whatsapp') {
      proxyAddress = context.TWILIO_WHATSAPP_NUMBER || context.TWILIO_PHONE_NUMBER;
    }

    // Build task attributes
    const taskAttributes = {
      channelType: channel,
      customerAddress,
      direction: 'outbound',
      name: customerAddress,
      from: customerAddress,
      initiated_by: 'agent',
    };

    // Use provided queueSid or fallback to environment variable
    const effectiveQueueSid = queueSid || context.TASKROUTER_QUEUE_SID;

    // Create Interaction using Interactions API - this will create the conversation automatically
    const interaction = await client.flexApi.v1.interaction.create({
      channel: {
        type: channel === 'whatsapp' ? 'whatsapp' : 'sms',
        initiated_by: 'agent',
        properties: {
          type: channel === 'whatsapp' ? 'whatsapp' : 'sms',
        },
        participants: [
          {
            address: customerAddress,
            proxy_address: proxyAddress,
            type: channel === 'whatsapp' ? 'whatsapp' : 'sms',
          },
        ],
      },
      routing: {
        properties: {
          workspace_sid: context.TASKROUTER_WORKSPACE_SID,
          task_channel_unique_name: 'chat',
          ...(context.TASKROUTER_WORKFLOW_SID && { workflow_sid: context.TASKROUTER_WORKFLOW_SID }),
          ...(effectiveQueueSid && { queue_sid: effectiveQueueSid }),
          ...(workerSid && { worker_sid: workerSid }),
          attributes: taskAttributes,
        },
      },
    });

    console.log('[start-outbound-conversation] Interaction created:', interaction.sid);

    // Get the conversation SID from the interaction
    const conversationSid = interaction.channel.sid;
    
    // Wait a moment for the conversation to be fully created
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update conversation to ensure webhooks are enabled
    try {
      await client.conversations.v1
        .conversations(conversationSid)
        .update({
          'messagingBinding.proxyAddress': proxyAddress,
          state: 'active'
        });
      console.log('[start-outbound-conversation] Conversation webhooks configured');
    } catch (webhookError) {
      console.log('[start-outbound-conversation] Note: Webhook config skipped:', webhookError.message);
    }

    // Send template message if templateSid is provided
    // This establishes the WhatsApp binding
    if (templateSid) {
      try {
        const fromNumber = proxyAddress.startsWith('whatsapp:') 
          ? proxyAddress 
          : `whatsapp:${proxyAddress}`;

        const message = await client.messages.create({
          from: fromNumber,
          to: customerAddress,
          contentSid: templateSid,
          contentVariables: templateVariables ? JSON.stringify(templateVariables) : undefined,
          messagingServiceSid: context.MESSAGING_SERVICE_SID || undefined,
        });
        console.log('[start-outbound-conversation] Template message sent:', message.sid);

        // Link the message to the conversation
        try {
          await client.conversations.v1
            .conversations(conversationSid)
            .messages
            .create({
              body: 'Template message sent',
              author: workerFriendlyName || 'system',
              xTwilioWebhookEnabled: 'true'
            });
        } catch (linkError) {
          console.log('[start-outbound-conversation] Note: Could not link message to conversation:', linkError.message);
        }
      } catch (msgError) {
        console.error('[start-outbound-conversation] Warning: Failed to send template:', msgError.message);
      }
    }

    response.setStatusCode(201);
    response.setBody({
      success: true,
      interactionSid: interaction.sid,
      channelSid: interaction.channel.sid,
      conversationSid: conversationSid,
    });

    return callback(null, response);
  } catch (error) {
    console.error('[start-outbound-conversation] Error:', error);
    response.setStatusCode(500);
    response.setBody({
      success: false,
      error: error.message || 'Failed to create conversation',
    });
    return callback(null, response);
  }
};
