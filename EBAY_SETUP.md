# eBay Integration Setup Guide

## 🔧 Required Environment Variables

Add these to your `.env.local` file for development and to Vercel environment variables for production:

```bash
# eBay API Credentials (Sandbox)
EBAY_APP_ID="your-ebay-app-id"
EBAY_CERT_ID="your-ebay-cert-id"
EBAY_DEV_ID="your-ebay-dev-id"
EBAY_RU_NAME="your-ebay-ru-name"
EBAY_REDIRECT_URI="http://localhost:3001/api/ebay/callback"

# For Production
EBAY_REDIRECT_URI="https://miraal-store.vercel.app/api/ebay/callback"
```

## 📋 Step-by-Step Setup

### 1. Create eBay Developer Account
1. Go to https://developer.ebay.com/
2. Sign up/Login with your eBay account
3. Create a new application

### 2. Get API Credentials
1. In your eBay Developer Dashboard:
   - Copy **App ID (Client ID)**
   - Copy **Cert ID (Client Secret)**
   - Copy **Dev ID**
   - Set **Redirect URI** to: `http://localhost:3001/api/ebay/callback` (for development)

### 3. Configure Sandbox
1. Use eBay Sandbox for testing: https://sandbox.ebay.com/
2. Create test accounts for development
3. Test your integration before going live

### 4. Set Environment Variables
1. **Local Development**: Add to `.env.local`
2. **Production**: Add to Vercel Environment Variables

### 5. Test Integration
1. Start your development server
2. Go to `/planner/ebay`
3. Click "Connect to eBay"
4. Complete OAuth flow
5. Test API calls

## 🔗 API Endpoints Created

- `GET /api/ebay/auth` - Initiate OAuth flow
- `GET /api/ebay/callback` - Handle OAuth callback
- `GET /api/ebay/status` - Check connection status
- `POST /api/ebay/disconnect` - Disconnect eBay account

## 📚 eBay API Documentation

- **Trading API**: https://developer.ebay.com/devzone/xml/docs/reference/ebay/
- **Inventory API**: https://developer.ebay.com/devzone/inventory/docs/
- **Fulfillment API**: https://developer.ebay.com/devzone/fulfillment/docs/
- **OAuth 2.0**: https://developer.ebay.com/api-docs/static/oauth-oauth2-ebay.html
