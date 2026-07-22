// domains/occasion/service.ts
import { auth } from "@/lib/auth";
import * as OccasionRepository from "./repository";

export async function createSpecialOccasion(data: {
  title: string;
  date: Date;
  budget?: number;
  suggestions: string[];
  reminder?: boolean;
  userId: string;
  relationshipId: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  return OccasionRepository.createOccasion({
    title: data.title,
    date: new Date(data.date),
    budget: data.budget,
    giftIdeas: data.suggestions,
    userId: data.userId,
    relationshipId: data.relationshipId,
  });
}

export async function getSpecialOccasions(userId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  return OccasionRepository.findOccasions({ userId });
}

export async function updateSpecialOccasion(
  id: string,
  data: Partial<{
    title: string;
    date: Date;
    budget: number;
    suggestions: string[];
    reminder: boolean;
  }>
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const existing = await OccasionRepository.findOccasions({ id });
  if (!existing || existing.length === 0 || existing[0].userId !== session.user.id) {
    throw new Error("Occasion not found");
  }

  const updateData: any = {
    ...data,
    budget: data.budget !== undefined ? data.budget : undefined,
  };
  if (data.date) updateData.date = new Date(data.date);
  if (data.suggestions) updateData.giftIdeas = data.suggestions;

  return OccasionRepository.updateOccasion(id, updateData);
}

export async function deleteSpecialOccasion(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const existing = await OccasionRepository.findOccasions({ id });
  if (!existing || existing.length === 0 || existing[0].userId !== session.user.id) {
    throw new Error("Occasion not found");
  }

  return OccasionRepository.deleteOccasion(id);
}

export async function getUpcomingOccasions(userId: string, daysAhead: number = 30) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return OccasionRepository.findOccasions({
    userId,
    date: {
      gte: new Date(),
      lte: futureDate,
    },
  });
}
