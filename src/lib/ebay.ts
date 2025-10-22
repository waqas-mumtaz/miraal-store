// eBay API Configuration
export const EBAY_CONFIG = {
  // Sandbox URLs
  SANDBOX: {
    BASE_URL: 'https://api.sandbox.ebay.com',
    AUTH_URL: 'https://auth.sandbox.ebay.com',
    REDIRECT_URI: process.env.EBAY_REDIRECT_URI || 'http://localhost:3000/api/ebay/callback',
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

// eBay API Scopes (permissions) - Updated for correct format
export const EBAY_SCOPES = [
  'https://api.ebay.com/oauth/api_scope',
  'https://api.ebay.com/oauth/api_scope/sell.marketing.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.account.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
]

// Helper function to get current environment
export function getEbayConfig() {
  const isProduction = process.env.NODE_ENV === 'production'
  return isProduction ? EBAY_CONFIG.PRODUCTION : EBAY_CONFIG.SANDBOX
}

// Helper function to build Auth'n'auth URL
export function buildAuthUrl() {
  // Auth'n'auth uses a different URL format
  const params = new URLSearchParams({
    SignIn: '',
    runame: EBAY_CREDENTIALS.RU_NAME,
    SessID: '', // Will be set by eBay
  })
  
  // Use the Auth'n'auth endpoint
  return `https://signin.sandbox.ebay.com/ws/eBayISAPI.dll?${params.toString()}`
}
