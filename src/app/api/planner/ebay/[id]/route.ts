import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Get the plan with its marketplace-specific details
    const plan = await prisma.plan.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        ebayDetails: true,
        amazonDetails: true,
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Error fetching plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch plan" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
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

    // Check if plan exists and belongs to user
    const existingPlan = await prisma.plan.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Update the plan with marketplace-specific details using transaction
    await prisma.$transaction(async (tx) => {
      // Update the main plan
      const plan = await tx.plan.update({
        where: { id },
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
        },
      });

      // Update marketplace-specific details
      if (marketplace === "ebay") {
        await tx.ebayPlanDetails.upsert({
          where: { planId: id },
          update: {
            productLink: productLink || null,
            vat: parseFloat(vat || 0),
            ebayCommission: parseFloat(ebayCommission || 15),
            advertisingPercentage: parseFloat(advertisingPercentage || 0),
          },
          create: {
            planId: id,
            productLink: productLink || null,
            vat: parseFloat(vat || 0),
            ebayCommission: parseFloat(ebayCommission || 15),
            advertisingPercentage: parseFloat(advertisingPercentage || 0),
          },
        });
      } else if (marketplace === "amazon") {
        await tx.amazonPlanDetails.upsert({
          where: { planId: id },
          update: {
            fulfillmentCost: parseFloat(fulfillmentCost || 0),
            feePerItem: parseFloat(feePerItem || 0),
            storageFees: parseFloat(storageFees || 0),
            fulfillmentType: fulfillmentType || "FBA",
          },
          create: {
            planId: id,
            fulfillmentCost: parseFloat(fulfillmentCost || 0),
            feePerItem: parseFloat(feePerItem || 0),
            storageFees: parseFloat(storageFees || 0),
            fulfillmentType: fulfillmentType || "FBA",
          },
        });
      }

      return plan;
    });

    // Return the updated plan with its details
    const planWithDetails = await prisma.plan.findUnique({
      where: { id },
      include: {
        ebayDetails: true,
        amazonDetails: true,
      },
    });

    return NextResponse.json(planWithDetails);
  } catch (error) {
    console.error("Error updating plan:", error);
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Check if plan exists and belongs to user
    const existingPlan = await prisma.plan.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Delete the plan (cascade will handle child records)
    await prisma.plan.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Plan deleted successfully" });
  } catch (error) {
    console.error("Error deleting plan:", error);
    return NextResponse.json(
      { error: "Failed to delete plan" },
      { status: 500 }
    );
  }
}
