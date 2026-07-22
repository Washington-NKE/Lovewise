// app/api/games/route.ts
import { NextResponse } from "next/server";
import * as GameService from "@/domains/game/service";

export async function GET() {
  try {
    const games = await GameService.getAllGames();
    return NextResponse.json(games);
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch games" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, description, maxPlayers } = body;

    if (!title || !slug || !description || !maxPlayers) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const game = await GameService.createGame({
      title,
      slug,
      description,
      maxPlayers: parseInt(maxPlayers),
    });

    return NextResponse.json(game, { status: 201 });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: error.message || "Failed to create game" }, { status: 500 });
  }
}