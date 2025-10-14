import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/inventory/[id]/replenish - Add replenishment to inventory item
export async function POST(
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
    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        id: itemId,
        userId: user.id
      }
    })

    if (!inventoryItem) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      )
    }

    const { 
      quantity, 
      cost, 
      date, 
      invoiceLink, 
      comments, 
      expenseId 
    } = await request.json()

    // Validate required fields
    if (!quantity || !cost || !date) {
      return NextResponse.json(
        { error: 'Quantity, cost, and date are required' },
        { status: 400 }
      )
    }

    // Validate data types
    if (isNaN(quantity) || quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be a positive number' },
        { status: 400 }
      )
    }

    if (isNaN(cost) || cost <= 0) {
      return NextResponse.json(
        { error: 'Cost must be a positive number' },
        { status: 400 }
      )
    }

    // Calculate unit cost
    const unitCost = cost / quantity

    // Use transaction to update inventory and create replenishment record
    const result = await prisma.$transaction(async (tx) => {
      // Create replenishment record
      const replenishment = await tx.inventoryReplenishment.create({
        data: {
          quantity: parseInt(quantity),
          cost: parseFloat(cost),
          unitCost: unitCost,
          date: new Date(date),
          invoiceLink: invoiceLink?.trim() || null,
          comments: comments?.trim() || null,
          inventoryItemId: itemId,
          userId: user.id,
          expenseId: expenseId || null
        }
      })

      // Update inventory item quantity
      const updatedItem = await tx.inventoryItem.update({
        where: {
          id: itemId
        },
        data: {
          currentQuantity: {
            increment: parseInt(quantity)
          },
          updatedAt: new Date()
        }
      })

      return { replenishment, updatedItem }
    })

    return NextResponse.json({
      message: 'Inventory replenished successfully',
      replenishment: {
        id: result.replenishment.id,
        quantity: result.replenishment.quantity,
        cost: result.replenishment.cost,
        unitCost: result.replenishment.unitCost,
        date: result.replenishment.date,
        invoiceLink: result.replenishment.invoiceLink,
        comments: result.replenishment.comments,
        createdAt: result.replenishment.createdAt
      },
      inventoryItem: {
        id: result.updatedItem.id,
        currentQuantity: result.updatedItem.currentQuantity,
        unitCost: result.updatedItem.unitCost
      }
    })

  } catch (error) {
    console.error('Inventory replenishment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
