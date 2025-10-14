import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const { id: expenseId } = await params

    // Check if expense exists and belongs to the user
    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId: user.id
      }
    })

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }

    // Delete the expense
    await prisma.expense.delete({
      where: {
        id: expenseId
      }
    })

    return NextResponse.json({
      message: 'Expense deleted successfully'
    })

  } catch (error) {
    console.error('Expense deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const { id: expenseId } = await params

    // Check if expense exists and belongs to the user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId: user.id
      }
    })

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }

    const { 
      title, 
      quantity, 
      totalAmount, 
      perQuantityCost, 
      buyLink, 
      invoiceLink,
      date, 
      category, 
      comments 
    } = await request.json()

    // Validate required fields
    if (!title || !quantity || !totalAmount || !date || !category) {
      return NextResponse.json(
        { error: 'Title, quantity, total amount, date, and category are required' },
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

    if (isNaN(totalAmount) || totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Total amount must be a positive number' },
        { status: 400 }
      )
    }

    // Update the expense
    const expense = await prisma.expense.update({
      where: {
        id: expenseId
      },
      data: {
        title: title.trim(),
        quantity: parseInt(quantity),
        totalAmount: parseFloat(totalAmount),
        perQuantityCost: parseFloat(perQuantityCost),
        buyLink: buyLink?.trim() || null,
        invoiceLink: invoiceLink?.trim() || null,
        date: new Date(date),
        category: category.trim(),
        comments: comments?.trim() || null,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Expense updated successfully',
      expense: {
        id: expense.id,
        title: expense.title,
        quantity: expense.quantity,
        totalAmount: expense.totalAmount,
        perQuantityCost: expense.perQuantityCost,
        buyLink: expense.buyLink,
        invoiceLink: expense.invoiceLink,
        date: expense.date,
        category: expense.category,
        comments: expense.comments,
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt,
        user: expense.user
      }
    })

  } catch (error) {
    console.error('Expense update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const { id: expenseId } = await params

    // Get the expense
    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId: user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      expense: {
        id: expense.id,
        title: expense.title,
        quantity: expense.quantity,
        totalAmount: expense.totalAmount,
        perQuantityCost: expense.perQuantityCost,
        buyLink: expense.buyLink,
        invoiceLink: expense.invoiceLink,
        date: expense.date,
        category: expense.category,
        comments: expense.comments,
        createdAt: expense.createdAt,
        user: expense.user
      }
    })

  } catch (error) {
    console.error('Expense fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
