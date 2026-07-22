// domains/thoughtful-idea/repository.ts
import { prisma } from "@/lib/prisma";

export async function createIdea(data: {
  title: string;
  description: string;
  type: "DIY" | "EXPERIENCE" | "INTIMATE" | "PERSONALIZED";
  progress?: number;
  targetDate?: Date;
  userId: string;
}) {
  return prisma.thoughtfulIdea.create({
    data,
    include: {
      user: { select: { id: true, name: true, email: true, profileImage: true } },
    },
  });
}

export async function findIdeas(conditions: any) {
  return prisma.thoughtfulIdea.findMany({
    where: conditions,
    include: {
      user: { select: { id: true, name: true, email: true, profileImage: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateIdea(id: string, data: any) {
  return prisma.thoughtfulIdea.update({
    where: { id },
    data,
    include: {
      user: { select: { id: true, name: true, email: true, profileImage: true } },
    },
  });
}

export async function deleteIdea(id: string) {
  return prisma.thoughtfulIdea.delete({
    where: { id },
  });
}
