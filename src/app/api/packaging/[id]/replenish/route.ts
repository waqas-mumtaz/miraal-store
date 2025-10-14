import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: packagingId } = await params;
    
    // Verify authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { quantity, cost, date, invoiceLink, comments } = body;

    // Validate required fields
    if (!quantity || !cost || !date) {
      return NextResponse.json(
        { error: "Quantity, cost, and date are required" },
        { status: 400 }
      );
    }

    // Validate data types
    const quantityNum = parseInt(quantity);
    const costNum = parseFloat(cost);
    
    if (isNaN(quantityNum) || quantityNum <= 0) {
      return NextResponse.json(
        { error: "Quantity must be a positive number" },
        { status: 400 }
      );
    }

    if (isNaN(costNum) || costNum <= 0) {
      return NextResponse.json(
        { error: "Cost must be a positive number" },
        { status: 400 }
      );
    }

    // Calculate unit cost
    const unitCost = costNum / quantityNum;

    // Check if packaging item exists and belongs to user
    const packaging = await prisma.packaging.findFirst({
      where: {
        id: packagingId,
        userId: user.id,
      },
    });

    if (!packaging) {
      return NextResponse.json({ error: "Packaging item not found" }, { status: 404 });
    }

    // Create replenishment record
    const replenishment = await prisma.packagingReplenishment.create({
      data: {
        quantity: quantityNum,
        cost: costNum,
        unitCost: unitCost,
        date: new Date(date),
        invoiceLink: invoiceLink || null,
        comments: comments || null,
        packagingId: packagingId,
        userId: user.id,
      },
    });

    // Update packaging quantity and total COG
    const newQuantity = packaging.currentQuantity + quantityNum;
    const newTotalCOG = packaging.totalCOG + costNum;

    await prisma.packaging.update({
      where: {
        id: packagingId,
      },
      data: {
        currentQuantity: newQuantity,
        totalCOG: newTotalCOG,
        unitCost: newTotalCOG / newQuantity, // Recalculate average unit cost
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ 
      replenishment,
      message: "Packaging replenished successfully" 
    });

  } catch (error) {
    console.error("Packaging replenish error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
