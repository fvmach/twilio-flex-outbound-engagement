/**
 * FlexOutbound Plugin Configuration
 * 
 * Update these values to match your Twilio serverless deployment
 */

// Base URL for your Twilio serverless functions
// Update this to match your Functions Service domain
export const BASE_FUNCTION_URL = 
  process.env.REACT_APP_TWILIO_FUNCTIONS_URL || 
  'https://flex-outbound-plugin-3999.twil.io';

// Serverless function endpoints
export const ENDPOINTS = {
  LIST_TEMPLATES: `${BASE_FUNCTION_URL}/list-templates-approvals`,
  SEND_TEMPLATE: `${BASE_FUNCTION_URL}/whatsapp-send-template`,
  POST_TEMPLATE_TO_CONVERSATION: `${BASE_FUNCTION_URL}/post-template-to-conversation`,
  START_CONVERSATION: `${BASE_FUNCTION_URL}/start-outbound-conversation`,
  LIST_SYNC_DOCUMENTS: `${BASE_FUNCTION_URL}/list-sync-documents`,
  GET_SYNC_DOCUMENT: `${BASE_FUNCTION_URL}/get-sync-document`,
  SEARCH_UNIFIED_PROFILES: `${BASE_FUNCTION_URL}/search-unified-profiles`,
  FETCH_CONTACTS: `${BASE_FUNCTION_URL}/fetch-contacts`,
};

export default {
  BASE_FUNCTION_URL,
  ENDPOINTS,
};
