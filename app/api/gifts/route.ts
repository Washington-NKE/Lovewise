// app/api/gifts/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as GiftService from "@/domains/gift/service";
import * as UserService from "@/domains/user/service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await UserService.getCurrentUser();
    const gifts = await GiftService.getGiftHistory(user.id);
    return NextResponse.json(gifts);
  } catch (error: any) {
    console.error("Error fetching gifts:", error);
    const status =
      error.message === "Not authenticated"
        ? 401
        : error.message === "User not found"
        ? 404
        : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await UserService.getCurrentUser();
    
    // Find relationship
    const relationship = await prismaFindActiveRelationship(user.id);
    if (!relationship) {
      return NextResponse.json({ error: "No active relationship found" }, { status: 404 });
    }

    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: "Gift name is required" }, { status: 400 });
    }

    const gift = await GiftService.createGift({
      ...body,
      giverId: body.giverId || user.id,
      recipientId: body.recipientId || user.id,
      relationshipId: relationship.id,
    });

    return NextResponse.json(gift, { status: 201 });
  } catch (error: any) {
    console.error("Error creating gift:", error);
    const status =
      error.message === "Not authenticated"
        ? 401
        : error.message === "User not found"
        ? 404
        : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}

// Helper local function to fetch relationship since we need relationship.id
async function prismaFindActiveRelationship(userId: string) {
  const { prisma } = await import("@/lib/prisma");
  return prisma.relationship.findFirst({
    where: {
      OR: [
        { userId, status: "ACTIVE" },
        { partnerId: userId, status: "ACTIVE" },
      ],
    },
  });
}