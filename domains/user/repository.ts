// domains/user/repository.ts
import { prisma } from "@/lib/prisma";

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function createUser(data: { email: string; name?: string }) {
  return prisma.user.create({
    data: {
      email: data.email,
      name: data.name ?? "",
      password: "",
    },
  });
}

export async function getUserWithDetails(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      giftsGiven: true,
      giftsReceived: true,
      wishlistItems: true,
      specialOccasions: true,
      thoughtfulIdeas: true,
      secretPlans: { include: { items: true } },
      loveLetters: true,
    },
  });
}

export async function searchUsers(query: string, excludeUserId: string) {
  return prisma.user.findMany({
    where: {
      AND: [
        {
          OR: [
            { email: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
          ],
        },
        { id: { not: excludeUserId } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      profileImage: true,
    },
    limit: 10,
  } as any);
}

export async function updateUser(id: string, data: any) {
  return prisma.user.update({
    where: { id },
    data,
  });
}
