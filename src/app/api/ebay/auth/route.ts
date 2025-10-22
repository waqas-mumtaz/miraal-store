import { NextRequest, NextResponse } from 'next/server'
import { buildOAuthUrl } from '@/lib/ebay'
import { verifyToken } from '@/lib/auth'

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

    // Generate a random state for security
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    // Build OAuth URL
    const oauthUrl = buildOAuthUrl(state)
    
    // Debug: Log the generated URL
    console.log('Generated OAuth URL:', oauthUrl)
    console.log('Environment variables:', {
      EBAY_APP_ID: process.env.EBAY_APP_ID,
      EBAY_REDIRECT_URI: process.env.EBAY_REDIRECT_URI
    })
    
    return NextResponse.json({
      oauthUrl,
      message: 'Redirect user to this URL to authorize eBay access'
    })
    
  } catch (error) {
    console.error('eBay Auth error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate eBay Auth' },
      { status: 500 }
    )
  }
}
