// domains/message/repository.ts
import { prisma } from "@/lib/prisma";

export async function findMessages(relationshipId: string, conditions: any = {}) {
  // Messages are sent between the user and partner of the relationship.
  // We can query by senderId or receiverId using relationship userIds.
  return prisma.message.findMany({
    where: {
      ...conditions,
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      sender: { select: { id: true, name: true, profileImage: true } },
      receiver: { select: { id: true, name: true, profileImage: true } },
    },
  });
}

export async function createMessage(data: {
  content: string;
  senderId: string;
  receiverId: string;
  attachments?: any;
}) {
  return prisma.message.create({
    data,
    include: {
      sender: { select: { id: true, name: true, profileImage: true } },
      receiver: { select: { id: true, name: true, profileImage: true } },
    },
  });
}

export async function findMessageById(id: string) {
  return prisma.message.findUnique({
    where: { id },
  });
}

export async function updateMessage(id: string, data: any) {
  return prisma.message.update({
    where: { id },
    data,
  });
}

export async function countMessages(conditions: any) {
  return prisma.message.count({
    where: conditions,
  });
}
