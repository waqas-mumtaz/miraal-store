import { EBAY_ENDPOINTS, getEbayConfig } from './ebay'

export interface EbayItem {
  itemId: string
  title: string
  description: string
  price: number
  currency: string
  condition: string
  categoryId: string
  listingType: string
  quantity: number
  sku?: string
  images: string[]
  specifications?: Record<string, string>
}

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
}

export interface EbayLineItem {
  itemId: string
  title: string
  quantity: number
  price: number
  sku?: string
}

export interface EbayAddress {
  name: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export class EbayApiService {
  private accessToken: string
  private config: ReturnType<typeof getEbayConfig>

  constructor(accessToken: string) {
    this.accessToken = accessToken
    this.config = getEbayConfig()
  }

  // Get user's eBay listings
  async getListings(): Promise<EbayItem[]> {
    try {
      const response = await fetch(`${this.config.BASE_URL}/sell/inventory/v1/inventory_item`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' // For US marketplace
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch listings: ${response.statusText}`)
      }

      const data = await response.json()
      return data.inventoryItems || []
    } catch (error) {
      console.error('Error fetching eBay listings:', error)
      throw error
    }
  }

  // Get specific listing by SKU
  async getListingBySku(sku: string): Promise<EbayItem | null> {
    try {
      const response = await fetch(`${this.config.BASE_URL}/sell/inventory/v1/inventory_item/${sku}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`Failed to fetch listing: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching eBay listing by SKU:', error)
      throw error
    }
  }

  // Create new listing
  async createListing(item: Partial<EbayItem>): Promise<EbayItem> {
    try {
      const response = await fetch(`${this.config.BASE_URL}/sell/inventory/v1/inventory_item`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
        },
        body: JSON.stringify({
          sku: item.sku,
          availability: {
            shipToLocationAvailability: {
              quantity: item.quantity || 1
            }
          },
          condition: item.condition || 'NEW',
          product: {
            title: item.title,
            description: item.description,
            aspects: item.specifications || {},
            imageUrls: item.images || []
          },
          pricingSummary: {
            price: {
              value: item.price,
              currency: item.currency || 'USD'
            }
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Failed to create listing: ${errorData}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creating eBay listing:', error)
      throw error
    }
  }

  // Update existing listing
  async updateListing(sku: string, updates: Partial<EbayItem>): Promise<EbayItem> {
    try {
      const response = await fetch(`${this.config.BASE_URL}/sell/inventory/v1/inventory_item/${sku}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
        },
        body: JSON.stringify({
          availability: {
            shipToLocationAvailability: {
              quantity: updates.quantity
            }
          },
          pricingSummary: {
            price: {
              value: updates.price,
              currency: updates.currency || 'USD'
            }
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Failed to update listing: ${errorData}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error updating eBay listing:', error)
      throw error
    }
  }

  // Get orders
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
      return data.orders || []
    } catch (error) {
      console.error('Error fetching eBay orders:', error)
      throw error
    }
  }

  // Get specific order
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
      return data
    } catch (error) {
      console.error('Error fetching eBay order:', error)
      throw error
    }
  }
}
