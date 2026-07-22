// app/api/thoughtful-ideas/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as ThoughtfulIdeaService from "@/domains/thoughtful-idea/service";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, type, progress, targetDate, completed } = body;

    const thoughtfulIdea = await ThoughtfulIdeaService.updateThoughtfulIdea(id, {
      title,
      description,
      type,
      progress,
      targetDate,
      completed,
    });

    return NextResponse.json(thoughtfulIdea);
  } catch (error: any) {
    console.error("Error updating thoughtful idea:", error);
    const status =
      error.message === "Not authenticated"
        ? 401
        : error.message === "Thoughtful idea not found"
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

    await ThoughtfulIdeaService.deleteThoughtfulIdea(id);
    return NextResponse.json({ message: "Thoughtful idea deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting thoughtful idea:", error);
    const status =
      error.message === "Not authenticated"
        ? 401
        : error.message === "Thoughtful idea not found"
        ? 404
        : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}