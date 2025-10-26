import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Function to update packaging item stock levels when PO is received
async function updatePackagingStock(items: any[]) {
  try {
    for (const item of items) {
      // Update the packaging item stock
      await prisma.packagingItem.update({
        where: { id: item.packagingItemId },
        data: {
          stock: {
            increment: item.quantity, // Add the received quantity to current stock
          },
          status: 'ACTIVE', // Ensure item is active if it was out of stock
          updatedAt: new Date(),
        },
      });

      console.log(`Updated stock for ${item.packagingItem.name}: +${item.quantity} units`);
    }
  } catch (error) {
    console.error('Error updating packaging stock:', error);
    throw error;
  }
}

// Function to create expenses from purchase order when received
async function createExpensesFromPO(purchaseOrder: any, userId: string) {
  try {
    for (const item of purchaseOrder.items) {
      // Generate unique expense ID
      const expenseId = `EXP-${purchaseOrder.poNumber}-${item.id.slice(-4)}`;
      
      // Check if expense already exists
      const existingExpense = await prisma.expense.findFirst({
        where: {
          expense_id: expenseId,
          userId: userId,
        },
      });

      if (existingExpense) {
        console.log(`Expense ${expenseId} already exists, skipping...`);
        continue;
      }

      // Create expense entry
      await prisma.expense.create({
        data: {
          expense_id: expenseId,
          invoice_id: purchaseOrder.poNumber,
          item_name: item.packagingItem.name,
          category: 'Packaging Materials',
          quantity: item.quantity,
          cost: item.unitCost.toString(),
          unit_price: item.unitCost.toString(),
          total_cost: item.totalCost.toString(),
          date: new Date(), // Use current date as expense date
          comment: `Auto-generated from PO ${purchaseOrder.poNumber} - ${item.packagingItem.name}`,
          userId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      console.log(`Created expense ${expenseId} for ${item.packagingItem.name}: €${item.totalCost}`);
    }
  } catch (error) {
    console.error('Error creating expenses from PO:', error);
    throw error;
  }
}

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

    // Fetch specific purchase order
    const purchaseOrder = await prisma.purchaseOrder.findFirst({
      where: {
        id: id,
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
    const { status, expectedDelivery, actualDelivery, notes } = body;

    // Validate status if provided
    if (status && !['PENDING', 'CONFIRMED', 'SHIPPED', 'RECEIVED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Check if purchase order exists and belongs to user
    const existingPO = await prisma.purchaseOrder.findFirst({
      where: {
        id: id,
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

    // If status is being updated to RECEIVED, automatically set actualDelivery
    if (status === 'RECEIVED' && !actualDelivery) {
      updateData.actualDelivery = new Date();
    }

    const updatedPO = await prisma.purchaseOrder.update({
      where: { id: id },
      data: updateData,
      include: {
        items: {
          include: {
            packagingItem: true,
          },
        },
      },
    });

    // If status is RECEIVED, update packaging item stock levels and create expenses
    if (status === 'RECEIVED') {
      await updatePackagingStock(updatedPO.items);
      await createExpensesFromPO(updatedPO, user.id);
    }

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
        id: id,
        userId: user.id,
      },
    });

    if (!existingPO) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 });
    }

    // Delete purchase order (cascade will handle items)
    await prisma.purchaseOrder.delete({
      where: { id: id },
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
