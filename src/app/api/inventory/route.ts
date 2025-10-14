import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/inventory - Fetch all inventory items
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

    // Build where clause
    const where: any = {
      userId: user.id,
      isActive: true
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get inventory items with pagination
    const [inventoryItems, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          replenishments: {
            orderBy: { createdAt: 'desc' },
            take: 1 // Get latest replenishment
          }
        }
      }),
      prisma.inventoryItem.count({ where })
    ])

    return NextResponse.json({
      inventoryItems: inventoryItems.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        currentQuantity: item.currentQuantity,
        unitCost: item.unitCost,
        linkedProducts: item.linkedProducts ? JSON.parse(item.linkedProducts) : [],
        isActive: item.isActive,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        lastReplenishment: item.replenishments[0] || null
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
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

// POST /api/inventory - Create new inventory item
export async function POST(request: NextRequest) {
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

    const { 
      name, 
      description, 
      unitCost, 
      linkedProducts 
    } = await request.json()

    // Validate required fields
    if (!name || !unitCost) {
      return NextResponse.json(
        { error: 'Name and unit cost are required' },
        { status: 400 }
      )
    }

    // Validate data types
    if (isNaN(unitCost) || unitCost <= 0) {
      return NextResponse.json(
        { error: 'Unit cost must be a positive number' },
        { status: 400 }
      )
    }

    // Create the inventory item
    const inventoryItem = await prisma.inventoryItem.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        unitCost: parseFloat(unitCost),
        linkedProducts: linkedProducts ? JSON.stringify(linkedProducts) : null,
        userId: user.id,
      },
      include: {
        replenishments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    return NextResponse.json({
      message: 'Inventory item created successfully',
      inventoryItem: {
        id: inventoryItem.id,
        name: inventoryItem.name,
        description: inventoryItem.description,
        currentQuantity: inventoryItem.currentQuantity,
        unitCost: inventoryItem.unitCost,
        linkedProducts: inventoryItem.linkedProducts ? JSON.parse(inventoryItem.linkedProducts) : [],
        isActive: inventoryItem.isActive,
        createdAt: inventoryItem.createdAt,
        updatedAt: inventoryItem.updatedAt,
        lastReplenishment: inventoryItem.replenishments[0] || null
      }
    })

  } catch (error) {
    console.error('Inventory creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
