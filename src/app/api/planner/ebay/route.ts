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

    // Get all plans for the user with their marketplace-specific details
    const plans = await prisma.plan.findMany({
      where: {
        userId: user.id,
      },
      include: {
        ebayDetails: true,
        amazonDetails: true,
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
      ean,
      unitPrice,
      sellPrice,
      sourceLink,
      productLink,
      soldItems,
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
      marketplace,
    } = body;

    // Validate required fields
    if (!productName || !unitPrice || !sellPrice || !sourceLink || !status || !marketplace) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the plan with marketplace-specific details using transaction
    const plan = await prisma.$transaction(async (tx) => {
      // Create the main plan
      const newPlan = await tx.plan.create({
        data: {
          productName,
          ean: ean || null,
          unitPrice: parseFloat(unitPrice),
          sellPrice: parseFloat(sellPrice),
          sourceLink,
          soldItems: parseInt(soldItems || 0),
          shippingCharges: parseFloat(shippingCharges || 0),
          shippingCost: parseFloat(shippingCost || 0),
          status,
          profit: parseFloat(profit || 0),
          marketplace,
          userId: user.id,
        },
      });

      // Create marketplace-specific details
      if (marketplace === "ebay") {
        await tx.ebayPlanDetails.create({
          data: {
            planId: newPlan.id,
            productLink: productLink || null,
            vat: parseFloat(vat || 0),
            ebayCommission: parseFloat(ebayCommission || 15),
            advertisingPercentage: parseFloat(advertisingPercentage || 0),
          },
        });
      } else if (marketplace === "amazon") {
        await tx.amazonPlanDetails.create({
          data: {
            planId: newPlan.id,
            fulfillmentCost: parseFloat(fulfillmentCost || 0),
            feePerItem: parseFloat(feePerItem || 0),
            storageFees: parseFloat(storageFees || 0),
            fulfillmentType: fulfillmentType || "FBA",
          },
        });
      }

      return newPlan;
    });

    // Return the plan with its details
    const planWithDetails = await prisma.plan.findUnique({
      where: { id: plan.id },
      include: {
        ebayDetails: true,
        amazonDetails: true,
      },
    });

    return NextResponse.json(planWithDetails, { status: 201 });
  } catch (error) {
    console.error("Error creating plan:", error);
    return NextResponse.json(
      { error: "Failed to create plan" },
      { status: 500 }
    );
  }
}
