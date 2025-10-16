import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    // Verify token
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const supplier = searchParams.get('supplier') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: user.id,
    };

    if (search) {
      where.OR = [
        { invoice_number: { contains: search, mode: 'insensitive' } },
        { supplier_name: { contains: search, mode: 'insensitive' } },
        { comments: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (supplier) {
      where.supplier_name = { contains: supplier, mode: 'insensitive' };
    }

    // Get invoices with pagination
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      invoices: invoices.map(invoice => ({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        supplier_name: invoice.supplier_name,
        supplier_url: invoice.supplier_url,
        date: invoice.date,
        total_amount: invoice.total_amount,
        pdf_link: invoice.pdf_link,
        comments: invoice.comments,
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    // Verify token
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    console.log('API received invoice data:', body);
    const { invoice_number, supplier_name, supplier_url, date, total_amount, pdf_link, comments } = body;

    // Validate required fields
    if (!invoice_number || !supplier_name || !pdf_link || !date) {
      console.log('Validation failed - missing required fields:', { invoice_number, supplier_name, pdf_link, date });
      return NextResponse.json(
        { error: "Invoice number, supplier name, PDF link, and date are required" },
        { status: 400 }
      );
    }

    // Check if invoice number already exists for this user
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        userId: user.id,
        invoice_number: invoice_number,
      },
    });

    if (existingInvoice) {
      return NextResponse.json(
        { error: "Invoice number already exists" },
        { status: 400 }
      );
    }

    // Create invoice
    console.log('Creating invoice with data:', {
      invoice_number,
      supplier_name,
      supplier_url: supplier_url || null,
      date: new Date(date),
      total_amount: total_amount ? parseFloat(total_amount) : null,
      pdf_link,
      comments: comments || null,
      userId: user.id,
    });

    const invoice = await prisma.invoice.create({
      data: {
        invoice_number,
        supplier_name,
        supplier_url: supplier_url || null,
        date: new Date(date),
        total_amount: total_amount ? parseFloat(total_amount) : null,
        pdf_link,
        comments: comments || null,
        userId: user.id,
      },
    });

    console.log('Invoice created successfully:', invoice);

    return NextResponse.json({
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      supplier_name: invoice.supplier_name,
      supplier_url: invoice.supplier_url,
      date: invoice.date,
      total_amount: invoice.total_amount,
      pdf_link: invoice.pdf_link,
      comments: invoice.comments,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating invoice:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.json(
      { 
        error: "Failed to create invoice",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
