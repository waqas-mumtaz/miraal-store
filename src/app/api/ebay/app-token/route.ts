import { NextResponse } from 'next/server'
import { getApplicationToken } from '@/lib/ebay-oauth'

export async function GET() {
  try {
    // Get application token for app-level API calls
    const token = await getApplicationToken()
    
    return NextResponse.json({
      success: true,
      token: {
        accessToken: token.access_token ? 'Present' : 'Missing',
        tokenType: token.token_type,
        expiresIn: token.expires_in,
        scope: token.scope
      },
      message: 'Application token retrieved successfully'
    })
  } catch (error) {
    console.error('Error getting application token:', error)
    return NextResponse.json({
      error: 'Failed to get application token',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
