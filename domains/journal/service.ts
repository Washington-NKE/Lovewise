// domains/journal/service.ts
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import * as JournalRepository from "./repository";
import * as RelationshipRepository from "../relationship/repository";

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: string | null;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  relationshipId: string;
  user: {
    name: string;
    profileImage?: string | null;
  };
}

async function getActiveRelationship(userId: string) {
  const relationship = await RelationshipRepository.findActiveRelationshipByUserId(userId);
  if (!relationship) return null;
  return relationship.id;
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const relationshipId = await getActiveRelationship(session.user.id);
  if (!relationshipId) return [];

  const entries = await JournalRepository.findJournalEntries(relationshipId, {
    OR: [
      { isPrivate: false },
      { userId: session.user.id },
    ],
  });

  return entries as JournalEntry[];
}

export async function getSharedJournalEntries(): Promise<JournalEntry[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const relationshipId = await getActiveRelationship(session.user.id);
  if (!relationshipId) return [];

  const entries = await JournalRepository.findJournalEntries(relationshipId, {
    isPrivate: false,
  });

  return entries as JournalEntry[];
}

export async function getPrivateJournalEntries(): Promise<JournalEntry[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const relationshipId = await getActiveRelationship(session.user.id);
  if (!relationshipId) return [];

  const entries = await JournalRepository.findJournalEntries(relationshipId, {
    userId: session.user.id,
    isPrivate: true,
  });

  return entries as JournalEntry[];
}

export async function createJournalEntry(formData: {
  title: string;
  content: string;
  mood?: string;
  isPrivate: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const relationshipId = await getActiveRelationship(session.user.id);
  if (!relationshipId) throw new Error("No active relationship found");

  const entry = await JournalRepository.createJournal({
    title: formData.title,
    content: formData.content,
    mood: formData.mood,
    isPrivate: formData.isPrivate,
    userId: session.user.id,
    relationshipId,
  });

  revalidatePath("/journal");
  return entry;
}

export async function updateJournalEntry(
  id: string,
  formData: Partial<{
    title: string;
    content: string;
    mood: string;
    isPrivate: boolean;
  }>
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const existingEntry = await JournalRepository.findJournalById(id);
  if (!existingEntry || existingEntry.userId !== session.user.id) {
    throw new Error("Not authorized to update this entry");
  }

  const entry = await JournalRepository.updateJournal(id, formData);
  revalidatePath("/journal");
  return entry;
}

export async function deleteJournalEntry(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const existingEntry = await JournalRepository.findJournalById(id);
  if (!existingEntry || existingEntry.userId !== session.user.id) {
    throw new Error("Not authorized to delete this entry");
  }

  await JournalRepository.deleteJournal(id);
  revalidatePath("/journal");
}

export async function getJournalEntryById(id: string): Promise<JournalEntry | null> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const entry = await JournalRepository.findJournalById(id);
  if (!entry) return null;

  if (entry.isPrivate && entry.userId !== session.user.id) {
    throw new Error("Not authorized to view this entry");
  }

  return entry as JournalEntry;
}
