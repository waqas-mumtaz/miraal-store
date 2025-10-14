import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/products/[id]/replenish - Add replenishment to product
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

    const { id: productId } = await params

    // Check if product exists and belongs to the user
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        userId: user.id
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
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

    // Use transaction to update product and create replenishment record
    const result = await prisma.$transaction(async (tx) => {
      // Create replenishment record
      const replenishment = await tx.productReplenishment.create({
        data: {
          quantity: parseInt(quantity),
          cost: parseFloat(cost),
          unitCost: unitCost,
          date: new Date(date),
          invoiceLink: invoiceLink?.trim() || null,
          comments: comments?.trim() || null,
          productId: productId,
          userId: user.id,
          expenseId: expenseId || null
        }
      })

      // Update product quantity
      const updatedProduct = await tx.product.update({
        where: {
          id: productId
        },
        data: {
          currentQuantity: {
            increment: parseInt(quantity)
          },
          updatedAt: new Date()
        }
      })

      return { replenishment, updatedProduct }
    })

    return NextResponse.json({
      message: 'Product replenished successfully',
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
      product: {
        id: result.updatedProduct.id,
        currentQuantity: result.updatedProduct.currentQuantity,
        unitCost: result.updatedProduct.unitCost
      }
    })

  } catch (error) {
    console.error('Product replenishment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
