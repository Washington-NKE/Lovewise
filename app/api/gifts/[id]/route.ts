// app/api/gifts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as GiftService from "@/domains/gift/service";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const gift = await GiftService.updateGift(id, body);
    return NextResponse.json(gift);
  } catch (error: any) {
    console.error("Error updating gift:", error);
    const status =
      error.message === "Not authenticated"
        ? 401
        : error.message === "Gift not found"
        ? 404
        : error.message === "Forbidden"
        ? 403
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

    await GiftService.deleteGift(id);
    return NextResponse.json({ message: "Gift deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting gift:", error);
    const status =
      error.message === "Not authenticated"
        ? 401
        : error.message === "Gift not found"
        ? 404
        : error.message === "Forbidden"
        ? 403
        : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}