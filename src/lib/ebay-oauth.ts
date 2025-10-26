import EbayAuthToken from 'ebay-oauth-nodejs-client';

// eBay OAuth Configuration
const EBAY_CONFIG = {
  SANDBOX: {
    clientId: process.env.EBAY_APP_ID || '',
    clientSecret: process.env.EBAY_CERT_ID || '',
    redirectUri: process.env.EBAY_REDIRECT_URI || 'http://localhost:3000/api/ebay/callback',
    environment: 'SANDBOX' as const
  },
  PRODUCTION: {
    clientId: process.env.EBAY_APP_ID || '',
    clientSecret: process.env.EBAY_CERT_ID || '',
    redirectUri: process.env.EBAY_REDIRECT_URI || 'https://miraal-store.vercel.app/api/ebay/callback',
    environment: 'PRODUCTION' as const
  }
};

// Debug function to check environment variables
export function checkEnvironmentVariables() {
  return {
    EBAY_APP_ID: process.env.EBAY_APP_ID ? 'Set' : 'Not Set',
    EBAY_CERT_ID: process.env.EBAY_CERT_ID ? 'Set' : 'Not Set',
    EBAY_REDIRECT_URI: process.env.EBAY_REDIRECT_URI || 'Not Set',
    NODE_ENV: process.env.NODE_ENV
  };
}

// eBay OAuth Scopes - Include necessary scopes for orders
export const EBAY_SCOPES = [
  'https://api.ebay.com/oauth/api_scope',
  'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.fulfillment'
];

// Extended scopes for when basic auth works
export const EBAY_EXTENDED_SCOPES = [
  'https://api.ebay.com/oauth/api_scope',
  'https://api.ebay.com/oauth/api_scope/sell.marketing.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.account.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
];

// Get current environment configuration
export function getEbayConfig() {
  // Force production for testing when PRD credentials are used
  const isProduction = process.env.NODE_ENV === 'production' || process.env.EBAY_APP_ID?.includes('PRD');
  return isProduction ? EBAY_CONFIG.PRODUCTION : EBAY_CONFIG.SANDBOX;
}

// Create eBay OAuth client instance
export function createEbayAuthClient() {
  const config = getEbayConfig();
  
  // Validate credentials before creating client
  if (!config.clientId || !config.clientSecret) {
    throw new Error('eBay credentials are missing. Please check EBAY_APP_ID and EBAY_CERT_ID environment variables.');
  }
  
  // Log credentials for debugging (first 10 chars only)
  console.log('eBay OAuth Config:', {
    clientId: config.clientId ? `${config.clientId.substring(0, 10)}...` : 'Missing',
    clientSecret: config.clientSecret ? `${config.clientSecret.substring(0, 10)}...` : 'Missing',
    redirectUri: config.redirectUri,
    environment: config.environment
  });
  
  try {
    return new EbayAuthToken({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: config.redirectUri,
      env: config.environment // This is the key missing parameter!
    });
  } catch (error) {
    console.error('Error creating eBay OAuth client:', error);
    throw new Error(`Failed to initialize eBay OAuth client: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate user authorization URL
export function generateUserAuthUrl(state?: string) {
  const config = getEbayConfig();
  
  // Build OAuth URL manually to include marketplace_id for Germany
  const baseUrl = config.environment === 'PRODUCTION' 
    ? 'https://auth.ebay.com/oauth2/authorize'
    : 'https://auth.sandbox.ebay.com/oauth2/authorize';
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: EBAY_SCOPES.join(' '),
    marketplace_id: '77', // Germany marketplace
    ...(state && { state })
  });
  
  return `${baseUrl}?${params.toString()}`;
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(code: string) {
  const client = createEbayAuthClient();
  const config = getEbayConfig();
  
  try {
    const token = await client.exchangeCodeForAccessToken(config.environment, code);
    return token;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
}

// Get application token (for app-level API calls)
export async function getApplicationToken() {
  const client = createEbayAuthClient();
  const config = getEbayConfig();
  
  try {
    const token = await client.getApplicationToken(config.environment);
    return token;
  } catch (error) {
    console.error('Error getting application token:', error);
    throw error;
  }
}

// Refresh user access token
export async function refreshUserToken(refreshToken: string) {
  const client = createEbayAuthClient();
  const config = getEbayConfig();
  
  try {
    const token = await client.getAccessToken(config.environment, refreshToken, EBAY_SCOPES);
    return token;
  } catch (error) {
    console.error('Error refreshing user token:', error);
    throw error;
  }
}

// Debug function to get configuration info
export function getDebugInfo() {
  const config = getEbayConfig();
  
  return {
    environment: config.environment,
    clientId: config.clientId ? `${config.clientId.substring(0, 10)}...` : 'Not set',
    clientSecret: config.clientSecret ? `${config.clientSecret.substring(0, 10)}...` : 'Not set',
    redirectUri: config.redirectUri,
    nodeEnv: process.env.NODE_ENV,
    scopes: EBAY_SCOPES
  };
}
