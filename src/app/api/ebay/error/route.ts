import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    
    // Log the error for debugging
    console.log('eBay OAuth Error:', {
      error,
      errorDescription,
      timestamp: new Date().toISOString()
    })
    
    // Redirect to the eBay test page with error information
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NODE_ENV === 'production' 
        ? 'https://miraal-store.vercel.app' 
        : 'http://localhost:3000'
    
    const errorMessage = error ? `eBay OAuth Error: ${error}` : 'eBay OAuth was declined'
    const errorDetails = errorDescription || 'User declined the authorization'
    
    // Redirect to test page with error parameters
    const redirectUrl = new URL('/ebay/test', baseUrl)
    redirectUrl.searchParams.set('error', errorMessage)
    redirectUrl.searchParams.set('details', errorDetails)
    
    return NextResponse.redirect(redirectUrl)
    
  } catch (error) {
    console.error('eBay error handler failed:', error)
    
    // Fallback redirect
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NODE_ENV === 'production' 
        ? 'https://miraal-store.vercel.app' 
        : 'http://localhost:3000'
    
    return NextResponse.redirect(new URL('/ebay/test?error=Unknown error occurred', baseUrl))
  }
}
