import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/products - Fetch all products
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
        { sku: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get products with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
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
      prisma.product.count({ where })
    ])

    return NextResponse.json({
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        sku: product.sku,
        currentQuantity: product.currentQuantity,
        unitCost: product.unitCost,
        totalCOG: product.totalCOG,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        linkedExpenses: product.linkedExpenses.map(link => ({
          id: link.id,
          allocatedCost: link.allocatedCost,
          expense: link.expense
        })),
        lastReplenishment: product.replenishments[0] || null
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create new product
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
      sku,
      unitCost 
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

    // Create the product
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        sku: sku?.trim() || null,
        unitCost: parseFloat(unitCost),
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
      message: 'Product created successfully',
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        sku: product.sku,
        currentQuantity: product.currentQuantity,
        unitCost: product.unitCost,
        totalCOG: product.totalCOG,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        linkedExpenses: product.linkedExpenses.map(link => ({
          id: link.id,
          allocatedCost: link.allocatedCost,
          expense: link.expense
        })),
        lastReplenishment: product.replenishments[0] || null
      }
    })

  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
