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

    // Fetch specific purchase order
    const purchaseOrder = await prisma.purchaseOrder.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        items: {
          include: {
            packagingItem: true,
          },
        },
      },
    });

    if (!purchaseOrder) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: purchaseOrder,
      message: 'Purchase order retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching purchase order:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch purchase order',
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
    const { status, expectedDelivery, actualDelivery, notes } = body;

    // Validate status if provided
    if (status && !['PENDING', 'CONFIRMED', 'SHIPPED', 'RECEIVED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Check if purchase order exists and belongs to user
    const existingPO = await prisma.purchaseOrder.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingPO) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 });
    }

    // Update purchase order
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (expectedDelivery) updateData.expectedDelivery = new Date(expectedDelivery);
    if (actualDelivery) updateData.actualDelivery = new Date(actualDelivery);
    if (notes !== undefined) updateData.notes = notes;

    const updatedPO = await prisma.purchaseOrder.update({
      where: { id: params.id },
      data: updateData,
      include: {
        items: {
          include: {
            packagingItem: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedPO,
      message: 'Purchase order updated successfully'
    });

  } catch (error) {
    console.error('Error updating purchase order:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update purchase order',
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

    // Check if purchase order exists and belongs to user
    const existingPO = await prisma.purchaseOrder.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingPO) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 });
    }

    // Delete purchase order (cascade will handle items)
    await prisma.purchaseOrder.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Purchase order deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting purchase order:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete purchase order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
