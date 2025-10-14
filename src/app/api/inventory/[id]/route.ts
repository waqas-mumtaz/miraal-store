import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/inventory/[id] - Get single inventory item with replenishment history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: itemId } = await params

    // Get inventory item with replenishment history
    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        id: itemId,
        userId: user.id
      },
      include: {
        replenishments: {
          orderBy: { createdAt: 'desc' },
          include: {
            expense: {
              select: {
                id: true,
                title: true,
                date: true
              }
            }
          }
        }
      }
    })

    if (!inventoryItem) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
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
        replenishments: inventoryItem.replenishments.map(replenishment => ({
          id: replenishment.id,
          quantity: replenishment.quantity,
          cost: replenishment.cost,
          unitCost: replenishment.unitCost,
          date: replenishment.date,
          invoiceLink: replenishment.invoiceLink,
          comments: replenishment.comments,
          createdAt: replenishment.createdAt,
          expense: replenishment.expense
        }))
      }
    })

  } catch (error) {
    console.error('Inventory item fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/inventory/[id] - Update inventory item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: itemId } = await params

    // Check if inventory item exists and belongs to the user
    const existingItem = await prisma.inventoryItem.findFirst({
      where: {
        id: itemId,
        userId: user.id
      }
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
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

    // Update the inventory item
    const inventoryItem = await prisma.inventoryItem.update({
      where: {
        id: itemId
      },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        unitCost: parseFloat(unitCost),
        linkedProducts: linkedProducts ? JSON.stringify(linkedProducts) : null,
        updatedAt: new Date()
      },
      include: {
        replenishments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    return NextResponse.json({
      message: 'Inventory item updated successfully',
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
    console.error('Inventory item update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/inventory/[id] - Delete inventory item (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: itemId } = await params

    // Check if inventory item exists and belongs to the user
    const existingItem = await prisma.inventoryItem.findFirst({
      where: {
        id: itemId,
        userId: user.id
      }
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      )
    }

    // Soft delete by setting isActive to false
    await prisma.inventoryItem.update({
      where: {
        id: itemId
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Inventory item deleted successfully'
    })

  } catch (error) {
    console.error('Inventory item deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
