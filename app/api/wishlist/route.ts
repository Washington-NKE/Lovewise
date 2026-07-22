// app/api/wishlist/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import * as WishlistService from "@/domains/wishlist/service";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const relationship = await prismaFindActiveRelationship(session.user.id);
    if (!relationship) {
      return NextResponse.json({ error: "No active relationship found" }, { status: 400 });
    }

    const wishlistItems = await WishlistService.getWishlist(session.user.id, relationship.id);
    return NextResponse.json(wishlistItems);
  } catch (error: any) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 });
    }

    const relationship = await prismaFindActiveRelationship(session.user.id);
    if (!relationship) {
      return NextResponse.json({ error: "No active relationship found" }, { status: 400 });
    }

    const wishlistItem = await WishlistService.createWishlistItem({
      ...body,
      userId: session.user.id,
      relationshipId: relationship.id,
    });

    return NextResponse.json(wishlistItem, { status: 201 });
  } catch (error: any) {
    console.error("Error creating wishlist item:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

async function prismaFindActiveRelationship(userId: string) {
  const { prisma } = await import("@/lib/prisma");
  return prisma.relationship.findFirst({
    where: {
      status: "ACTIVE",
      OR: [{ userId }, { partnerId: userId }],
    },
    select: { id: true },
  });
}