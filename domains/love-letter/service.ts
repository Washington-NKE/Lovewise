// domains/love-letter/service.ts
import { auth } from "@/lib/auth";
import * as LoveLetterRepository from "./repository";

export async function createLoveLetter(data: {
  content: string;
  title?: string;
  private?: boolean;
  delivered?: boolean;
  userId: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  return LoveLetterRepository.createLetter({
    content: data.content,
    title: data.title,
    private: data.private,
    delivered: data.delivered,
    userId: data.userId,
  });
}

export async function getLoveLetters(userId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  return LoveLetterRepository.findLetters({ userId });
}

export async function updateLoveLetter(
  id: string,
  data: Partial<{
    content: string;
    title: string;
    private: boolean;
    delivered: boolean;
  }>
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const existingLetter = await LoveLetterRepository.findLetterById(id);
  if (!existingLetter || existingLetter.userId !== session.user.id) {
    throw new Error("Love letter not found");
  }

  return LoveLetterRepository.updateLetter(id, data);
}

export async function deleteLoveLetter(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const existingLetter = await LoveLetterRepository.findLetterById(id);
  if (!existingLetter || existingLetter.userId !== session.user.id) {
    throw new Error("Love letter not found");
  }

  return LoveLetterRepository.deleteLetter(id);
}
