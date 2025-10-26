import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { createEbayDirectApi } from '@/lib/ebay-direct-api'

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const orderStatus = searchParams.get('status') || undefined
    const fulfillmentStatus = searchParams.get('fulfillmentStatus') || undefined
    const orderId = searchParams.get('orderId')

    // Create eBay direct API client
    const ebayApi = await createEbayDirectApi(user.id)

    // Test connection first
    const connectionTest = await ebayApi.testConnection()
    if (!connectionTest.success) {
      return NextResponse.json({ 
        error: 'eBay connection failed',
        message: connectionTest.error
      }, { status: 400 })
    }

    if (orderId) {
      // Get specific order
      const order = await ebayApi.getOrder(orderId)
      const lineItems = await ebayApi.getOrderLineItems(orderId)
      
      return NextResponse.json({
        order: {
          ...order,
          lineItems
        },
        message: 'eBay order retrieved successfully'
      })
    } else {
      // Fetch orders from eBay
      const orders = await ebayApi.getOrders({
        limit,
        offset,
        orderStatus,
        fulfillmentStatus
      })

      return NextResponse.json({
        orders: orders.orders || [],
        total: orders.total || 0,
        limit,
        offset,
        message: 'eBay orders retrieved successfully'
      })
    }
    
  } catch (error) {
    console.error('eBay orders error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch eBay orders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}