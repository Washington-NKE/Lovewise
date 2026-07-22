// domains/presence/repository.ts
import { prisma } from "@/lib/prisma";

export async function findUserPresence(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      lastActive: true,
      profileImage: true,
    },
  });
}

export async function updateUserPresence(userId: string, lastActive: Date | null) {
  return prisma.user.update({
    where: { id: userId },
    data: { lastActive },
  });
}

export async function findUsersPresenceBulk(userIds: string[]) {
  return prisma.user.findMany({
    where: {
      id: { in: userIds },
    },
    select: {
      id: true,
      name: true,
      lastActive: true,
      profileImage: true,
    },
  });
}
