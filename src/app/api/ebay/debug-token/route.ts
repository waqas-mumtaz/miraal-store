import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createEbayApiClient } from '@/lib/ebay-api-service'

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

    // Get user's eBay tokens from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        ebayAccessToken: true,
        ebayRefreshToken: true,
        ebayTokenExpiry: true,
        ebayConnected: true,
      }
    })

    if (!dbUser?.ebayConnected || !dbUser.ebayAccessToken) {
      return NextResponse.json({ error: 'eBay account not connected' }, { status: 400 })
    }

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

    // Debug information
    const debugInfo = {
      user: {
        id: user.id,
        email: user.email
      },
      dbUser: {
        ebayConnected: dbUser.ebayConnected,
        hasAccessToken: !!dbUser.ebayAccessToken,
        hasRefreshToken: !!dbUser.ebayRefreshToken,
        tokenExpiry: dbUser.ebayTokenExpiry,
        accessTokenPreview: dbUser.ebayAccessToken ? dbUser.ebayAccessToken.substring(0, 20) + '...' : 'None'
      },
      ebayClient: {
        hasAuthToken: !!ebayClient.authToken,
        authTokenPreview: ebayClient.authToken ? ebayClient.authToken.substring(0, 20) + '...' : 'None',
        hasRefreshToken: !!ebayClient.refreshToken,
        refreshTokenPreview: ebayClient.refreshToken ? ebayClient.refreshToken.substring(0, 20) + '...' : 'None'
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        EBAY_APP_ID: process.env.EBAY_APP_ID ? 'Set' : 'Not set',
        EBAY_CERT_ID: process.env.EBAY_CERT_ID ? 'Set' : 'Not set',
        EBAY_DEV_ID: process.env.EBAY_DEV_ID ? 'Set' : 'Not set'
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Debug information collected',
      debug: debugInfo
    })

  } catch (error) {
    console.error('Debug token error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to debug token',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
