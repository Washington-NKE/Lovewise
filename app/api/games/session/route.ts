// app/api/games/session/route.ts
import { NextResponse } from "next/server";
import * as GameService from "@/domains/game/service";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const statusInfo = await GameService.getGameSessionStatus(sessionId);
    return NextResponse.json(statusInfo);
  } catch (error: any) {
    console.error("Error fetching game session status:", error);
    const status =
      error.message === "Unauthorized"
        ? 401
        : error.message === "User not found" || error.message === "Game session not found"
        ? 404
        : error.message === "Forbidden"
        ? 403
        : 500;
    return NextResponse.json({ error: error.message || "Failed to fetch game session status" }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const { gameSlug } = await request.json();
    if (!gameSlug) {
      return NextResponse.json({ error: "Missing gameSlug" }, { status: 400 });
    }

    const sessionInfo = await GameService.resolveGameSession(gameSlug);
    return NextResponse.json(sessionInfo);
  } catch (error: any) {
    console.error("Error creating game session:", error);
    const status =
      error.message === "Unauthorized"
        ? 401
        : error.message === "User not found" || error.message === "Game not found"
        ? 404
        : 500;
    return NextResponse.json({ error: error.message || "Failed to create game session" }, { status });
  }
}