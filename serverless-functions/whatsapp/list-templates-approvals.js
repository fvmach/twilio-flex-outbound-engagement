exports.handler = async function (context, event, callback) {
    const client = context.getTwilioClient();  // Use the Twilio client from context
  
    // Create a custom Twilio Response with CORS headers
    const response = new Twilio.Response();
    response.appendHeader('Access-Control-Allow-Origin', '*');  // Allow all origins, or specify your allowed domains
    response.appendHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.appendHeader('Content-Type', 'application/json');  // Return JSON
  
    // Handle OPTIONS preflight requests
    if (event.httpMethod === 'OPTIONS') {
      response.setStatusCode(204);
      return callback(null, response);  // Return the headers for preflight request
    }
  
    try {
      const contentAndApprovals = await client.content.v1.contentAndApprovals.list(); // Fetch all content and approvals
  
      // Safely map the response and check for the `approvalRequests` field
      const templates = contentAndApprovals.map(content => ({
        sid: content.sid,
        friendly_name: content.friendlyName,
        status: content.approvalRequests?.[0]?.status ?? 'unsubmitted',  // Safe access to `status`
      }));
  
      response.setBody({ templates });  // Set the body with templates
      return callback(null, response);  // Return the response with CORS headers
    } catch (error) {
      response.setStatusCode(500);  // Set error status
      response.setBody({ success: false, error: error.message });
      return callback(null, response);  // Return the response with CORS headers
    }
  };
  