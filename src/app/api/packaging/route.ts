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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {
      userId: user.id,
    };

    if (type && type !== 'all') {
      where.type = type.toUpperCase();
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch packaging items
    const packagingItems = await prisma.packagingItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: packagingItems,
      message: 'Packaging items retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching packaging items:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch packaging items',
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

    // Validate required fields
    if (!name || !type || !dimensions || cost === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, dimensions, cost' },
        { status: 400 }
      );
    }

    // Validate dimensions
    if (!dimensions.length || !dimensions.width || dimensions.length <= 0 || dimensions.width <= 0) {
      return NextResponse.json(
        { error: 'Invalid dimensions: length and width must be greater than 0' },
        { status: 400 }
      );
    }

    // Create packaging item
    const packagingItem = await prisma.packagingItem.create({
      data: {
        name,
        type: type.toUpperCase(),
        dimensions,
        weight: weight || 0,
        cost,
        stock: stock || 0,
        status: status ? status.toUpperCase() : 'ACTIVE',
        description,
        reorderPoint: reorderPoint || 25,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: packagingItem,
      message: 'Packaging item created successfully'
    });

  } catch (error) {
    console.error('Error creating packaging item:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create packaging item',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
