// domains/journal/repository.ts
import { prisma } from "@/lib/prisma";

export async function findJournalEntries(relationshipId: string, conditions: any) {
  return prisma.journal.findMany({
    where: {
      relationshipId,
      ...conditions,
    },
    include: {
      user: {
        select: {
          name: true,
          profileImage: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createJournal(data: {
  title: string;
  content: string;
  mood?: string;
  isPrivate: boolean;
  userId: string;
  relationshipId: string;
}) {
  return prisma.journal.create({
    data,
    include: {
      user: {
        select: {
          name: true,
          profileImage: true,
        },
      },
    },
  });
}

export async function findJournalById(id: string) {
  return prisma.journal.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          profileImage: true,
        },
      },
    },
  });
}

export async function updateJournal(id: string, data: any) {
  return prisma.journal.update({
    where: { id },
    data,
    include: {
      user: {
        select: {
          name: true,
          profileImage: true,
        },
      },
    },
  });
}

export async function deleteJournal(id: string) {
  return prisma.journal.delete({
    where: { id },
  });
}
