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
    const contentAndApprovals = await client.content.v1.contentAndApprovals.list();

    // Map the response to include all fields and nested objects
    const templates = contentAndApprovals.map(content => ({
      sid: content.sid,
      friendly_name: content.friendlyName,
      account_sid: content.accountSid,  // Include account SID
      date_created: content.dateCreated,  // Include date created
      date_updated: content.dateUpdated,  // Include date updated
      language: content.language,  // Include language

      // Approval requests, including nested fields like status and category
      approval_requests: content.approvalRequests ? {
        allow_category_change: content.approvalRequests.allowCategoryChange,
        category: content.approvalRequests.category || 'N/A',
        content_type: content.approvalRequests.contentType || 'N/A',
        status: content.approvalRequests.status || 'unsubmitted',
        flows: content.approvalRequests.flows || null,  // Include flows if present
        rejection_reason: content.approvalRequests.rejectionReason || '',
      } : {},

      // Nested types and their content
      types: content.types || {},  // Include types if present

      // Variables (if any)
      variables: content.variables || {},  // Include variables if present
    }));

    response.setBody({ templates });  // Set the body with all templates
    return callback(null, response);  // Return the response with CORS headers
  } catch (error) {
    response.setStatusCode(500);  // Set error status
    response.setBody({ success: false, error: error.message });
    return callback(null, response);  // Return the response with CORS headers
  }
};
