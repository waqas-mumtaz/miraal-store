import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/inventory - Fetch combined products and packaging
export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify the token
    const user = await verifyToken(token)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    // Build where clause for products
    const productWhere: any = {
      userId: user.id,
      isActive: true
    }

    if (search) {
      productWhere.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Build where clause for packaging
    const packagingWhere: any = {
      userId: user.id,
      isActive: true
    }

    if (search) {
      packagingWhere.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get products and packaging with pagination
    const [products, packagingItems, productTotal, packagingTotal] = await Promise.all([
      prisma.product.findMany({
        where: productWhere,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          replenishments: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      }),
      prisma.packaging.findMany({
        where: packagingWhere,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          replenishments: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      }),
      prisma.product.count({ where: productWhere }),
      prisma.packaging.count({ where: packagingWhere })
    ])

    // Combine and format the results
    const allItems = [
      ...products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        type: 'Product',
        sku: product.sku,
        currentQuantity: product.currentQuantity,
        unitCost: product.unitCost,
        totalCOG: product.totalCOG,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        lastReplenishment: product.replenishments[0] || null
      })),
      ...packagingItems.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        type: 'Packaging',
        sku: item.type,
        currentQuantity: item.currentQuantity,
        unitCost: item.unitCost,
        totalCOG: item.totalCost,
        isActive: item.isActive,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        lastReplenishment: item.replenishments[0] || null
      }))
    ]

    // Sort by creation date
    allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      inventoryItems: allItems,
      pagination: {
        page,
        limit,
        total: productTotal + packagingTotal,
        totalPages: Math.ceil((productTotal + packagingTotal) / limit)
      }
    })

  } catch (error) {
    console.error('Inventory fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

