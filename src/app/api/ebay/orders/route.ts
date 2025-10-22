import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { EbayOrdersService } from '@/lib/ebay-orders'

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

    // For now, we'll use a mock access token since we haven't implemented token storage yet
    // In production, you'd get this from the database
    const mockAccessToken = 'mock-access-token'
    const ordersService = new EbayOrdersService(mockAccessToken)

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const orderId = searchParams.get('orderId')

    let orders

    if (orderId) {
      // Get specific order
      const order = await ordersService.getOrder(orderId)
      return NextResponse.json({ order })
    } else if (startDate && endDate) {
      // Get orders by date range
      orders = await ordersService.getOrdersByDateRange(startDate, endDate)
    } else {
      // Get all orders
      orders = await ordersService.getOrders()
    }

    return NextResponse.json({
      orders,
      count: orders.length,
      message: 'Orders fetched successfully'
    })
    
  } catch (error) {
    console.error('eBay orders fetch error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch eBay orders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
