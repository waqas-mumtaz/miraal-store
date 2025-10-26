import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {
      userId: user.id,
    };

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    // Fetch purchase orders with items
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where,
      include: {
        items: {
          include: {
            packagingItem: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: purchaseOrders,
      message: 'Purchase orders retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch purchase orders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
      items,
      supplier,
      notes,
      expectedDelivery
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Generate PO number
    const poNumber = `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    // Calculate total cost
    const totalCost = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitCost), 0);

    // Create purchase order with items in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create purchase order
      const purchaseOrder = await tx.purchaseOrder.create({
        data: {
          poNumber,
          totalCost,
          supplier,
          notes,
          expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : null,
          userId: user.id,
        },
      });

      // Create purchase order items
      const purchaseOrderItems = await Promise.all(
        items.map(async (item: any) => {
          return await tx.purchaseOrderItem.create({
            data: {
              quantity: item.quantity,
              unitCost: item.unitCost,
              totalCost: item.quantity * item.unitCost,
              supplier: item.supplier,
              notes: item.notes,
              packagingItemId: item.packagingId,
              purchaseOrderId: purchaseOrder.id,
            },
          });
        })
      );

      return { purchaseOrder, purchaseOrderItems };
    });

    // Fetch the complete purchase order with items
    const completeOrder = await prisma.purchaseOrder.findUnique({
      where: { id: result.purchaseOrder.id },
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
      data: completeOrder,
      message: `Purchase Order ${poNumber} created successfully`
    });

  } catch (error) {
    console.error('Error creating purchase order:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create purchase order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
