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
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { quantity, cost, shipping, vat, totalCost, unitCost, date, invoiceLink, comments, expenseId } = body;

    // Validate required fields
    if (!quantity || !cost || !shipping || !vat || !date) {
      return NextResponse.json(
        { error: "Quantity, cost, shipping, VAT, and date are required" },
        { status: 400 }
      );
    }

    // Validate data types
    const quantityNum = parseInt(quantity);
    const costNum = parseFloat(cost);
    const shippingNum = parseFloat(shipping);
    const vatNum = parseFloat(vat);
    
    // Calculate total cost and unit cost if not provided
    const totalCostNum = totalCost ? parseFloat(totalCost) : costNum + shippingNum + vatNum;
    const unitCostNum = unitCost ? parseFloat(unitCost) : (quantityNum > 0 ? totalCostNum / quantityNum : 0);
    
    if (isNaN(quantityNum) || quantityNum <= 0) {
      return NextResponse.json(
        { error: "Quantity must be a positive number" },
        { status: 400 }
      );
    }

    if (isNaN(costNum) || costNum < 0) {
      return NextResponse.json(
        { error: "Cost must be a non-negative number" },
        { status: 400 }
      );
    }

    if (isNaN(shippingNum) || shippingNum < 0) {
      return NextResponse.json(
        { error: "Shipping must be a non-negative number" },
        { status: 400 }
      );
    }

    if (isNaN(vatNum) || vatNum < 0) {
      return NextResponse.json(
        { error: "VAT must be a non-negative number" },
        { status: 400 }
      );
    }

    if (totalCost && (isNaN(totalCostNum) || totalCostNum < 0)) {
      return NextResponse.json(
        { error: "Total cost must be a non-negative number" },
        { status: 400 }
      );
    }

    if (unitCost && (isNaN(unitCostNum) || unitCostNum < 0)) {
      return NextResponse.json(
        { error: "Unit cost must be a non-negative number" },
        { status: 400 }
      );
    }

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
        shipping: shippingNum,
        vat: vatNum,
        totalCost: totalCostNum,
        unitCost: unitCostNum,
        date: new Date(date),
        invoiceLink: invoiceLink || null,
        comments: comments || null,
        expenseId: expenseId || null,
        packagingId: packagingId,
        userId: user.id,
      },
    });

    // Update packaging quantity and costs
    const newQuantity = Number(packaging.currentQuantity) + quantityNum;
    const newCost = Number(packaging.cost || 0) + costNum;
    const newShipping = Number(packaging.shipping || 0) + shippingNum;
    const newVat = Number(packaging.vat || 0) + vatNum;
    const newTotalCost = Number(packaging.totalCost || 0) + totalCostNum;

    await prisma.packaging.update({
      where: {
        id: packagingId,
      },
      data: {
        currentQuantity: newQuantity,
        cost: newCost,
        shipping: newShipping,
        vat: newVat,
        totalCost: newTotalCost,
        unitCost: newTotalCost / newQuantity, // Recalculate average unit cost
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
