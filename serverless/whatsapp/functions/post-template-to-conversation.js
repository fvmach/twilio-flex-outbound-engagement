exports.handler = async function (context, event, callback) {
  const client = context.getTwilioClient();

  const { conversationSid, contentSid, contentVariables, recipient } = event;

  if (!conversationSid || !contentSid || !contentVariables) {
    return callback(null, {
      success: false,
      error: 'Missing conversationSid, contentSid, or contentVariables in the request.',
    });
  }

  try {
    // Attempt to send the message via Conversations API
    await client.conversations.conversations(conversationSid).messages.create({
      author: 'system', // Customize the author name if needed
      contentSid,
      contentVariables,
    });

    // Successfully sent the message via Conversations API
    return callback(null, { success: true, message: 'Message posted successfully to conversation.' });
  } catch (error) {
    console.error('Failed to post message to conversation. Falling back to Content API:', error.message);

    // Fallback to Content API
    try {
      const response = await client.messages.create({
        from: `whatsapp:${context.TWILIO_WHATSAPP_NUMBER}`,
        to: recipient,
        contentSid,
        contentVariables: JSON.stringify(contentVariables),
      });

      // Successfully sent the message via Content API
      return callback(null, { success: true, message: 'Message sent successfully via Content API.', sid: response.sid });
    } catch (fallbackError) {
      console.error('Fallback to Content API also failed:', fallbackError.message);
      return callback(null, { success: false, error: fallbackError.message });
    }
  }
};
