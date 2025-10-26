import { NextRequest, NextResponse } from 'next/server'
import { generateUserAuthUrl } from '@/lib/ebay-oauth'

export async function GET(request: NextRequest) {
  try {
    const oauthUrl = generateUserAuthUrl('test-state')
    
    return NextResponse.json({
      success: true,
      message: 'OAuth URL generated with German marketplace',
      oauthUrl,
      marketplace: 'Germany (ID: 77)',
      parsedUrl: new URL(oauthUrl)
    })

  } catch (error) {
    console.error('OAuth URL test error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate OAuth URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
