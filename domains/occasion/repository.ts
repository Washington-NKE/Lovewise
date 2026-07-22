// domains/occasion/repository.ts
import { prisma } from "@/lib/prisma";

export async function createOccasion(data: {
  title: string;
  date: Date;
  budget?: number | null;
  giftIdeas?: string[];
  userId: string;
  relationshipId: string;
}) {
  return prisma.specialOccasion.create({
    data,
    include: {
      user: { select: { id: true, name: true, email: true, profileImage: true } },
    },
  });
}

export async function findOccasions(conditions: any) {
  return prisma.specialOccasion.findMany({
    where: conditions,
    include: {
      user: { select: { id: true, name: true, email: true, profileImage: true } },
    },
    orderBy: { date: "asc" },
  });
}

export async function updateOccasion(id: string, data: any) {
  return prisma.specialOccasion.update({
    where: { id },
    data,
    include: {
      user: { select: { id: true, name: true, email: true, profileImage: true } },
    },
  });
}

export async function deleteOccasion(id: string) {
  return prisma.specialOccasion.delete({
    where: { id },
  });
}
