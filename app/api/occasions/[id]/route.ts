// app/api/occasions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as OccasionService from "@/domains/occasion/service";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, date, budget, description, isRecurring, giftIdeas } = body;

    const occasion = await OccasionService.updateSpecialOccasion(id, {
      title,
      date,
      budget,
      description,
      isRecurring,
      suggestions: giftIdeas,
    });

    return NextResponse.json(occasion);
  } catch (error: any) {
    console.error("Error updating occasion:", error);
    const status =
      error.message === "Not authenticated"
        ? 401
        : error.message === "Occasion not found"
        ? 404
        : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await OccasionService.deleteSpecialOccasion(id);
    return NextResponse.json({ message: "Occasion deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting occasion:", error);
    const status =
      error.message === "Not authenticated"
        ? 401
        : error.message === "Occasion not found"
        ? 404
        : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}