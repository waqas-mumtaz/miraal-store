import { prisma } from '@/lib/prisma'

// eBay API Configuration
const EBAY_CONFIG = {
  SANDBOX: {
    baseUrl: 'https://api.sandbox.ebay.com',
    environment: 'SANDBOX' as const,
  },
  PRODUCTION: {
    baseUrl: 'https://api.ebay.com',
    environment: 'PRODUCTION' as const,
  }
}

// Get current environment configuration
function getEbayConfig() {
  // Force production for testing
  const isProduction = process.env.NODE_ENV === 'production' || process.env.EBAY_APP_ID?.includes('PRD')
  return isProduction ? EBAY_CONFIG.PRODUCTION : EBAY_CONFIG.SANDBOX
}

// Direct eBay API client
export class EbayDirectApi {
  private baseUrl: string
  private authToken: string
  private refreshToken?: string

  constructor(authToken: string, refreshToken?: string) {
    const config = getEbayConfig()
    this.baseUrl = config.baseUrl
    this.authToken = authToken
    this.refreshToken = refreshToken
  }

  // Make authenticated request to eBay API
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers = {
      'Authorization': `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
      'X-EBAY-SOA-OPERATION-NAME': 'getOrders',
      ...options.headers,
    }

    console.log('Making direct eBay API request:', {
      url,
      hasAuthToken: !!this.authToken,
      authTokenPreview: this.authToken.substring(0, 20) + '...'
    })

    const response = await fetch(url, {
      ...options,
      headers,
    })

    const responseText = await response.text()
    console.log('eBay API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText.substring(0, 200) + '...'
    })

    if (!response.ok) {
      throw new Error(`eBay API request failed: ${response.status} ${response.statusText} - ${responseText}`)
    }

    try {
      return JSON.parse(responseText)
    } catch {
      return responseText
    }
  }

  // Test connection
  async testConnection() {
    try {
      if (!this.authToken) {
        return { success: false, error: 'No auth token available' }
      }
      
      // Test with a simple API call
      const result = await this.makeRequest('/sell/fulfillment/v1/order?limit=1')
      return { success: true, message: 'Connection successful', data: result }
    } catch (error) {
      console.error('eBay connection test failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Get orders
  async getOrders(options: {
    limit?: number
    offset?: number
    orderStatus?: string
    fulfillmentStatus?: string
    dateRange?: { from: Date; to: Date }
  } = {}) {
    try {
      const {
        limit = 20,
        offset = 0,
        orderStatus,
        fulfillmentStatus,
        dateRange
      } = options

      // Build query parameters
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      })

      // Build filter array for multiple filters
      const filters = []

      if (orderStatus) {
        filters.push(`orderPaymentStatus:{${orderStatus}}`)
      }

      if (fulfillmentStatus) {
        // eBay API only supports specific combinations of fulfillment statuses
        let filterValue = fulfillmentStatus
        if (fulfillmentStatus === 'NOT_STARTED') {
          // NOT_STARTED alone is not supported, use combination
          filterValue = 'NOT_STARTED|IN_PROGRESS'
        } else if (fulfillmentStatus === 'FULFILLED') {
          // FULFILLED alone might not be supported, use combination
          filterValue = 'FULFILLED|IN_PROGRESS'
        }
        filters.push(`orderfulfillmentstatus:{${filterValue}}`)
      }

      if (dateRange) {
        filters.push(`creationDate:[${dateRange.from.toISOString()}..${dateRange.to.toISOString()}]`)
      }

      // Default filter: show orders that are not yet shipped (NOT_STARTED + IN_PROGRESS)
      if (!fulfillmentStatus) {
        filters.push('orderfulfillmentstatus:{NOT_STARTED|IN_PROGRESS}')
      }

      if (filters.length > 0) {
        params.append('filter', filters.join(','))
      }

      const endpoint = `/sell/fulfillment/v1/order?${params.toString()}`
      console.log('eBay API request endpoint:', endpoint)
      console.log('eBay API filters:', filters)
      const orders = await this.makeRequest(endpoint)
      
      return {
        orders: orders.orders || [],
        total: orders.total || 0,
        limit,
        offset
      }
    } catch (error) {
      console.error('Error fetching eBay orders:', error)
      throw error
    }
  }

  // Get specific order
  async getOrder(orderId: string) {
    try {
      const order = await this.makeRequest(`/sell/fulfillment/v1/order/${orderId}`)
      return order
    } catch (error) {
      console.error('Error fetching eBay order:', error)
      throw error
    }
  }

  // Get order line items
  async getOrderLineItems(orderId: string) {
    try {
      const lineItems = await this.makeRequest(`/sell/fulfillment/v1/order/${orderId}/line_item`)
      return lineItems
    } catch (error) {
      console.error('Error fetching eBay order line items:', error)
      throw error
    }
  }
}

// Helper function to create direct API client for a user
export async function createEbayDirectApi(userId: string): Promise<EbayDirectApi> {
  try {
    // Get user's eBay tokens from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ebayAccessToken: true,
        ebayRefreshToken: true,
        ebayTokenExpiry: true,
        ebayConnected: true,
      }
    })

    if (!user?.ebayConnected || !user?.ebayAccessToken) {
      throw new Error('User not connected to eBay or tokens not found')
    }

    return new EbayDirectApi(user.ebayAccessToken, user.ebayRefreshToken || undefined)
  } catch (error) {
    console.error('Error creating eBay direct API client:', error)
    throw error
  }
}
