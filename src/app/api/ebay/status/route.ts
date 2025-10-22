import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Check if user has eBay credentials stored
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        // Add these fields to your User model if you want to store eBay tokens
        // ebayAccessToken: true,
        // ebayRefreshToken: true,
        // ebayTokenExpiry: true,
      }
    })

    // For now, we'll just return false since we haven't implemented token storage yet
    // You can implement this later when you add the fields to your User model
    const isConnected = false // dbUser?.ebayAccessToken ? true : false

    return NextResponse.json({
      connected: isConnected,
      message: isConnected ? 'eBay account connected' : 'eBay account not connected'
    })
    
  } catch (error) {
    console.error('eBay status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check eBay status' },
      { status: 500 }
    )
  }
}
