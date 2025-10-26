import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch single purchase order
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

    // Fetch purchase order with items
    const purchaseOrder = await prisma.purchaseOrder.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        items: {
          include: {
            packagingItem: {
              select: {
                id: true,
                name: true,
                cost: true,
              }
            }
          }
        }
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

// PUT - Update purchase order
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
      poNumber,
      status,
      supplier,
      notes,
      expectedDelivery,
      items
    } = body;

    // Validate required fields
    if (!poNumber) {
      return NextResponse.json(
        { error: 'PO Number is required' },
        { status: 400 }
      );
    }

    // Check if purchase order exists and belongs to user
    const existingPO = await prisma.purchaseOrder.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingPO) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }

    // Check if PO number is unique (excluding current PO)
    const duplicatePO = await prisma.purchaseOrder.findFirst({
      where: {
        poNumber,
        userId: user.id,
        id: { not: id },
      },
    });

    if (duplicatePO) {
      return NextResponse.json(
        { error: 'PO Number already exists' },
        { status: 400 }
      );
    }

    // Calculate total cost
    const totalCost = items ? items.reduce((sum: number, item: any) => sum + (item.totalCost || 0), 0) : 0;

    // Update purchase order
    const updatedPO = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        poNumber,
        status: status || 'PENDING',
        supplier: supplier || null,
        notes: notes || null,
        expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : null,
        totalCost,
        updatedAt: new Date(),
      },
    });

    // Update items if provided
    if (items && Array.isArray(items)) {
      // Delete existing items
      await prisma.purchaseOrderItem.deleteMany({
        where: { purchaseOrderId: id },
      });

      // Create new items
      if (items.length > 0) {
        await prisma.purchaseOrderItem.createMany({
          data: items.map((item: any) => ({
            quantity: item.quantity || 0,
            unitCost: item.unitCost || 0,
            totalCost: item.totalCost || 0,
            supplier: item.supplier || null,
            notes: item.notes || null,
            packagingItemId: item.packagingItemId,
            purchaseOrderId: id,
          })),
        });
      }
    }

    // Fetch updated purchase order with items
    const updatedPOWithItems = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            packagingItem: {
              select: {
                id: true,
                name: true,
                cost: true,
              }
            }
          }
        }
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedPOWithItems,
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

// DELETE - Delete purchase order
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

    // Check if purchase order exists and belongs to user
    const existingPO = await prisma.purchaseOrder.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingPO) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }

    // Check if purchase order can be deleted (only PENDING or CANCELLED orders)
    if (existingPO.status !== 'PENDING' && existingPO.status !== 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cannot delete purchase order that is not pending or cancelled' },
        { status: 400 }
      );
    }

    // Delete purchase order (items will be deleted automatically due to cascade)
    await prisma.purchaseOrder.delete({
      where: { id },
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