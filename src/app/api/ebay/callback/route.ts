import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isAuthSuccessful = searchParams.get('isAuthSuccessful')
    const SessID = searchParams.get('SessID')
    // const runame = searchParams.get('runame') // Not used in current implementation

    // Handle Auth'n'auth errors
    if (isAuthSuccessful === 'false' || !SessID) {
      return NextResponse.json({
        error: 'eBay Auth failed',
        details: 'User declined authorization or session failed'
      }, { status: 400 })
    }

    // Verify user authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Store eBay session in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // You might want to add these fields to your User model
        // ebaySessionId: SessID,
        // ebayRuName: runame,
        updatedAt: new Date()
      }
    })

    // Redirect back to the application
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NODE_ENV === 'production' 
        ? 'https://miraal-store.vercel.app' 
        : 'http://localhost:3000'
    
    return NextResponse.redirect(new URL('/ebay/orders?ebay_connected=true', baseUrl))
    
  } catch (error) {
    console.error('eBay callback error:', error)
    return NextResponse.json(
      { error: 'Failed to process eBay Auth callback' },
      { status: 500 }
    )
  }
}
