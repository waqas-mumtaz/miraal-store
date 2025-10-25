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

// eBay OAuth Scopes
export const EBAY_SCOPES = [
  'https://api.ebay.com/oauth/api_scope',
  'https://api.ebay.com/oauth/api_scope/sell.marketing.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.account.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
];

// Get current environment configuration
export function getEbayConfig() {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? EBAY_CONFIG.PRODUCTION : EBAY_CONFIG.SANDBOX;
}

// Create eBay OAuth client instance
export function createEbayAuthClient() {
  const config = getEbayConfig();
  
  return new EbayAuthToken({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri: config.redirectUri
  });
}

// Generate user authorization URL
export function generateUserAuthUrl(state?: string) {
  const client = createEbayAuthClient();
  const config = getEbayConfig();
  
  const options = state ? { state } : undefined;
  
  return client.generateUserAuthorizationUrl(
    config.environment,
    EBAY_SCOPES,
    options
  );
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
