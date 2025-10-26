import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createEbayDirectApi } from '@/lib/ebay-direct-api'

export async function GET(request: NextRequest) {
  try {
    // Get the first user with eBay connection (for testing)
    const user = await prisma.user.findFirst({
      where: {
        ebayConnected: true,
        ebayAccessToken: { not: null }
      },
      select: {
        id: true,
        email: true,
        ebayAccessToken: true,
        ebayRefreshToken: true,
        ebayTokenExpiry: true,
        ebayConnected: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'No user with eBay connection found' }, { status: 404 })
    }

    console.log('Testing direct eBay API for user:', user.id)

    // Try to create direct API client
    let ebayApi
    try {
      ebayApi = await createEbayDirectApi(user.id)
    } catch (error) {
      return NextResponse.json({
        error: 'Failed to create eBay direct API client',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

    // Test connection
    const connectionTest = await ebayApi.testConnection()

    return NextResponse.json({
      success: true,
      message: 'Direct eBay API test completed',
      user: {
        id: user.id,
        email: user.email,
        ebayConnected: user.ebayConnected,
        hasAccessToken: !!user.ebayAccessToken,
        hasRefreshToken: !!user.ebayRefreshToken,
        tokenExpiry: user.ebayTokenExpiry
      },
      connectionTest
    })

  } catch (error) {
    console.error('Direct eBay API test error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to test direct eBay API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
