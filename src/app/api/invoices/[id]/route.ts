import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Get invoice
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

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
    });

  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { invoice_number, supplier_name, supplier_url, date, total_amount, pdf_link, comments } = body;

    // Validate required fields
    if (!invoice_number || !supplier_name || !pdf_link || !date) {
      return NextResponse.json(
        { error: "Invoice number, supplier name, PDF link, and date are required" },
        { status: 400 }
      );
    }

    // Check if invoice exists and belongs to user
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Check if invoice number has changed (should not be allowed)
    if (existingInvoice.invoice_number !== invoice_number) {
      return NextResponse.json(
        { error: "Invoice number cannot be changed" },
        { status: 400 }
      );
    }

    // Update invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        invoice_number,
        supplier_name,
        supplier_url: supplier_url || null,
        date: new Date(date),
        total_amount: total_amount ? parseFloat(total_amount) : null,
        pdf_link,
        comments: comments || null,
      },
    });

    return NextResponse.json({
      id: updatedInvoice.id,
      invoice_number: updatedInvoice.invoice_number,
      supplier_name: updatedInvoice.supplier_name,
      supplier_url: updatedInvoice.supplier_url,
      date: updatedInvoice.date,
      total_amount: updatedInvoice.total_amount,
      pdf_link: updatedInvoice.pdf_link,
      comments: updatedInvoice.comments,
      createdAt: updatedInvoice.createdAt,
      updatedAt: updatedInvoice.updatedAt,
    });

  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Check if invoice exists and belongs to user
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Delete invoice
    await prisma.invoice.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Invoice deleted successfully" });

  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
