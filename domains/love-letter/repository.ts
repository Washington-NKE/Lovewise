// domains/love-letter/repository.ts
import { prisma } from "@/lib/prisma";

export async function createLetter(data: {
  content: string;
  title?: string | null;
  private?: boolean;
  userId: string;
}) {
  return prisma.loveLetter.create({
    data,
    include: {
      user: { select: { id: true, name: true, email: true, profileImage: true } },
    },
  });
}

export async function findLetters(conditions: any) {
  return prisma.loveLetter.findMany({
    where: conditions,
    include: {
      user: { select: { id: true, name: true, email: true, profileImage: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function findLetterById(id: string) {
  return prisma.loveLetter.findUnique({
    where: { id },
  });
}

export async function updateLetter(id: string, data: any) {
  return prisma.loveLetter.update({
    where: { id },
    data,
    include: {
      user: { select: { id: true, name: true, email: true, profileImage: true } },
    },
  });
}

export async function deleteLetter(id: string) {
  return prisma.loveLetter.delete({
    where: { id },
  });
}
