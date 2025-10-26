import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Test direct API call to eBay sandbox without authentication
    const ebayApiUrl = 'https://api.sandbox.ebay.com/sell/fulfillment/v1/order'
    
    console.log('Making direct API call to eBay sandbox...')
    console.log('URL:', ebayApiUrl)

    const response = await fetch(ebayApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-EBAY-SOA-OPERATION-NAME': 'getOrders',
      },
    })

    const responseText = await response.text()
    console.log('eBay API Response Status:', response.status)
    console.log('eBay API Response Headers:', Object.fromEntries(response.headers.entries()))
    console.log('eBay API Response Body:', responseText)

    return NextResponse.json({
      success: true,
      message: 'Direct eBay API call completed',
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText
    })

  } catch (error) {
    console.error('Direct eBay API test error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to test direct eBay API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
