import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const packagingItem = await prisma.packagingItem.findFirst({
      where: {
        id: params.id,
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const body = await request.json();
    const {
      name,
      type,
      dimensions,
      weight,
      cost,
      stock,
      status,
      description,
      reorderPoint
    } = body;

    // Check if packaging item exists and belongs to user
    const existingItem = await prisma.packagingItem.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Packaging item not found' }, { status: 404 });
    }

    // Update packaging item
    const updatedItem = await prisma.packagingItem.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(type && { type: type.toUpperCase() }),
        ...(dimensions && { dimensions }),
        ...(weight !== undefined && { weight }),
        ...(cost !== undefined && { cost }),
        ...(stock !== undefined && { stock }),
        ...(status && { status: status.toUpperCase() }),
        ...(description !== undefined && { description }),
        ...(reorderPoint !== undefined && { reorderPoint }),
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Check if packaging item exists and belongs to user
    const existingItem = await prisma.packagingItem.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Packaging item not found' }, { status: 404 });
    }

    // Delete packaging item
    await prisma.packagingItem.delete({
      where: { id: params.id },
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
