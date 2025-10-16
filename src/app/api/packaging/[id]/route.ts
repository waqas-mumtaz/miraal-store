import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(
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

    // Get packaging item with related data
    const packaging = await prisma.packaging.findFirst({
      where: {
        id: packagingId,
        userId: user.id,
      },
      include: {
        linkedExpenses: {
          include: {
            expense: true,
          },
        },
        replenishments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!packaging) {
      return NextResponse.json({ error: "Packaging item not found" }, { status: 404 });
    }

    return NextResponse.json({ packaging });

  } catch (error) {
    console.error("Packaging fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const { name, description, type, quantity, cost, unitCost, shipping, vat, totalCost } = body;

    // Validate required fields
    if (!name || !type || !unitCost) {
      return NextResponse.json(
        { error: "Name, type, and unit cost are required" },
        { status: 400 }
      );
    }

    // Validate data types
    if (isNaN(parseFloat(unitCost)) || parseFloat(unitCost) <= 0) {
      return NextResponse.json(
        { error: "Unit cost must be a positive number" },
        { status: 400 }
      );
    }

    // Update packaging item
    const updatedPackaging = await prisma.packaging.update({
      where: {
        id: packagingId,
        userId: user.id,
      },
      data: {
        name,
        description: description || null,
        type,
        quantity: quantity ? parseInt(quantity) : null,
        cost: cost ? parseFloat(cost) : null,
        unitCost: parseFloat(unitCost),
        shipping: shipping ? parseFloat(shipping) : null,
        vat: vat ? parseFloat(vat) : null,
        totalCost: totalCost ? parseFloat(totalCost) : null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ packaging: updatedPackaging });

  } catch (error) {
    console.error("Packaging update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Delete packaging item
    await prisma.packaging.delete({
      where: {
        id: packagingId,
        userId: user.id,
      },
    });

    return NextResponse.json({ message: "Packaging item deleted successfully" });

  } catch (error) {
    console.error("Packaging delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
