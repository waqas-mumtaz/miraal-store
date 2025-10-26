import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Test direct API call to eBay sandbox
    const ebayApiUrl = 'https://api.sandbox.ebay.com/sell/fulfillment/v1/order'
    
    console.log('Making direct API call to eBay sandbox...')
    console.log('URL:', ebayApiUrl)
    console.log('Token:', dbUser.ebayAccessToken.substring(0, 20) + '...')

    const response = await fetch(ebayApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${dbUser.ebayAccessToken}`,
        'Content-Type': 'application/json',
        'X-EBAY-SOA-OPERATION-NAME': 'getOrders',
      },
    })

    const responseText = await response.text()
    console.log('eBay API Response Status:', response.status)
    console.log('eBay API Response Headers:', Object.fromEntries(response.headers.entries()))
    console.log('eBay API Response Body:', responseText)

    if (!response.ok) {
      return NextResponse.json({
        error: 'eBay API call failed',
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText
      }, { status: response.status })
    }

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (parseError) {
      responseData = responseText
    }

    return NextResponse.json({
      success: true,
      message: 'Direct eBay API call successful',
      data: responseData,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries())
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
