import { NextResponse } from 'next/server'
import { generateUserAuthUrl, getDebugInfo, checkEnvironmentVariables } from '@/lib/ebay-oauth'

export async function GET() {
  try {
    const envCheck = checkEnvironmentVariables()
    const debugInfo = getDebugInfo()
    
    // Try to generate OAuth URL
    let oauthUrl = null
    try {
      oauthUrl = generateUserAuthUrl('test-state-123')
    } catch (error) {
      console.error('Error generating OAuth URL:', error)
    }
    
    return NextResponse.json({
      oauthUrl,
      debugInfo,
      environmentCheck: envCheck,
      environment: {
        EBAY_APP_ID: process.env.EBAY_APP_ID,
        EBAY_CERT_ID: process.env.EBAY_CERT_ID,
        EBAY_DEV_ID: process.env.EBAY_DEV_ID,
        EBAY_RU_NAME: process.env.EBAY_RU_NAME,
        EBAY_REDIRECT_URI: process.env.EBAY_REDIRECT_URI,
        NODE_ENV: process.env.NODE_ENV
      },
      message: 'Debug information for eBay OAuth using official client'
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Debug failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
