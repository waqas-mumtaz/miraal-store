import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/packaging - Fetch all packaging items
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
        { description: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get packaging items with pagination
    const [packagingItems, total] = await Promise.all([
      prisma.packaging.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          linkedExpenses: {
            include: {
              expense: {
                select: {
                  id: true,
                  title: true,
                  date: true,
                  totalAmount: true
                }
              }
            }
          },
          replenishments: {
            orderBy: { createdAt: 'desc' },
            take: 1 // Get latest replenishment
          }
        }
      }),
      prisma.packaging.count({ where })
    ])

    return NextResponse.json({
      packagingItems: packagingItems.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        type: item.type,
        currentQuantity: item.currentQuantity,
        unitCost: item.unitCost,
        totalCOG: item.totalCOG,
        linkedProducts: item.linkedProducts ? JSON.parse(item.linkedProducts) : [],
        isActive: item.isActive,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        linkedExpenses: item.linkedExpenses.map(link => ({
          id: link.id,
          allocatedCost: link.allocatedCost,
          expense: link.expense
        })),
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
    console.error('Packaging fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/packaging - Create new packaging item
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
      type,
      unitCost,
      linkedProducts 
    } = await request.json()

    // Validate required fields
    if (!name || !type || !unitCost) {
      return NextResponse.json(
        { error: 'Name, type, and unit cost are required' },
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

    // Create the packaging item
    const packaging = await prisma.packaging.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        type: type.trim(),
        unitCost: parseFloat(unitCost),
        linkedProducts: linkedProducts ? JSON.stringify(linkedProducts) : null,
        userId: user.id,
      },
      include: {
        linkedExpenses: {
          include: {
            expense: {
              select: {
                id: true,
                title: true,
                date: true,
                totalAmount: true
              }
            }
          }
        },
        replenishments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    return NextResponse.json({
      message: 'Packaging item created successfully',
      packaging: {
        id: packaging.id,
        name: packaging.name,
        description: packaging.description,
        type: packaging.type,
        currentQuantity: packaging.currentQuantity,
        unitCost: packaging.unitCost,
        totalCOG: packaging.totalCOG,
        linkedProducts: packaging.linkedProducts ? JSON.parse(packaging.linkedProducts) : [],
        isActive: packaging.isActive,
        createdAt: packaging.createdAt,
        updatedAt: packaging.updatedAt,
        linkedExpenses: packaging.linkedExpenses.map(link => ({
          id: link.id,
          allocatedCost: link.allocatedCost,
          expense: link.expense
        })),
        lastReplenishment: packaging.replenishments[0] || null
      }
    })

  } catch (error) {
    console.error('Packaging creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
