import { NextRequest, NextResponse } from 'next/server'
import { generateUserAuthUrl, getDebugInfo } from '@/lib/ebay-oauth'
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
    
    // Generate OAuth URL using official eBay client
    const oauthUrl = generateUserAuthUrl(state)
    
    // Debug: Log the generated URL and config
    console.log('Generated OAuth URL:', oauthUrl)
    console.log('Debug info:', getDebugInfo())
    
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
