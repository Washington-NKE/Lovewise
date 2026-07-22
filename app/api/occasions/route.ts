// app/api/occasions/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as OccasionService from "@/domains/occasion/service";
import * as UserService from "@/domains/user/service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await UserService.getCurrentUser();
    const occasions = await OccasionService.getSpecialOccasions(user.id);
    return NextResponse.json(occasions);
  } catch (error: any) {
    console.error("Error fetching occasions:", error);
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

    // Get the user's active relationship (required for create)
    const relationship = await prismaFindActiveRelationship(user.id);
    if (!relationship) {
      return NextResponse.json({ error: "No active relationship found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, date, budget, suggestions, giftIdeas } = body;

    if (!title || !date) {
      return NextResponse.json({ error: "Title and date are required" }, { status: 400 });
    }

    const finalSuggestions = suggestions || giftIdeas || [];

    const occasion = await OccasionService.createSpecialOccasion({
      title,
      date,
      budget,
      suggestions: finalSuggestions,
      userId: user.id,
      relationshipId: relationship.id,
    });

    return NextResponse.json(occasion, { status: 201 });
  } catch (error: any) {
    console.error("Error creating occasion:", error);
    const status =
      error.message === "Not authenticated"
        ? 401
        : error.message === "User not found"
        ? 404
        : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}

async function prismaFindActiveRelationship(userId: string) {
  const { prisma } = await import("@/lib/prisma");
  return prisma.relationship.findFirst({
    where: {
      OR: [
        { userId, status: "ACTIVE" },
        { partnerId: userId, status: "ACTIVE" },
      ],
    },
    select: { id: true },
  });
}