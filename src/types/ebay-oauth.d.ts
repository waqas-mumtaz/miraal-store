declare module 'ebay-oauth-nodejs-client' {
  interface EbayAuthToken {
    generateUserAuthorizationUrl(
      environment: 'SANDBOX' | 'PRODUCTION',
      scopes: string[],
      options?: { state?: string }
    ): string;
    
    exchangeCodeForAccessToken(
      environment: 'SANDBOX' | 'PRODUCTION',
      code: string
    ): Promise<{
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    }>;
    
    getApplicationToken(
      environment: 'SANDBOX' | 'PRODUCTION'
    ): Promise<{
      access_token: string;
      expires_in: number;
    }>;
    
    getAccessToken(
      environment: 'SANDBOX' | 'PRODUCTION',
      refreshToken: string,
      scopes: string[]
    ): Promise<{
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    }>;
  }

  class EbayAuthToken {
    constructor(config: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
    });
  }

  export = EbayAuthToken;
}
