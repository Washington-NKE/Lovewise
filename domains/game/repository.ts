// domains/game/repository.ts
import { prisma } from "@/lib/prisma";

export async function findGames() {
  return prisma.game.findMany({
    orderBy: {
      title: "asc",
    },
  });
}

export async function createGame(data: {
  title: string;
  slug: string;
  description: string;
  maxPlayers: number;
}) {
  return prisma.game.create({
    data,
  });
}

export async function findGameBySlug(slug: string) {
  return prisma.game.findUnique({
    where: { slug },
  });
}

export async function findGameSessionById(id: string) {
  return prisma.gameSession.findUnique({
    where: { id },
  });
}

export async function findFirstGameSession(conditions: any) {
  return prisma.gameSession.findFirst({
    where: conditions,
    orderBy: { createdAt: "desc" },
  });
}

export async function updateGameSession(id: string, data: any) {
  return prisma.gameSession.update({
    where: { id },
    data,
  });
}

export async function createGameSession(data: {
  gameId: number;
  initiatorId: string;
  opponentId: string | null;
  status: "pending" | "in_progress" | "completed" | "canceled";
}) {
  return prisma.gameSession.create({
    data,
  });
}

export async function updateManyGameSessions(where: any, data: any) {
  return prisma.gameSession.updateMany({
    where,
    data,
  });
}
