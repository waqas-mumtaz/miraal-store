import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface PurchaseOrderExpense {
  expense_id: string;
  item_name: string;
  category: string;
  quantity: number;
  cost: number;
  unit_price: number;
  date: string;
  comment: string;
  po_number: string;
  supplier: string;
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

    const { expenses, poNumber } = await request.json();

    if (!expenses || !Array.isArray(expenses) || !poNumber) {
      return NextResponse.json({ 
        error: 'Invalid request. Expenses array and PO number required.' 
      }, { status: 400 });
    }

    // Create expense entries for each item in the purchase order
    const createdExpenses = [];
    
    for (const expenseData of expenses) {
      try {
        // Create expense entry
        const expense = await prisma.expense.create({
          data: {
            expense_id: expenseData.expense_id,
            item_name: expenseData.item_name,
            category: expenseData.category,
            quantity: expenseData.quantity,
            cost: expenseData.cost.toString(),
            unit_price: expenseData.unit_price.toString(),
            date: new Date(expenseData.date),
            comment: expenseData.comment,
            userId: user.id,
            // Add PO reference (you might need to add this field to your schema)
            po_number: expenseData.po_number,
            supplier: expenseData.supplier,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        createdExpenses.push(expense);
      } catch (error) {
        console.error(`Error creating expense for ${expenseData.item_name}:`, error);
        // Continue with other expenses even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdExpenses.length} expense entries for Purchase Order ${poNumber}`,
      expenses: createdExpenses,
      poNumber,
    });

  } catch (error) {
    console.error('Error creating expenses from purchase order:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create expense entries',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
