// eBay API Configuration
export const EBAY_CONFIG = {
  // Sandbox URLs
  SANDBOX: {
    BASE_URL: 'https://api.sandbox.ebay.com',
    AUTH_URL: 'https://auth.sandbox.ebay.com',
    REDIRECT_URI: process.env.EBAY_REDIRECT_URI || 'http://localhost:3001/api/ebay/callback',
  },
  // Production URLs (for later)
  PRODUCTION: {
    BASE_URL: 'https://api.ebay.com',
    AUTH_URL: 'https://auth.ebay.com',
    REDIRECT_URI: process.env.EBAY_REDIRECT_URI || 'https://miraal-store.vercel.app/api/ebay/callback',
  }
}

// eBay API Credentials
export const EBAY_CREDENTIALS = {
  APP_ID: process.env.EBAY_APP_ID || '',
  CERT_ID: process.env.EBAY_CERT_ID || '',
  DEV_ID: process.env.EBAY_DEV_ID || '',
  RU_NAME: process.env.EBAY_RU_NAME || '', // Runame for OAuth
}

// eBay API Endpoints
export const EBAY_ENDPOINTS = {
  // OAuth endpoints
  OAUTH_AUTHORIZE: '/oauth2/authorize',
  OAUTH_TOKEN: '/oauth2/token',
  
  // Trading API endpoints
  GET_ITEM: '/Trading/GetItem',
  ADD_ITEM: '/Trading/AddItem',
  REVISE_ITEM: '/Trading/ReviseItem',
  END_ITEM: '/Trading/EndItem',
  
  // Inventory API endpoints
  GET_INVENTORY_ITEMS: '/sell/inventory/v1/inventory_item',
  CREATE_INVENTORY_ITEM: '/sell/inventory/v1/inventory_item',
  UPDATE_INVENTORY_ITEM: '/sell/inventory/v1/inventory_item',
  
  // Fulfillment API endpoints
  GET_ORDERS: '/sell/fulfillment/v1/order',
  GET_ORDER: '/sell/fulfillment/v1/order',
}

// eBay API Scopes (permissions)
export const EBAY_SCOPES = [
  'https://api.ebay.com/oauth/api_scope',
  'https://api.ebay.com/oauth/api_scope/sell.marketing.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.marketing',
  'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.inventory',
  'https://api.ebay.com/oauth/api_scope/sell.account.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.account',
  'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
]

// Helper function to get current environment
export function getEbayConfig() {
  const isProduction = process.env.NODE_ENV === 'production'
  return isProduction ? EBAY_CONFIG.PRODUCTION : EBAY_CONFIG.SANDBOX
}

// Helper function to build OAuth URL
export function buildOAuthUrl(state: string) {
  const config = getEbayConfig()
  const scopes = EBAY_SCOPES.join(' ')
  
  const params = new URLSearchParams({
    client_id: EBAY_CREDENTIALS.APP_ID,
    response_type: 'code',
    redirect_uri: config.REDIRECT_URI,
    scope: scopes,
    state: state,
  })
  
  return `${config.AUTH_URL}${EBAY_ENDPOINTS.OAUTH_AUTHORIZE}?${params.toString()}`
}
