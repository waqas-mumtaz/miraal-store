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
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {
      userId: user.id,
    };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch products with packaging information
    const products = await prisma.product.findMany({
      where,
      include: {
        packaging: {
          select: {
            id: true,
            name: true,
            cost: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: products,
      message: 'Products retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
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
      sku,
      category,
      price,
      cost,
      stock,
      reorderPoint,
      status,
      description,
      brand,
      weight,
      dimensions,
      supplier,
      barcode,
      packagingId,
      packagingQuantity,
      usePackagingCost
    } = body;

    // Validate required fields
    if (!name || !sku || !category || price === undefined || cost === undefined || stock === undefined || reorderPoint === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if SKU already exists for this user
    const existingProduct = await prisma.product.findFirst({
      where: {
        sku,
        userId: user.id,
      },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'SKU already exists' },
        { status: 400 }
      );
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        sku,
        category,
        price: parseFloat(price),
        cost: parseFloat(cost),
        stock: parseInt(stock),
        reorderPoint: parseInt(reorderPoint),
        status: status || 'ACTIVE',
        description: description || null,
        brand: brand || null,
        weight: weight ? parseFloat(weight) : null,
        dimensions: dimensions || null,
        supplier: supplier || null,
        barcode: barcode || null,
        // Packaging integration
        packagingId: packagingId || null,
        packagingQuantity: packagingQuantity ? parseInt(packagingQuantity) : null,
        usePackagingCost: usePackagingCost || false,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create product',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
