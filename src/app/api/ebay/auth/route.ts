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

    // Generate a random state parameter for security
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    // Build OAuth URL
    const oauthUrl = buildOAuthUrl(state)
    
    // Store state in a secure way (you might want to store this in database with user ID)
    // For now, we'll return the URL and let the frontend handle the redirect
    
    return NextResponse.json({
      oauthUrl,
      state,
      message: 'Redirect user to this URL to authorize eBay access'
    })
    
  } catch (error) {
    console.error('eBay OAuth error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate eBay OAuth' },
      { status: 500 }
    )
  }
}
