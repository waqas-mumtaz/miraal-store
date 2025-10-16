import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
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

    // Debug: Check if user exists in database
    console.log('User from token:', user);
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });
    console.log('User in database:', dbUser);
    
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 401 }
      )
    }

    const { 
      title, 
      quantity, 
      amount,
      shippingCost,
      vat,
      totalAmount, 
      perQuantityCost, 
      buyLink, 
      invoiceLink,
      date, 
      category, 
      comments 
    } = await request.json()

    // Validate required fields
    if (!title || !quantity || !amount || !date || !category) {
      return NextResponse.json(
        { error: 'Title, quantity, amount, date, and category are required' },
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

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      )
    }

    // Create the expense
    const expense = await prisma.expense.create({
      data: {
        title: title.trim(),
        quantity: parseInt(quantity),
        amount: parseFloat(amount),
        shippingCost: parseFloat(shippingCost || 0),
        vat: parseFloat(vat || 0),
        totalAmount: parseFloat(totalAmount),
        perQuantityCost: parseFloat(perQuantityCost),
        buyLink: buyLink?.trim() || null,
        invoiceLink: invoiceLink?.trim() || null,
        date: new Date(date),
        category: category.trim(),
        comments: comments?.trim() || null,
        userId: user.id,
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
      message: 'Expense created successfully',
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
    console.error('Expense creation error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code,
      meta: (error as any)?.meta
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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

    // Debug: Check if user exists in database
    console.log('User from token (GET):', user);
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });
    console.log('User in database (GET):', dbUser);
    
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 401 }
      )
    }

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    // Build where clause
    const where: any = {
      userId: user.id
    }

    if (category && category !== 'all') {
      where.category = category
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { comments: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get expenses with pagination
    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      }),
      prisma.expense.count({ where })
    ])

    return NextResponse.json({
      expenses: expenses.map(expense => ({
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
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Expenses fetch error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code,
      meta: (error as any)?.meta
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
