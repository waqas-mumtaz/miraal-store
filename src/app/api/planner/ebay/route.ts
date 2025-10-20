import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all plans for the user
    const plans = await prisma.ebayPlan.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      productName,
      unitPrice,
      sellPrice,
      sourceLink,
      ebayLink,
      vat,
      ebayCommission,
      advertisingPercentage,
      fulfillmentCost,
      feePerItem,
      storageFees,
      fulfillmentType,
      shippingCharges,
      shippingCost,
      status,
      profit,
    } = body;

    // Validate required fields
    if (!productName || !unitPrice || !sellPrice || !sourceLink || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the plan
    const plan = await prisma.ebayPlan.create({
      data: {
        productName,
        unitPrice: parseFloat(unitPrice),
        sellPrice: parseFloat(sellPrice),
        sourceLink,
        ebayLink: ebayLink || null,
        vat: parseFloat(vat || 0),
        ebayCommission: parseFloat(ebayCommission || 15),
        advertisingPercentage: parseFloat(advertisingPercentage || 0),
        fulfillmentCost: parseFloat(fulfillmentCost || 0),
        feePerItem: parseFloat(feePerItem || 0),
        storageFees: parseFloat(storageFees || 0),
        fulfillmentType: fulfillmentType || "FBA",
        shippingCharges: parseFloat(shippingCharges || 0),
        shippingCost: parseFloat(shippingCost || 0),
        status,
        profit: parseFloat(profit || 0),
        userId: user.id,
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error("Error creating plan:", error);
    return NextResponse.json(
      { error: "Failed to create plan" },
      { status: 500 }
    );
  }
}
