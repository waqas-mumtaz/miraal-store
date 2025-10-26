import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createEbayApiClient } from '@/lib/ebay-api-service'

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

    console.log('Testing eBay client creation for user:', user.id)

    // Try to create eBay API client
    let ebayClient
    try {
      ebayClient = await createEbayApiClient(user.id)
    } catch (error) {
      return NextResponse.json({
        error: 'Failed to create eBay client',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

    // Test connection using EbayService
    const { EbayService } = await import('@/lib/ebay-api-service')
    const ebayService = new EbayService(ebayClient)
    const connectionTest = await ebayService.testConnection()

    return NextResponse.json({
      success: true,
      message: 'eBay client test completed',
      user: {
        id: user.id,
        email: user.email,
        ebayConnected: user.ebayConnected,
        hasAccessToken: !!user.ebayAccessToken,
        hasRefreshToken: !!user.ebayRefreshToken,
        tokenExpiry: user.ebayTokenExpiry
      },
      connectionTest,
      clientInfo: {
        hasAuthToken: !!ebayClient.authToken,
        authTokenPreview: ebayClient.authToken ? ebayClient.authToken.substring(0, 20) + '...' : 'None'
      }
    })

  } catch (error) {
    console.error('eBay client test error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to test eBay client',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
