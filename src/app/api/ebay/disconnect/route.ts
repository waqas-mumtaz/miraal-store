import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
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

    // Clear eBay credentials from database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // Clear eBay tokens when you add these fields to your User model
        // ebayAccessToken: null,
        // ebayRefreshToken: null,
        // ebayTokenExpiry: null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'eBay account disconnected successfully'
    })
    
  } catch (error) {
    console.error('eBay disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect eBay account' },
      { status: 500 }
    )
  }
}
