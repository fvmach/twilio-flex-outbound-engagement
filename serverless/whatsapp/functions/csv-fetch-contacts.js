exports.handler = function (context, event, callback) {
    // Create a custom Twilio Response with CORS headers
    const response = new Twilio.Response();
    response.appendHeader('Access-Control-Allow-Origin', '*');  // Allow all origins, or specify specific allowed domains
    response.appendHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.appendHeader('Content-Type', 'application/json');  // Return JSON
  
    // Handle OPTIONS preflight requests
    if (event.httpMethod === 'OPTIONS') {
      response.setStatusCode(204);
      return callback(null, response);  // Return the headers for preflight request
    }
  
    try {
      // Access the CSV asset
      const openFile = Runtime.getAssets()['/unify-profiles.csv'].open;
      const csvText = openFile();
  
      // Prepare the response
      response.setBody({
        success: true,
        data: csvText
      });
  
      // Return the CSV data in the response
      return callback(null, response);
    } catch (error) {
      console.error('Error reading CSV:', error);
      
      // Prepare an error response
      response.setBody({
        success: false,
        message: `Error: ${error.message}`
      });
  
      return callback(null, response);
    }
  };
  