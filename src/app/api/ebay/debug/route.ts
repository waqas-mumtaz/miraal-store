import { NextResponse } from 'next/server'
import { buildAuthUrl } from '@/lib/ebay'

export async function GET() {
  try {
    const authUrl = buildAuthUrl()
    
    return NextResponse.json({
      authUrl,
      environment: {
        EBAY_APP_ID: process.env.EBAY_APP_ID,
        EBAY_CERT_ID: process.env.EBAY_CERT_ID,
        EBAY_DEV_ID: process.env.EBAY_DEV_ID,
        EBAY_RU_NAME: process.env.EBAY_RU_NAME,
        EBAY_REDIRECT_URI: process.env.EBAY_REDIRECT_URI,
        NODE_ENV: process.env.NODE_ENV
      },
      message: 'Debug information for eBay Auth'
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Debug failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
