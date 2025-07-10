// database/db.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";

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

/**
 * Get all journal entries for the current user's relationship
 */
export async function getJournalEntries(): Promise<JournalEntry[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  // First, get the user's active relationship
  const relationship = await prisma.relationship.findFirst({
    where: {
      OR: [
        { userId: session.user.id, status: 'ACTIVE' },
        { partnerId: session.user.id, status: 'ACTIVE' }
      ]
    }
  });

  if (!relationship) {
    return [];
  }

  return prisma.journal.findMany({
    where: {
      relationshipId: relationship.id,
      OR: [
        { isPrivate: false }, // Public entries
        { userId: session.user.id } // User's own private entries
      ]
    },
    include: {
      user: {
        select: {
          name: true,
          profileImage: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

/**
 * Get only shared (public) journal entries
 */
export async function getSharedJournalEntries(): Promise<JournalEntry[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const relationship = await prisma.relationship.findFirst({
    where: {
      OR: [
        { userId: session.user.id, status: 'ACTIVE' },
        { partnerId: session.user.id, status: 'ACTIVE' }
      ]
    }
  });

  if (!relationship) {
    return [];
  }

  return prisma.journal.findMany({
    where: {
      relationshipId: relationship.id,
      isPrivate: false
    },
    include: {
      user: {
        select: {
          name: true,
          profileImage: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

/**
 * Get only private journal entries for the current user
 */
export async function getPrivateJournalEntries(): Promise<JournalEntry[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const relationship = await prisma.relationship.findFirst({
    where: {
      OR: [
        { userId: session.user.id, status: 'ACTIVE' },
        { partnerId: session.user.id, status: 'ACTIVE' }
      ]
    }
  });

  if (!relationship) {
    return [];
  }

  return prisma.journal.findMany({
    where: {
      relationshipId: relationship.id,
      userId: session.user.id,
      isPrivate: true
    },
    include: {
      user: {
        select: {
          name: true,
          profileImage: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

/**
 * Create a new journal entry
 */
export async function createJournalEntry(formData: {
  title: string;
  content: string;
  mood?: string;
  isPrivate: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  // Get the user's active relationship
  const relationship = await prisma.relationship.findFirst({
    where: {
      OR: [
        { userId: session.user.id, status: 'ACTIVE' },
        { partnerId: session.user.id, status: 'ACTIVE' }
      ]
    }
  });

  if (!relationship) {
    throw new Error("No active relationship found");
  }

  const entry = await prisma.journal.create({
    data: {
      title: formData.title,
      content: formData.content,
      mood: formData.mood,
      isPrivate: formData.isPrivate,
      userId: session.user.id,
      relationshipId: relationship.id
    },
    include: {
      user: {
        select: {
          name: true,
          profileImage: true
        }
      }
    }
  });

  revalidatePath('/journal');
  return entry;
}

/**
 * Update an existing journal entry
 */
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

  // Check if the entry belongs to the current user
  const existingEntry = await prisma.journal.findUnique({
    where: { id },
    select: { userId: true }
  });

  if (!existingEntry || existingEntry.userId !== session.user.id) {
    throw new Error("Not authorized to update this entry");
  }

  const entry = await prisma.journal.update({
    where: { id },
    data: formData,
    include: {
      user: {
        select: {
          name: true,
          profileImage: true
        }
      }
    }
  });

  revalidatePath('/journal');
  return entry;
}

/**
 * Delete a journal entry
 */
export async function deleteJournalEntry(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  // Check if the entry belongs to the current user
  const existingEntry = await prisma.journal.findUnique({
    where: { id },
    select: { userId: true }
  });

  if (!existingEntry || existingEntry.userId !== session.user.id) {
    throw new Error("Not authorized to delete this entry");
  }

  await prisma.journal.delete({
    where: { id }
  });

  revalidatePath('/journal');
}

/**
 * Get journal entry by ID
 */
export async function getJournalEntryById(id: string): Promise<JournalEntry | null> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const entry = await prisma.journal.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          profileImage: true
        }
      }
    }
  });

  if (!entry) return null;

  // Check if user can access this entry
  if (entry.isPrivate && entry.userId !== session.user.id) {
    throw new Error("Not authorized to view this entry");
  }

  return entry;
}