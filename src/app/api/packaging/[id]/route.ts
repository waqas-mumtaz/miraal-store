import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch single packaging item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify user authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch packaging item
    const packagingItem = await prisma.packagingItem.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!packagingItem) {
      return NextResponse.json({ error: 'Packaging item not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: packagingItem,
      message: 'Packaging item retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching packaging item:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch packaging item',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update packaging item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify user authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      type,
      dimensions,
      weight,
      cost,
      stock,
      reorderPoint,
      status,
      description
    } = body;

    // Validate required fields
    if (!name || !type || weight === undefined || cost === undefined || stock === undefined || reorderPoint === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if packaging item exists and belongs to user
    const existingItem = await prisma.packagingItem.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Packaging item not found' },
        { status: 404 }
      );
    }

    // Update packaging item
    const updatedItem = await prisma.packagingItem.update({
      where: { id },
      data: {
        name,
        type,
        dimensions: dimensions || null,
        weight: parseFloat(weight),
        cost: parseFloat(cost),
        stock: parseInt(stock),
        reorderPoint: parseInt(reorderPoint),
        status: status || 'ACTIVE',
        description: description || null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: 'Packaging item updated successfully'
    });

  } catch (error) {
    console.error('Error updating packaging item:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update packaging item',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete packaging item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify user authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id } = await params;

    // Check if packaging item exists and belongs to user
    const existingItem = await prisma.packagingItem.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Packaging item not found' },
        { status: 404 }
      );
    }

    // Check if packaging item is used in any products
    const productsUsingPackaging = await prisma.product.findFirst({
      where: {
        packagingId: id,
        userId: user.id,
      },
    });

    if (productsUsingPackaging) {
      return NextResponse.json(
        { error: 'Cannot delete packaging item that is being used by products' },
        { status: 400 }
      );
    }

    // Delete packaging item
    await prisma.packagingItem.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Packaging item deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting packaging item:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete packaging item',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}