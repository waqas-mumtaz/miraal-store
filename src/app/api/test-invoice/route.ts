import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    console.log('Test invoice endpoint called');
    
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;
    console.log('Token found:', !!token);
    
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    // Verify token
    const user = await verifyToken(token);
    console.log('User verified:', !!user);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Test database connection
    console.log('Testing database connection...');
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);

    // Test invoice creation with minimal data
    console.log('Testing invoice creation...');
    const testInvoice = await prisma.invoice.create({
      data: {
        invoice_number: `TEST-${Date.now()}`,
        supplier_name: "Test Supplier",
        pdf_link: "https://test.com/invoice.pdf",
        date: new Date(),
        userId: user.id,
      },
    });

    console.log('Test invoice created:', testInvoice);

    // Clean up test invoice
    await prisma.invoice.delete({
      where: { id: testInvoice.id },
    });

    return NextResponse.json({ 
      message: "Database connection and invoice creation working",
      userCount,
      testInvoiceId: testInvoice.id 
    });

  } catch (error) {
    console.error('Test invoice error:', error);
    return NextResponse.json(
      { 
        error: "Test failed", 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
