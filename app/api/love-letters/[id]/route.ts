// app/api/love-letters/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as LoveLetterService from "@/domains/love-letter/service";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, title, private: isPrivate, delivered } = body;

    const updatedLetter = await LoveLetterService.updateLoveLetter(id, {
      content,
      title,
      private: isPrivate,
      delivered,
    });

    return NextResponse.json(updatedLetter);
  } catch (error: any) {
    console.error("Error updating love letter:", error);
    const status =
      error.message === "Not authenticated"
        ? 401
        : error.message === "Love letter not found"
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

    await LoveLetterService.deleteLoveLetter(id);
    return NextResponse.json({ message: "Love letter deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting love letter:", error);
    const status =
      error.message === "Not authenticated"
        ? 401
        : error.message === "Love letter not found"
        ? 404
        : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}
