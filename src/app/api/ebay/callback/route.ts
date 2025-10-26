import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { exchangeCodeForToken } from '@/lib/ebay-oauth'

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
        details: `OAuth error: ${error}`
      }, { status: 400 })
    }

    if (!code) {
      return NextResponse.json({
        error: 'eBay OAuth failed',
        details: 'No authorization code received'
      }, { status: 400 })
    }

    // Verify user authentication - try multiple methods
    let user = null
    let token = request.cookies.get('auth-token')?.value
    
    // Try to get token from cookies first
    if (token) {
      try {
        user = await verifyToken(token)
      } catch (error) {
        console.log('Token verification failed:', error)
      }
    }
    
    // If no user found, try to get from Authorization header
    if (!user) {
      const authHeader = request.headers.get('Authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
        try {
          user = await verifyToken(token)
        } catch (error) {
          console.log('Authorization header token verification failed:', error)
        }
      }
    }
    
    // If still no user, try to get user from state parameter (fallback for session loss)
    if (!user && state) {
      try {
        const userId = state.split(':')[0] // Extract user ID from state
        if (userId) {
          user = await prisma.user.findUnique({
            where: { id: userId }
          })
          console.log('Retrieved user from state parameter:', user ? 'Found' : 'Not found')
        }
      } catch (error) {
        console.log('Error retrieving user from state:', error)
      }
    }
    
    // If still no user, redirect to login with a message
    if (!user) {
      console.log('No valid authentication found, redirecting to login')
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : process.env.NODE_ENV === 'production' 
          ? 'https://miraal-store.vercel.app' 
          : 'https://www.localhost:3001'
      
      return NextResponse.redirect(new URL('/signin?message=Please login to connect eBay', baseUrl))
    }

    // Exchange authorization code for access token using official eBay client
    let tokenData, parsedTokenData
    try {
      tokenData = await exchangeCodeForToken(code)
      console.log('Raw token data received:', typeof tokenData, tokenData ? 'Present' : 'Missing')
      
      // Parse the token data if it's a JSON string
      parsedTokenData = tokenData
      if (typeof tokenData === 'string') {
        try {
          parsedTokenData = JSON.parse(tokenData)
        } catch (parseError) {
          console.error('Error parsing token data:', parseError)
          throw new Error(`Failed to parse token data: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`)
        }
      }
      
      console.log('eBay token exchange successful:', {
        tokenData: parsedTokenData,
        accessToken: parsedTokenData?.access_token ? 'Present' : 'Missing',
        refreshToken: parsedTokenData?.refresh_token ? 'Present' : 'Missing',
        expiresIn: parsedTokenData?.expires_in
      })
    } catch (tokenError) {
      console.error('Token exchange error:', tokenError)
      throw new Error(`Failed to exchange authorization code for token: ${tokenError instanceof Error ? tokenError.message : 'Unknown token error'}`)
    }

    // Store eBay tokens in database
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ebayAccessToken: parsedTokenData.access_token,
          ebayRefreshToken: parsedTokenData.refresh_token,
          ebayTokenExpiry: new Date(Date.now() + (parsedTokenData.expires_in * 1000)),
          ebayConnected: true,
          updatedAt: new Date()
        }
      })
      
      console.log('eBay tokens stored successfully for user:', user.id)
    } catch (dbError) {
      console.error('Database error storing eBay tokens:', dbError)
      throw new Error(`Failed to store eBay tokens: ${dbError instanceof Error ? dbError.message : 'Unknown database error'}`)
    }

    // Redirect back to the application
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NODE_ENV === 'production' 
        ? 'https://miraal-store.vercel.app' 
        : 'https://www.localhost:3001'
    
    return NextResponse.redirect(new URL('/ebay/orders?ebay_connected=true', baseUrl))
    
  } catch (error) {
    console.error('eBay callback error:', error)
    return NextResponse.json(
      { error: 'Failed to process eBay Auth callback' },
      { status: 500 }
    )
  }
}
