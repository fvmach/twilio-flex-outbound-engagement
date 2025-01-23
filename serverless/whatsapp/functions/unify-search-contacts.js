exports.handler = async function (context, event, callback) {
    const axios = require("axios");
  
    // Load the token from the asset
    const asset = Runtime.getAssets()["/segment_access_token"];
    const segmentToken = asset.open().toString().trim(); // Read and trim the token
  
    const { identifier, traits } = event;
    const spaceId = context.SEGMENT_SPACE_ID; // SEGMENT_SPACE_ID is still an env variable
  
    const baseUrl = `https://profiles.segment.com/v1/spaces/${spaceId}/collections/users/profiles`;
  
    const query = {
      ...(identifier && { identifier }),
      ...(traits && { query: traits }),
    };
  
    try {
      console.log(identifier, traits);
      
      const response = await axios.get(baseUrl, {
        headers: {
          Authorization: `Basic ${Buffer.from(`${segmentToken}:`).toString("base64")}`,
        },
        params: query,
      });
  
      return callback(null, { profiles: response.data.profiles });
    } catch (error) {
      console.error("Error fetching profiles:", error);
      return callback(null, {
        error: true,
        message: error.message || "Unknown error occurred",
      });
    }
  };
  