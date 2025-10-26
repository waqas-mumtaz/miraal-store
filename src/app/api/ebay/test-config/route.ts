import { NextRequest, NextResponse } from 'next/server'
import { getEbayConfig, checkEnvironmentVariables } from '@/lib/ebay-oauth'

export async function GET(request: NextRequest) {
  try {
    const config = getEbayConfig()
    const envCheck = checkEnvironmentVariables()
    
    return NextResponse.json({
      success: true,
      message: 'eBay configuration test',
      config: {
        environment: config.environment,
        clientId: config.clientId.substring(0, 20) + '...',
        clientSecret: config.clientSecret.substring(0, 20) + '...',
        redirectUri: config.redirectUri,
        isProduction: config.environment === 'PRODUCTION'
      },
      environment: envCheck,
      isProductionDetected: process.env.EBAY_APP_ID?.includes('PRD')
    })

  } catch (error) {
    console.error('eBay config test error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to test eBay config',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
