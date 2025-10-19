import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log('Debug invoice endpoint called');
    
    // Test basic Prisma connection
    console.log('Testing Prisma connection...');
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);
    
    // Test if Invoice model exists
    console.log('Testing Invoice model...');
    const invoiceCount = await prisma.invoice.count();
    console.log('Invoice count:', invoiceCount);
    
    return NextResponse.json({ 
      message: "Prisma connection working",
      userCount,
      invoiceCount
    });

  } catch (error) {
    console.error('Debug invoice error:', error);
    return NextResponse.json(
      { 
        error: "Debug failed", 
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
