// domains/game/service.ts
import { auth } from "@/lib/auth";
import * as GameRepository from "./repository";
import * as UserRepository from "../user/repository";
import * as RelationshipRepository from "../relationship/repository";

export async function getAllGames() {
  try {
    return await GameRepository.findGames();
  } catch (error) {
    console.error("Error fetching games:", error);
    throw new Error("Failed to fetch games");
  }
}

export async function createGame(data: {
  title: string;
  slug: string;
  description: string;
  maxPlayers: number;
}) {
  try {
    return await GameRepository.createGame(data);
  } catch (error) {
    console.error("Error creating game:", error);
    throw new Error("Failed to create game");
  }
}

export async function getGameSessionStatus(sessionId: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const currentUser = await UserRepository.findUserByEmail(session.user.email);
  if (!currentUser) throw new Error("User not found");

  const gameSession = await GameRepository.findGameSessionById(sessionId);
  if (!gameSession) throw new Error("Game session not found");

  const isParticipant =
    gameSession.initiatorId === currentUser.id || gameSession.opponentId === currentUser.id;
  if (!isParticipant) throw new Error("Forbidden");

  return {
    sessionId: gameSession.id,
    status: gameSession.status,
    opponentJoined: Boolean(gameSession.opponentId),
    opponentId: gameSession.opponentId,
  };
}

export async function resolveGameSession(gameSlug: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const currentUser = await UserRepository.findUserByEmail(session.user.email);
  if (!currentUser) throw new Error("User not found");

  const game = await GameRepository.findGameBySlug(gameSlug);
  if (!game) throw new Error("Game not found");

  // Find active relationship
  const relationship = await RelationshipRepository.findActiveRelationshipWithDetails(currentUser.id);
  const partner = relationship
    ? (relationship.userId === currentUser.id ? relationship.partner : relationship.user)
    : null;

  const getOrUpdateSession = async () => {
    let gameSession = await GameRepository.findFirstGameSession({
      gameId: game.id,
      status: "in_progress",
      ...(partner
        ? {
            OR: [
              { initiatorId: currentUser.id, opponentId: partner.id },
              { initiatorId: partner.id, opponentId: currentUser.id },
              { initiatorId: currentUser.id, opponentId: null },
              { initiatorId: partner.id, opponentId: null },
            ],
          }
        : {
            OR: [
              { initiatorId: currentUser.id },
              { opponentId: currentUser.id },
            ],
          }),
    });

    if (
      gameSession &&
      partner &&
      gameSession.opponentId === null &&
      gameSession.initiatorId !== currentUser.id
    ) {
      await GameRepository.updateManyGameSessions(
        {
          id: gameSession.id,
          opponentId: null,
          status: "in_progress",
        },
        { opponentId: currentUser.id }
      );
      gameSession = await GameRepository.findGameSessionById(gameSession.id);
    }

    if (!gameSession) {
      gameSession = await GameRepository.createGameSession({
        gameId: game.id,
        initiatorId: currentUser.id,
        opponentId: null,
        status: "in_progress",
      });
    }

    return gameSession;
  };

  let gameSession: any = null;
  let attempt = 0;
  const maxAttempts = 3;

  while (attempt < maxAttempts && !gameSession) {
    try {
      gameSession = await getOrUpdateSession();
    } catch (error) {
      if (attempt === maxAttempts - 1) throw error;
    }
    attempt += 1;
  }

  if (!gameSession) throw new Error("Could not create game session");

  return {
    sessionId: gameSession.id,
    opponentJoined: Boolean(gameSession.opponentId),
    opponentId: gameSession.opponentId,
    partner: partner
      ? { id: partner.id, name: partner.name, profileImage: partner.profileImage }
      : null,
  };
}
