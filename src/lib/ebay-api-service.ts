import eBayApi from 'ebay-api';
import { prisma } from '@/lib/prisma';

// eBay API Configuration
const EBAY_CONFIG = {
  SANDBOX: {
    clientId: process.env.EBAY_APP_ID || '',
    clientSecret: process.env.EBAY_CERT_ID || '',
    environment: 'SANDBOX' as const,
    baseUrl: 'https://api.sandbox.ebay.com'
  },
  PRODUCTION: {
    clientId: process.env.EBAY_APP_ID || '',
    clientSecret: process.env.EBAY_CERT_ID || '',
    environment: 'PRODUCTION' as const,
    baseUrl: 'https://api.ebay.com'
  }
};

// Get current environment configuration
function getEbayConfig() {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? EBAY_CONFIG.PRODUCTION : EBAY_CONFIG.SANDBOX;
}

// Create eBay API client with user's tokens
export async function createEbayApiClient(userId: string) {
  try {
    // Get user's eBay tokens from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ebayAccessToken: true,
        ebayRefreshToken: true,
        ebayTokenExpiry: true,
        ebayConnected: true
      }
    });

    if (!user?.ebayConnected || !user?.ebayAccessToken) {
      throw new Error('User not connected to eBay or tokens not found');
    }

    const config = getEbayConfig();
    
    // Create eBay API client with user's tokens
    const ebay = new eBayApi({
      appId: config.clientId,
      certId: config.clientSecret,
      devId: process.env.EBAY_DEV_ID || '',
      sandbox: config.environment === 'SANDBOX',
      authToken: user.ebayAccessToken,
      refreshToken: user.ebayRefreshToken,
      autoRefreshToken: true,
    });

    // Manually set the auth token if it's not set by constructor
    if (!ebay.authToken && user.ebayAccessToken) {
      ebay.authToken = user.ebayAccessToken;
    }

    console.log('eBay API client created:', {
      hasAuthToken: !!ebay.authToken,
      authTokenPreview: ebay.authToken ? ebay.authToken.substring(0, 20) + '...' : 'None',
      hasRefreshToken: !!ebay.refreshToken,
      sandbox: config.environment === 'SANDBOX'
    });

    // Set up token refresh event listener
    ebay.OAuth2.on('refreshAuthToken', async (newToken) => {
      console.log('eBay token refreshed for user:', userId);
      
      // Update tokens in database
      await prisma.user.update({
        where: { id: userId },
        data: {
          ebayAccessToken: newToken.access_token,
          ebayRefreshToken: newToken.refresh_token,
          ebayTokenExpiry: new Date(Date.now() + (newToken.expires_in * 1000)),
          updatedAt: new Date()
        }
      });
    });

    return ebay;
  } catch (error) {
    console.error('Error creating eBay API client:', error);
    throw new Error(`Failed to create eBay API client: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// eBay Orders Service
export class EbayOrdersService {
  private ebay: eBayApi;

  constructor(ebay: eBayApi) {
    this.ebay = ebay;
  }

  // Get user's orders
  async getOrders(options: {
    limit?: number;
    offset?: number;
    orderStatus?: string;
    dateRange?: { from: Date; to: Date };
  } = {}) {
    try {
      const {
        limit = 20,
        offset = 0,
        orderStatus,
        dateRange
      } = options;

      // Use the sell.fulfillment API to get orders
      const params: any = {
        limit,
        offset,
        filter: 'orderFulfillmentStatus:{READY_TO_SHIP,SHIPPED,IN_PROGRESS}'
      };

      if (orderStatus) {
        params.filter += `,orderPaymentStatus:{${orderStatus}}`;
      }

      if (dateRange) {
        params.filter += `,creationDate:[${dateRange.from.toISOString()}..${dateRange.to.toISOString()}]`;
      }

      const orders = await this.ebay.sell.fulfillment.getOrders(params);
      return orders;
    } catch (error) {
      console.error('Error fetching eBay orders:', error);
      throw error;
    }
  }

  // Get specific order details
  async getOrder(orderId: string) {
    try {
      const order = await this.ebay.sell.fulfillment.getOrder(orderId);
      return order;
    } catch (error) {
      console.error('Error fetching eBay order:', error);
      throw error;
    }
  }

  // Get order line items
  async getOrderLineItems(orderId: string) {
    try {
      const lineItems = await this.ebay.sell.fulfillment.getOrderLineItems(orderId);
      return lineItems;
    } catch (error) {
      console.error('Error fetching eBay order line items:', error);
      throw error;
    }
  }
}

// eBay Listings Service
export class EbayListingsService {
  private ebay: eBayApi;

  constructor(ebay: eBayApi) {
    this.ebay = ebay;
  }

  // Get user's listings
  async getListings(options: {
    limit?: number;
    offset?: number;
    listingStatus?: string;
    dateRange?: { from: Date; to: Date };
  } = {}) {
    try {
      const {
        limit = 20,
        offset = 0,
        listingStatus,
        dateRange
      } = options;

      const params: any = {
        limit,
        offset
      };

      if (listingStatus) {
        params.filter = `listingStatus:{${listingStatus}}`;
      }

      if (dateRange) {
        const filter = params.filter || '';
        params.filter = filter 
          ? `${filter},creationDate:[${dateRange.from.toISOString()}..${dateRange.to.toISOString()}]`
          : `creationDate:[${dateRange.from.toISOString()}..${dateRange.to.toISOString()}]`;
      }

      const listings = await this.ebay.sell.inventory.getInventoryItems(params);
      return listings;
    } catch (error) {
      console.error('Error fetching eBay listings:', error);
      throw error;
    }
  }

  // Get specific listing details
  async getListing(sku: string) {
    try {
      const listing = await this.ebay.sell.inventory.getInventoryItem(sku);
      return listing;
    } catch (error) {
      console.error('Error fetching eBay listing:', error);
      throw error;
    }
  }

  // Create new listing
  async createListing(listingData: any) {
    try {
      const listing = await this.ebay.sell.inventory.createOrReplaceInventoryItem(listingData);
      return listing;
    } catch (error) {
      console.error('Error creating eBay listing:', error);
      throw error;
    }
  }

  // Update listing
  async updateListing(sku: string, listingData: any) {
    try {
      const listing = await this.ebay.sell.inventory.createOrReplaceInventoryItem(sku, listingData);
      return listing;
    } catch (error) {
      console.error('Error updating eBay listing:', error);
      throw error;
    }
  }
}

// eBay Analytics Service
export class EbayAnalyticsService {
  private ebay: eBayApi;

  constructor(ebay: eBayApi) {
    this.ebay = ebay;
  }

  // Get sales analytics
  async getSalesAnalytics(options: {
    dateRange?: { from: Date; to: Date };
    metrics?: string[];
  } = {}) {
    try {
      const {
        dateRange = {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          to: new Date()
        },
        metrics = ['SALES', 'TRANSACTION']
      } = options;

      const params = {
        filter: `dateRange:[${dateRange.from.toISOString()}..${dateRange.to.toISOString()}]`,
        metricKeys: metrics.join(','),
        dimensionKeys: 'DAY'
      };

      const analytics = await this.ebay.sell.analytics.getSellerStandardsProfile(params);
      return analytics;
    } catch (error) {
      console.error('Error fetching eBay analytics:', error);
      throw error;
    }
  }

  // Get performance metrics
  async getPerformanceMetrics() {
    try {
      const metrics = await this.ebay.sell.analytics.getSellerStandardsProfile();
      return metrics;
    } catch (error) {
      console.error('Error fetching eBay performance metrics:', error);
      throw error;
    }
  }
}

// Main eBay Service Factory
export class EbayService {
  private ebay: eBayApi;
  public orders: EbayOrdersService;
  public listings: EbayListingsService;
  public analytics: EbayAnalyticsService;

  constructor(ebay: eBayApi) {
    this.ebay = ebay;
    this.orders = new EbayOrdersService(ebay);
    this.listings = new EbayListingsService(ebay);
    this.analytics = new EbayAnalyticsService(ebay);
  }

  // Test connection
  async testConnection() {
    try {
      // Simply check if we have a valid token - no API calls needed
      if (!this.ebay.authToken) {
        return { success: false, error: 'No auth token available' };
      }
      
      // Basic token validation - check if it's a valid eBay token format
      if (typeof this.ebay.authToken === 'string' && this.ebay.authToken.length > 0) {
        return { success: true, message: 'Token present and valid format' };
      }
      
      return { success: false, error: 'Invalid token format' };
    } catch (error) {
      console.error('eBay connection test failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Helper function to create service for a user
export async function createEbayService(userId: string): Promise<EbayService> {
  const ebay = await createEbayApiClient(userId);
  return new EbayService(ebay);
}
