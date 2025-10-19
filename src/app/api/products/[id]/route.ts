import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/products/[id] - Get single product with linked expenses and COG
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

    const { id: productId } = await params

    // Get product with linked expenses and replenishment history
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        userId: user.id
      },
      include: {
        replenishments: {
          orderBy: { createdAt: 'desc' },
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Calculate total COG from product's own totalCOG field
    const totalCOG = Number(product.totalCOG)

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        sku: product.sku,
        quantity: product.quantity,
        cost: product.cost,
        shipping: product.shipping,
        vat: product.vat,
        totalCost: product.totalCost,
        type: product.type,
        linkedPackaging: product.linkedPackaging,
        packagingCost: product.packagingCost,
        miscCost: product.miscCost,
        currentQuantity: product.currentQuantity,
        unitCost: product.unitCost,
        totalCOG: totalCOG,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        replenishments: product.replenishments.map(replenishment => ({
          id: replenishment.id,
          quantity: replenishment.quantity,
          cost: replenishment.cost,
          unitCost: replenishment.unitCost,
          date: replenishment.date,
          invoiceLink: replenishment.invoiceLink,
          comments: replenishment.comments,
          createdAt: replenishment.createdAt,
        }))
      }
    })

  } catch (error) {
    console.error('Product fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Update product
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

    const { id: productId } = await params

    // Check if product exists and belongs to the user
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        userId: user.id
      }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const { 
      name, 
      description, 
      sku,
      quantity,
      cost,
      shipping,
      vat,
      totalCost,
      type,
      linkedPackaging,
      packagingCost,
      miscCost,
      unitCost 
    } = await request.json()

    // Validate required fields
    if (!name || !quantity || !cost || !type) {
      return NextResponse.json(
        { error: 'Name, quantity, cost, and type are required' },
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

    // Validate FBM packaging requirement
    if (type === 'FBM' && !linkedPackaging) {
      return NextResponse.json(
        { error: 'Packaging is required for FBM products' },
        { status: 400 }
      )
    }

    // Update the product
    const product = await prisma.product.update({
      where: {
        id: productId
      },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        sku: sku?.trim() || null,
        quantity: parseInt(quantity),
        cost: parseFloat(cost),
        shipping: parseFloat(shipping || 0),
        vat: parseFloat(vat || 0),
        totalCost: parseFloat(totalCost),
        type: type.trim(),
        linkedPackaging: linkedPackaging?.trim() || null,
        packagingCost: parseFloat(packagingCost || 0),
        miscCost: parseFloat(miscCost || 0),
        unitCost: parseFloat(unitCost),
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
      message: 'Product updated successfully',
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        sku: product.sku,
        quantity: product.quantity,
        cost: product.cost,
        shipping: product.shipping,
        vat: product.vat,
        totalCost: product.totalCost,
        type: product.type,
        linkedPackaging: product.linkedPackaging,
        packagingCost: product.packagingCost,
        miscCost: product.miscCost,
        currentQuantity: product.currentQuantity,
        unitCost: product.unitCost,
        totalCOG: product.totalCOG,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        lastReplenishment: product.replenishments[0] || null
      }
    })

  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Delete product (hard delete with cascade)
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

    const { id: productId } = await params

    // Check if product exists and belongs to the user
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        userId: user.id
      }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Hard delete - this will cascade delete replenishments and expenses
    await prisma.product.delete({
      where: {
        id: productId,
        userId: user.id
      }
    })

    return NextResponse.json({
      message: 'Product deleted successfully'
    })

  } catch (error) {
    console.error('Product deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
