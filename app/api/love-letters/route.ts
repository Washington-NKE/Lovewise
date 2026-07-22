// app/api/love-letters/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as LoveLetterService from "@/domains/love-letter/service";
import * as UserService from "@/domains/user/service";

export async function GET() {
  try {
    const user = await UserService.getCurrentUser();
    const loveLetters = await LoveLetterService.getLoveLetters(user.id);
    return NextResponse.json(loveLetters);
  } catch (error: any) {
    console.error("Error fetching love letters:", error);
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
    const { content, title, private: isPrivate, delivered } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const loveLetter = await LoveLetterService.createLoveLetter({
      content,
      title,
      private: isPrivate || false,
      delivered: delivered || false,
      userId: user.id,
    });

    return NextResponse.json(loveLetter);
  } catch (error: any) {
    console.error("Error creating love letter:", error);
    const status =
      error.message === "Not authenticated"
        ? 401
        : error.message === "User not found"
        ? 404
        : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}