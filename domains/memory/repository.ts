// domains/memory/repository.ts
import { prisma } from "@/lib/prisma";

export async function findMemories(relationshipId: string, conditions: any = {}) {
  return prisma.memory.findMany({
    where: {
      relationshipId,
      ...conditions,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function findAlbums(relationshipId: string) {
  return prisma.memory.findMany({
    where: {
      relationshipId,
      album: {
        not: null,
      },
    },
    select: {
      album: true,
    },
    distinct: ["album"],
  });
}

export async function createMemory(data: {
  title: string;
  description: string;
  album: string;
  mediaUrls: string[];
  isFavorite: boolean;
  relationshipId: string;
  creatorId: string;
  location?: string;
  date: Date;
  isSaved: boolean;
}) {
  return prisma.memory.create({
    data,
  });
}

export async function findMemoryById(id: string) {
  return prisma.memory.findUnique({
    where: { id },
  });
}

export async function updateMemory(id: string, data: any) {
  return prisma.memory.update({
    where: { id },
    data,
  });
}

export async function deleteMemory(id: string) {
  return prisma.memory.delete({
    where: { id },
  });
}

export async function countMemories(relationshipId: string, conditions: any = {}) {
  return prisma.memory.count({
    where: {
      relationshipId,
      ...conditions,
    },
  });
}

export async function getAlbumsGrouped(relationshipId: string) {
  return prisma.memory.groupBy({
    by: ["album"],
    where: {
      relationshipId,
      album: { not: null },
    },
    _count: true,
  });
}

export async function findMemoriesByCreator(creatorId: string, relationshipId: string) {
  return prisma.memory.findMany({
    where: {
      creatorId,
      relationshipId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
