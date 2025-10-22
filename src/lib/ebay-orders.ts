import { getEbayConfig } from './ebay'

export interface EbayOrder {
  orderId: string
  buyerId: string
  buyerEmail: string
  totalAmount: number
  currency: string
  status: string
  lineItems: EbayLineItem[]
  shippingAddress: EbayAddress
  createdAt: string
  updatedAt: string
}

export interface EbayLineItem {
  itemId: string
  title: string
  quantity: number
  price: number
  sku?: string
  imageUrl?: string
}

export interface EbayAddress {
  name: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
}

export class EbayOrdersService {
  private accessToken: string
  private config: ReturnType<typeof getEbayConfig>

  constructor(accessToken: string) {
    this.accessToken = accessToken
    this.config = getEbayConfig()
  }

  // Get all orders
  async getOrders(): Promise<EbayOrder[]> {
    try {
      const response = await fetch(`${this.config.BASE_URL}/sell/fulfillment/v1/order`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`)
      }

      const data = await response.json()
      return this.transformOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching eBay orders:', error)
      throw error
    }
  }

  // Get specific order by ID
  async getOrder(orderId: string): Promise<EbayOrder> {
    try {
      const response = await fetch(`${this.config.BASE_URL}/sell/fulfillment/v1/order/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch order: ${response.statusText}`)
      }

      const data = await response.json()
      return this.transformOrder(data)
    } catch (error) {
      console.error('Error fetching eBay order:', error)
      throw error
    }
  }

  // Get orders by date range
  async getOrdersByDateRange(startDate: string, endDate: string): Promise<EbayOrder[]> {
    try {
      const params = new URLSearchParams({
        filter: `creationdate:[${startDate}..${endDate}]`
      })

      const response = await fetch(`${this.config.BASE_URL}/sell/fulfillment/v1/order?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch orders by date: ${response.statusText}`)
      }

      const data = await response.json()
      return this.transformOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching eBay orders by date:', error)
      throw error
    }
  }

  // Transform raw eBay order data to our interface
  private transformOrder(rawOrder: any): EbayOrder {
    return {
      orderId: rawOrder.orderId || '',
      buyerId: rawOrder.buyer?.username || '',
      buyerEmail: rawOrder.buyer?.email || '',
      totalAmount: parseFloat(rawOrder.pricingSummary?.total?.value || '0'),
      currency: rawOrder.pricingSummary?.total?.currency || 'USD',
      status: rawOrder.orderFulfillmentStatus || 'PENDING',
      lineItems: this.transformLineItems(rawOrder.lineItems || []),
      shippingAddress: this.transformAddress(rawOrder.fulfillmentStartInstructions?.shippingStep?.shipTo || {}),
      createdAt: rawOrder.creationDate || new Date().toISOString(),
      updatedAt: rawOrder.lastModifiedDate || new Date().toISOString()
    }
  }

  // Transform multiple orders
  private transformOrders(rawOrders: any[]): EbayOrder[] {
    return rawOrders.map(order => this.transformOrder(order))
  }

  // Transform line items
  private transformLineItems(rawLineItems: any[]): EbayLineItem[] {
    return rawLineItems.map(item => ({
      itemId: item.itemId || '',
      title: item.title || '',
      quantity: parseInt(item.quantity || '1'),
      price: parseFloat(item.lineItemCost?.value || '0'),
      sku: item.sku || undefined,
      imageUrl: item.imageUrl || undefined
    }))
  }

  // Transform shipping address
  private transformAddress(rawAddress: any): EbayAddress {
    return {
      name: rawAddress.fullName || '',
      addressLine1: rawAddress.contactAddress?.addressLine1 || '',
      addressLine2: rawAddress.contactAddress?.addressLine2 || undefined,
      city: rawAddress.contactAddress?.city || '',
      state: rawAddress.contactAddress?.stateOrProvince || '',
      postalCode: rawAddress.contactAddress?.postalCode || '',
      country: rawAddress.contactAddress?.countryCode || '',
      phone: rawAddress.phoneNumber || undefined
    }
  }
}
