import { getAllGames, createGame } from '@/database/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const games = await getAllGames();
    return NextResponse.json(games);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, description, maxPlayers } = body;

    if (!title || !slug || !description || !maxPlayers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const game = await createGame({
      title,
      slug,
      description,
      maxPlayers: parseInt(maxPlayers)
    });

    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
}