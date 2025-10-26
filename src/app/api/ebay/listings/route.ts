import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { createEbayService } from '@/lib/ebay-api-service'

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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const listingStatus = searchParams.get('status') || undefined
    const sku = searchParams.get('sku')

    // Create eBay service
    const ebayService = await createEbayService(user.id)

    // Test connection first
    const connectionTest = await ebayService.testConnection()
    if (!connectionTest.success) {
      return NextResponse.json({ 
        error: 'eBay connection failed',
        message: connectionTest.error
      }, { status: 400 })
    }

    if (sku) {
      // Get specific listing
      const listing = await ebayService.listings.getListing(sku)
      
      return NextResponse.json({
        listing,
        message: 'eBay listing retrieved successfully'
      })
    } else {
      // Fetch listings from eBay
      const listings = await ebayService.listings.getListings({
        limit,
        offset,
        listingStatus
      })

      return NextResponse.json({
        listings: listings.inventoryItems || [],
        total: listings.total || 0,
        limit,
        offset,
        message: 'eBay listings retrieved successfully'
      })
    }
    
  } catch (error) {
    console.error('eBay listings error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch eBay listings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

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

    const body = await request.json()
    const { sku, listingData } = body

    if (!sku || !listingData) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        message: 'sku and listingData are required'
      }, { status: 400 })
    }

    // Create eBay service
    const ebayService = await createEbayService(user.id)

    // Test connection first
    const connectionTest = await ebayService.testConnection()
    if (!connectionTest.success) {
      return NextResponse.json({ 
        error: 'eBay connection failed',
        message: connectionTest.error
      }, { status: 400 })
    }

    // Create or update listing
    const listing = await ebayService.listings.createListing(listingData)

    return NextResponse.json({
      listing,
      message: 'eBay listing created successfully'
    })
    
  } catch (error) {
    console.error('eBay listing creation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create eBay listing',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { sku, listingData } = body

    if (!sku || !listingData) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        message: 'sku and listingData are required'
      }, { status: 400 })
    }

    // Create eBay service
    const ebayService = await createEbayService(user.id)

    // Test connection first
    const connectionTest = await ebayService.testConnection()
    if (!connectionTest.success) {
      return NextResponse.json({ 
        error: 'eBay connection failed',
        message: connectionTest.error
      }, { status: 400 })
    }

    // Update listing
    const listing = await ebayService.listings.updateListing(sku, listingData)

    return NextResponse.json({
      listing,
      message: 'eBay listing updated successfully'
    })
    
  } catch (error) {
    console.error('eBay listing update error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update eBay listing',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
