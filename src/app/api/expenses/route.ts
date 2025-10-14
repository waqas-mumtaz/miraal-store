import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('Expenses API: Starting POST request')
    
    // Get the auth token from cookies
    const token = request.cookies.get('auth-token')?.value
    console.log('Expenses API: Token exists:', !!token)

    if (!token) {
      console.log('Expenses API: No token found')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify the token
    console.log('Expenses API: Verifying token')
    const user = await verifyToken(token)
    console.log('Expenses API: User verified:', !!user)
    
    if (!user) {
      console.log('Expenses API: Invalid token')
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    console.log('Expenses API: Parsing request body')
    const { 
      title, 
      quantity, 
      totalAmount, 
      perQuantityCost, 
      buyLink, 
      date, 
      category, 
      comments 
    } = await request.json()
    
    console.log('Expenses API: Request data:', { title, quantity, totalAmount, category })

    // Validate required fields
    if (!title || !quantity || !totalAmount || !date || !category) {
      console.log('Expenses API: Validation failed - missing required fields')
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

    // Create the expense
    console.log('Expenses API: Creating expense in database')
    const expense = await prisma.expense.create({
      data: {
        title: title.trim(),
        quantity: parseInt(quantity),
        totalAmount: parseFloat(totalAmount),
        perQuantityCost: parseFloat(perQuantityCost),
        buyLink: buyLink?.trim() || null,
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
    console.log('Expenses API: Expense created successfully:', expense.id)

    return NextResponse.json({
      message: 'Expense created successfully',
      expense: {
        id: expense.id,
        title: expense.title,
        quantity: expense.quantity,
        totalAmount: expense.totalAmount,
        perQuantityCost: expense.perQuantityCost,
        buyLink: expense.buyLink,
        date: expense.date,
        category: expense.category,
        comments: expense.comments,
        createdAt: expense.createdAt,
        user: expense.user
      }
    })

  } catch (error) {
    console.error('Expense creation error:', error)
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
    console.error('Expenses fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
