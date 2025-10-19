import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all expenses for the user
    const expenses = await prisma.expense.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get invoice data for each expense
    const expensesWithInvoices = await Promise.all(
      expenses.map(async (expense) => {
        const invoice = await prisma.invoice.findUnique({
          where: { id: expense.invoice_id },
          select: { invoice_number: true },
        });
        
        return {
          ...expense,
          invoice: invoice ? { invoice_number: invoice.invoice_number } : null,
        };
      })
    );

    return NextResponse.json({ expenses: expensesWithInvoices });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      expense_id,
      invoice_id,
      item_name,
      category,
      quantity,
      cost,
      shipping_cost,
      vat,
      total_cost,
      unit_price,
      date,
      comment,
    } = body;

    // Validate required fields
    if (!expense_id || !invoice_id || !item_name || !category || !quantity || !cost || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if expense_id is already taken by this user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        expense_id,
        userId: user.id,
      },
    });

    if (existingExpense) {
      return NextResponse.json(
        { error: "Expense ID already exists" },
        { status: 400 }
      );
    }

    // Create the expense
    const expense = await prisma.expense.create({
      data: {
        expense_id,
        invoice_id,
        item_name,
        category,
        quantity: parseInt(quantity),
        cost: parseFloat(cost),
        shipping_cost: parseFloat(shipping_cost || 0),
        vat: parseFloat(vat || 0),
        total_cost: parseFloat(total_cost),
        unit_price: parseFloat(unit_price),
        date: new Date(date),
        comment: comment || null,
        userId: user.id,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}
