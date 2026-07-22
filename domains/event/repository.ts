// domains/event/repository.ts
import { prisma } from "@/lib/prisma";

export async function findEvents(relationshipId: string, conditions: any) {
  return prisma.event.findMany({
    where: {
      relationshipId,
      ...conditions,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createEvent(data: {
  title: string;
  description: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  time?: string;
  type: string;
  isAllDay: boolean;
  reminderTime?: Date | null;
  relationshipId: string;
  creatorId: string;
}) {
  return prisma.event.create({
    data,
  });
}
