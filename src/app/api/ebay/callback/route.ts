import { NextRequest, NextResponse } from 'next/server'
import { EBAY_CREDENTIALS, getEbayConfig } from '@/lib/ebay'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      return NextResponse.json({
        error: 'eBay OAuth failed',
        details: error,
        description: searchParams.get('error_description')
      }, { status: 400 })
    }

    if (!code) {
      return NextResponse.json({
        error: 'Authorization code not provided'
      }, { status: 400 })
    }

    // Verify user authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Exchange authorization code for access token
    const config = getEbayConfig()
    const tokenResponse = await fetch(`${config.AUTH_URL}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${EBAY_CREDENTIALS.APP_ID}:${EBAY_CREDENTIALS.CERT_ID}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: config.REDIRECT_URI
      })
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('eBay token exchange failed:', errorData)
      return NextResponse.json({
        error: 'Failed to exchange authorization code for access token',
        details: errorData
      }, { status: 400 })
    }

    const tokenData = await tokenResponse.json()
    
    // Store eBay credentials in database (you might want to encrypt these)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // You might want to add these fields to your User model
        // ebayAccessToken: tokenData.access_token,
        // ebayRefreshToken: tokenData.refresh_token,
        // ebayTokenExpiry: new Date(Date.now() + (tokenData.expires_in * 1000)),
        updatedAt: new Date()
      }
    })

    // Redirect back to the application
    return NextResponse.redirect(new URL('/planner/ebay?ebay_connected=true', request.url))
    
  } catch (error) {
    console.error('eBay callback error:', error)
    return NextResponse.json(
      { error: 'Failed to process eBay OAuth callback' },
      { status: 500 }
    )
  }
}
