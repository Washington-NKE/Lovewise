// domains/thoughtful-idea/service.ts
import { auth } from "@/lib/auth";
import * as ThoughtfulIdeaRepository from "./repository";

export async function createThoughtfulIdea(data: {
  title: string;
  description: string;
  type: "DIY" | "EXPERIENCE" | "INTIMATE" | "PERSONALIZED";
  progress?: number;
  targetDate?: Date;
  userId: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const targetDate = data.targetDate ? new Date(data.targetDate) : undefined;

  return ThoughtfulIdeaRepository.createIdea({
    title: data.title,
    description: data.description,
    type: data.type,
    progress: data.progress,
    targetDate,
    userId: data.userId,
  });
}

export async function getThoughtfulIdeas(userId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  return ThoughtfulIdeaRepository.findIdeas({ userId });
}

export async function updateThoughtfulIdea(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    type: "DIY" | "EXPERIENCE" | "INTIMATE" | "PERSONALIZED";
    progress: number;
    targetDate: Date;
    completed: boolean;
  }>
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const existing = await ThoughtfulIdeaRepository.findIdeas({ id });
  if (!existing || existing.length === 0 || existing[0].userId !== session.user.id) {
    throw new Error("Thoughtful idea not found");
  }

  const updateData: any = { ...data };
  if (data.targetDate) updateData.targetDate = new Date(data.targetDate);

  return ThoughtfulIdeaRepository.updateIdea(id, updateData);
}

export async function deleteThoughtfulIdea(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const existing = await ThoughtfulIdeaRepository.findIdeas({ id });
  if (!existing || existing.length === 0 || existing[0].userId !== session.user.id) {
    throw new Error("Thoughtful idea not found");
  }

  return ThoughtfulIdeaRepository.deleteIdea(id);
}
