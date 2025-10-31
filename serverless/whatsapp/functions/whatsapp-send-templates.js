exports.handler = async function (context, event, callback) {
  const client = context.getTwilioClient();

  // Create a custom Twilio Response
  const response = new Twilio.Response();

  // Set CORS headers to allow cross-origin requests
  response.appendHeader('Access-Control-Allow-Origin', '*');  // Allow all origins, or restrict to specific domains
  response.appendHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');  // Methods allowed
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');  // Headers allowed
  response.appendHeader('Content-Type', 'application/json');  // Set the content type to JSON

  // Log response headers for debugging purposes
  console.log('Response Headers:', {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  });

  // Handle OPTIONS preflight request
  if (event.httpMethod === 'OPTIONS') {
    response.setStatusCode(204);  // No Content status for OPTIONS preflight
    console.log('Handling OPTIONS preflight request');
    return callback(null, response);  // Return early for preflight request
  }

  try {
    // Extract query parameters
    let contacts = event.contacts.split('&').map(contact => contact.split('=')[1]);
    let index = parseInt(event.index) || 0;
    let totalContacts = parseInt(event.total_contacts);
    let templateSid = event.template_sid;
    let templateVariables = JSON.parse(event.template_variables || '{}');
    let sendNow = event.send_now === 'true';

    // Log incoming parameters for debugging
    console.log('Incoming parameters:', { contacts, index, totalContacts, templateSid, templateVariables, sendNow });

    // Iterate and send messages using Twilio Content API
    for (let i = index; i < totalContacts; i++) {
      const phoneNumber = contacts[i];

      // Handle WhatsApp number formatting - check if it already has whatsapp: prefix
      const fromNumber = context.TWILIO_WHATSAPP_NUMBER.startsWith('whatsapp:') 
        ? context.TWILIO_WHATSAPP_NUMBER 
        : `whatsapp:${context.TWILIO_WHATSAPP_NUMBER}`;

      await client.messages.create({
        from: fromNumber,
        to: phoneNumber,
        contentSid: templateSid,
        contentVariables: JSON.stringify(templateVariables)
      });

      console.log(`Message sent to ${phoneNumber} (Index ${i})`);
    }

    // Success response
    response.setBody({ success: true, message: 'Messages sent successfully.' });
    console.log('Response sent successfully:', { success: true });
    return callback(null, response);
  } catch (error) {
    // Log and handle any errors
    console.error('Error:', error);
    response.setStatusCode(500);  // Internal Server Error status code
    response.setBody({ success: false, error: error.message });
    console.log('Response error:', { success: false, error: error.message });
    return callback(null, response);
  }
};
