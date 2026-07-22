// app/api/thoughtful-ideas/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as ThoughtfulIdeaService from "@/domains/thoughtful-idea/service";
import * as UserService from "@/domains/user/service";

export async function GET() {
  try {
    const user = await UserService.getCurrentUser();
    const thoughtfulIdeas = await ThoughtfulIdeaService.getThoughtfulIdeas(user.id);
    return NextResponse.json(thoughtfulIdeas);
  } catch (error: any) {
    console.error("Error fetching thoughtful ideas:", error);
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
    const body = await request.json();
    const { title, description, type, progress, targetDate } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const thoughtfulIdea = await ThoughtfulIdeaService.createThoughtfulIdea({
      title,
      description,
      type,
      progress,
      targetDate,
      userId: user.id,
    });

    return NextResponse.json(thoughtfulIdea, { status: 201 });
  } catch (error: any) {
    console.error("Error creating thoughtful idea:", error);
    const status =
      error.message === "Not authenticated"
        ? 401
        : error.message === "User not found"
        ? 404
        : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}
