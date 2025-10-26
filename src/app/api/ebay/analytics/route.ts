import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { createEbayService } from '@/lib/ebay-api-service'

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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const metrics = searchParams.get('metrics')?.split(',') || ['SALES', 'TRANSACTION']

    // Create eBay service
    const ebayService = await createEbayService(user.id)

    // Test connection first
    const connectionTest = await ebayService.testConnection()
    if (!connectionTest.success) {
      return NextResponse.json({ 
        error: 'eBay connection failed',
        message: connectionTest.error
      }, { status: 400 })
    }

    // Set date range
    const dateRange = startDate && endDate ? {
      from: new Date(startDate),
      to: new Date(endDate)
    } : {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      to: new Date()
    }

    // Fetch analytics from eBay
    const [salesAnalytics, performanceMetrics] = await Promise.all([
      ebayService.analytics.getSalesAnalytics({
        dateRange,
        metrics
      }),
      ebayService.analytics.getPerformanceMetrics()
    ])

    return NextResponse.json({
      salesAnalytics,
      performanceMetrics,
      dateRange,
      message: 'eBay analytics retrieved successfully'
    })
    
  } catch (error) {
    console.error('eBay analytics error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch eBay analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
