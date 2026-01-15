// database/db.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { JsonValue } from "@prisma/client/runtime/library";
import type { Gift } from "@prisma/client";

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

export interface Memory {
  id: string;
  title: string;
  description: string;
  date: string;
  location?: string | null;
  mediaUrls?: JsonValue;
  album?: string | null;
  isFavorite: boolean;
  isSaved: boolean;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  relationshipId: string;
  gradient?: string; // This will be added dynamically
}

// Type for the raw Prisma memory response (before date string conversion)
export type PrismaMemory = {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string | null;
  mediaUrls: JsonValue;
  album: string | null;
  isFavorite: boolean;
  isSaved: boolean;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  relationshipId: string;
};

export interface NewMemoryData {
  title: string;
  description: string;
  album: string;
  mediaUrls: string[];
  isFavorite: boolean;
  relationshipId: string;
  creatorId: string;
  location?: string;
}

// Predefined gradients array
const GRADIENTS = [
  "from-pink-500 via-red-500 to-orange-500",
  "from-cyan-400 via-blue-500 to-purple-600",
  "from-emerald-400 via-teal-500 to-green-600",
  "from-indigo-500 via-purple-600 to-pink-500",
  "from-purple-600 via-pink-600 to-red-500",
  "from-amber-400 via-orange-500 to-red-500",
  "from-rose-400 via-fuchsia-500 to-indigo-500",
  "from-violet-500 via-purple-500 to-pink-500",
  "from-blue-600 via-purple-600 to-indigo-700",
  "from-green-400 via-blue-500 to-purple-600",
  "from-teal-400 via-cyan-500 to-blue-600",
  "from-orange-400 via-red-500 to-pink-600",
  "from-lime-400 via-green-500 to-emerald-600",
  "from-fuchsia-500 via-purple-600 to-pink-600",
  "from-sky-400 via-blue-500 to-indigo-600"
];

// Function to get a random gradient
export const getRandomGradient = async (): Promise<string> => {
  return GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];
};

// Function to attach gradient to memory objects
const attachGradientToMemory = async (memory: PrismaMemory): Promise<Memory> => {
  const gradient = await getRandomGradient();
  return {
    ...memory,
    date: memory.date.toISOString(),
    createdAt: memory.createdAt.toISOString(),
    updatedAt: memory.updatedAt.toISOString(),
    gradient: gradient
  };
};

// Get all memories for a specific relationship
export const getMemoriesByRelationship = async (relationshipId: string): Promise<Memory[]> => {
  try {
    const memories = await prisma.memory.findMany({
      where: {
        relationshipId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return await Promise.all(memories.map(attachGradientToMemory))
  } catch (error) {
    console.error('Error fetching memories:', error);
    throw new Error('Failed to fetch memories');
  }
};

// Get favorite memories for a specific relationship
export const getFavoriteMemoriesByRelationship = async (relationshipId: string): Promise<Memory[]> => {
  try {
    const memories = await prisma.memory.findMany({
      where: {
        relationshipId,
        isFavorite: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return await Promise.all(memories.map(attachGradientToMemory));
  } catch (error) {
    console.error('Error fetching favorite memories:', error);
    throw new Error('Failed to fetch favorite memories');
  }
};

// Get memories by album for a specific relationship
export const getMemoriesByAlbum = async (relationshipId: string, album: string): Promise<Memory[]> => {
  try {
    const memories = await prisma.memory.findMany({
      where: {
        relationshipId,
        album
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return await Promise.all(memories.map(attachGradientToMemory));
  } catch (error) {
    console.error('Error fetching memories by album:', error);
    throw new Error('Failed to fetch memories by album');
  }
};

// Get all unique albums for a specific relationship
export const getAlbumsByRelationship = async (relationshipId: string): Promise<string[]> => {
  try {
    const albums = await prisma.memory.findMany({
      where: {
        relationshipId,
        album: {
          not: null
        }
      },
      select: {
        album: true
      },
      distinct: ['album']
    });

    return albums.map(item => item.album).filter(Boolean) as string[];
  } catch (error) {
    console.error('Error fetching albums:', error);
    throw new Error('Failed to fetch albums');
  }
};

// Create a new memory
export const createMemory = async (data: NewMemoryData): Promise<Memory> => {
  try {
    const memory = await prisma.memory.create({
      data: {
        title: data.title,
        description: data.description,
        album: data.album,
        mediaUrls: data.mediaUrls,
        isFavorite: data.isFavorite,
        relationshipId: data.relationshipId,
        creatorId: data.creatorId,
        location: data.location,
        date: new Date(),
        isSaved: false
      }
    });

    return attachGradientToMemory(memory);
  } catch (error) {
    console.error('Error creating memory:', error);
    throw new Error('Failed to create memory');
  }
};

// Toggle favorite status of a memory
export const toggleMemoryFavorite = async (memoryId: string): Promise<Memory> => {
  try {
    // First get the current state
    const currentMemory = await prisma.memory.findUnique({
      where: { id: memoryId }
    });

    if (!currentMemory) {
      throw new Error('Memory not found');
    }

    // Toggle the favorite status
    const updatedMemory = await prisma.memory.update({
      where: { id: memoryId },
      data: {
        isFavorite: !currentMemory.isFavorite,
        updatedAt: new Date()
      }
    });

    return attachGradientToMemory(updatedMemory);
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw new Error('Failed to toggle favorite status');
  }
};

// Toggle saved status of a memory
export const toggleMemorySaved = async (memoryId: string): Promise<Memory> => {
  try {
    // First get the current state
    const currentMemory = await prisma.memory.findUnique({
      where: { id: memoryId }
    });

    if (!currentMemory) {
      throw new Error('Memory not found');
    }

    // Toggle the saved status
    const updatedMemory = await prisma.memory.update({
      where: { id: memoryId },
      data: {
        isSaved: !currentMemory.isSaved,
        updatedAt: new Date()
      }
    });

    return attachGradientToMemory(updatedMemory);
  } catch (error) {
    console.error('Error toggling saved:', error);
    throw new Error('Failed to toggle saved status');
  }
};

// Get a single memory by ID
export const getMemoryById = async (memoryId: string): Promise<Memory | null> => {
  try {
    const memory = await prisma.memory.findUnique({
      where: { id: memoryId }
    });

    return memory ? attachGradientToMemory(memory) : null;
  } catch (error) {
    console.error('Error fetching memory:', error);
    throw new Error('Failed to fetch memory');
  }
};

// Delete a memory
export const deleteMemory = async (memoryId: string): Promise<boolean> => {
  try {
    await prisma.memory.delete({
      where: { id: memoryId }
    });

    return true;
  } catch (error) {
    console.error('Error deleting memory:', error);
    throw new Error('Failed to delete memory');
  }
};

// Update a memory
export const updateMemory = async (memoryId: string, data: Partial<NewMemoryData>): Promise<Memory> => {
  try {
    const updatedMemory = await prisma.memory.update({
      where: { id: memoryId },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    return attachGradientToMemory(updatedMemory);
  } catch (error) {
    console.error('Error updating memory:', error);
    throw new Error('Failed to update memory');
  }
};

//Get memory statistics for a relationship
export const getMemoryStats = async (relationshipId: string) => {
  try {
    const [totalMemories, favoriteMemories, savedMemories, albumCount] = await Promise.all([
      prisma.memory.count({
        where: { relationshipId }
      }),
      prisma.memory.count({
        where: { relationshipId, isFavorite: true }
      }),
      prisma.memory.count({
        where: { relationshipId, isSaved: true }
      }),
      prisma.memory.groupBy({
        by: ['album'],
        where: { 
          relationshipId,
          album: { not: null }
        },
        _count: true
      })
    ]);

    return {
      totalMemories,
      favoriteMemories,
      savedMemories,
      albumCount: albumCount.length
    };
  } catch (error) {
    console.error('Error fetching memory stats:', error);
    throw new Error('Failed to fetch memory statistics');
  }
};

/**
 * Get the current user's active relationship ID
 * Returns the relationship ID if found, null if no active relationship exists
 */
export async function getRelationshipId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  try {
    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [
          { userId: session.user.id, status: 'ACTIVE' },
          { partnerId: session.user.id, status: 'ACTIVE' }
        ]
      },
      select: {
        id: true,
        status: true,
        userId: true,
        partnerId: true
      }
    });

    console.log("🔍 Found relationship for user:", {
      userId: session.user.id,
      relationship: relationship
    });

    return relationship ? relationship.id : null;
  } catch (error) {
    console.error("❌ Error fetching user relationship:", error);
    throw new Error("Failed to fetch user relationship");
  }
}

/**
 * Get detailed information about the current user's active relationship
 * Includes partner information and relationship metadata
 */
export async function getCurrentUserRelationshipDetails():    Promise<{
    id: string;
    status: string;
    userId: string;
    partnerId: string;
    createdAt: Date;
    updatedAt: Date;
    partner?: {
      id: string;
      name: string;
      email: string;
      profileImage?: string;
    };
    user?: {
      id: string;
      name: string;
      email: string;
      profileImage?: string;
    };
    } | null> {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Not authenticated");
    }

    try {
      const relationship = await prisma.relationship.findFirst({
        where: {
          OR: [
            { userId: session.user.id, status: 'ACTIVE' },
            { partnerId: session.user.id, status: 'ACTIVE' }
          ]
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true
            }
          },
          partner: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true
            }
          }
        }
      });

      // Normalize profileImage from null to undefined to match return type
      if (relationship) {
        return {
          ...relationship,
          user: relationship.user ? { ...relationship.user, profileImage: relationship.user.profileImage ?? undefined } : undefined,
          partner: relationship.partner ? { ...relationship.partner, profileImage: relationship.partner.profileImage ?? undefined } : undefined
        };
      }

      return relationship;
    } catch (error) {
      console.error("❌ Error fetching relationship details:", error);
      throw new Error("Failed to fetch relationship details");
    }
}


/**
 * Get all relationships for the current user (active and inactive)
 * Useful for debugging or showing relationship history
 */
export async function getCurrentUserRelationships(): Promise<Array<{
  id: string;
  status: string;
  createdAt: Date;
  partner?: {
    id: string;
    name: string;
    email: string;
  };
}>> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  try {
    const relationships = await prisma.relationship.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { partnerId: session.user.id }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        partner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return relationships.map(rel => ({
      id: rel.id,
      status: rel.status,
      createdAt: rel.createdAt,
      partner: rel.userId === session.user.id ? rel.partner : rel.user
    }));
  } catch (error) {
    console.error("❌ Error fetching user relationships:", error);
    throw new Error("Failed to fetch user relationships");
  }
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location?: string;
  date: string;
  time?: string;
  isAllDay: boolean;
  type: string;
  createdAt: string;
  updatedAt: string;
  reminderTime?: string;
  creatorId: string;
  relationshipId: string;
  gradient?: string;
}

export interface NewEventData {
  title: string;
  description: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  time?: string;
  type: string;
  isAllDay: boolean;
  reminderTime?: Date | string | null;
  relationshipId: string;
  creatorId: string;
}

const eventGradients = [
  "from-red-400 to-pink-600",
  "from-purple-400 to-indigo-600",
  "from-pink-500 to-rose-600",
  "from-fuchsia-500 to-purple-600",
  "from-amber-400 via-orange-500 to-red-500",
  "from-blue-500 to-cyan-600",
  "from-green-400 to-teal-500",
  "from-yellow-400 to-amber-500",
  "from-emerald-400 to-teal-500",
  "from-violet-500 to-purple-600",
  "from-sky-400 to-blue-500",
  "from-lime-400 to-green-500",
  "from-rose-400 to-pink-500",
  "from-indigo-500 to-purple-600",
  "from-cyan-400 to-blue-500",
  "from-teal-400 to-green-500",
];

export const getRandomEventGradient = async (): Promise<string> => {
  return eventGradients[Math.floor(Math.random() * eventGradients.length)];
};

const attachGradientToEvent = async (event: Event): Promise<Event> => {
 const gradient = await getRandomEventGradient();
  return {
    ...event,
    createdAt: event.createdAt.toString(),
    updatedAt: event.updatedAt.toString(),
    gradient: gradient
  };
};

export const getUpcomingEventsByRelationship = async (relationshipId: string): Promise<Event[]> => {
  try {
    console.log("🔍 DB: Querying events for relationship ID:", relationshipId)
    
    const events = await prisma.event.findMany({
      where: {
        AND: [
          {relationshipId},
          {
            startDate: {
              gte: new Date(),
            },
          },
        ], 
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log("✅ DB: Raw events from database:", events)
    console.log("🔍 DB: Number of raw events:", events.length)

    if (!events || events.length === 0) {
      console.log("⚠️ DB: No events found for relationship ID:", relationshipId)
      return []
    }

    // Map DB fields to Event interface
    const mappedEvents: Event[] = events.map((event) => {
      console.log("🔍 DB: Mapping event:", event.id, event.title)
      
      return {
        id: event.id,
        title: event.title,
        description: event.description ?? "",
        location: event.location ?? undefined,
        date: event.startDate ? event.startDate.toISOString() : new Date().toISOString(),
        time: event.time ?? undefined,
        isAllDay: event.isAllDay,
        type: event.type ?? "other",
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
        reminderTime: event.reminderTime ? event.reminderTime.toISOString() : undefined,
        creatorId: event.creatorId,
        relationshipId: event.relationshipId,
        gradient: undefined // Will be set by attachGradientToEvent
      }
    });

    console.log("✅ DB: Mapped events:", mappedEvents)

    // Attach gradients to events
    const eventsWithGradients = await Promise.all(
      mappedEvents.map(async (event) => {
        const eventWithGradient = await attachGradientToEvent(event)
        console.log("✅ DB: Event with gradient:", eventWithGradient.id, eventWithGradient.gradient)
        return eventWithGradient
      })
    )

    console.log("✅ DB: Final events with gradients:", eventsWithGradients)
    return eventsWithGradients

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : ''
    console.error('❌ DB: Error fetching events:', error)
    console.error('❌ DB: Error message:', errorMessage)
    console.error('❌ DB: Error stack:', errorStack)
    throw new Error('Failed to fetch events: ' + errorMessage)
  }
}

export const getPastEventsByRelationship = async (relationshipId: string): Promise<Event[]> => {
  try {
    const pastEvents = await prisma.event.findMany({
      where: {
        AND: [
          {relationshipId},
          {
            startDate: {
              lt: new Date(),
            },
          },
        ], 
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!pastEvents || pastEvents.length === 0) {
      console.log("⚠️ DB: No events found for relationship ID:", relationshipId)
      return []
    }

    // Map DB fields to Event interface
    const mappedEvents: Event[] = pastEvents.map((event) => {
      console.log("🔍 DB: Mapping event:", event.id, event.title)
      
      return {
        id: event.id,
        title: event.title,
        description: event.description ?? "",
        location: event.location ?? undefined,
        date: event.startDate ? event.startDate.toISOString() : new Date().toISOString(),
        time: event.time ?? undefined,
        isAllDay: event.isAllDay,
        type: event.type ?? "other",
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
        reminderTime: event.reminderTime ? event.reminderTime.toISOString() : undefined,
        creatorId: event.creatorId,
        relationshipId: event.relationshipId,
        gradient: undefined 
      }
    });

    console.log("✅ DB: Mapped events:", mappedEvents)

    // Attach gradients to events
    const eventsWithGradients = await Promise.all(
      mappedEvents.map(async (event) => {
        const eventWithGradient = await attachGradientToEvent(event)
        console.log("✅ DB: Event with gradient:", eventWithGradient.id, eventWithGradient.gradient)
        return eventWithGradient
      })
    )

    console.log("✅ DB: Final events with gradients:", eventsWithGradients)
    return eventsWithGradients

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : ''
    console.error('❌ DB: Error fetching events:', error)
    console.error('❌ DB: Error message:', errorMessage)
    console.error('❌ DB: Error stack:', errorStack)
    throw new Error('Failed to fetch events: ' + errorMessage)
  }
}

// Create a new event
export const createEvent = async (data: NewEventData): Promise<Event> => {
  try {
    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        startDate: data.startDate,
        endDate: data.endDate || data.startDate,
        time: data.time,
        type: data.type,
        isAllDay: data.isAllDay,
        reminderTime: data.reminderTime && data.reminderTime !== "" ? data.reminderTime : null,
        relationshipId: data.relationshipId,
        creatorId: data.creatorId,
      }
    });

    const mappedEvent: Event = {
      id: event.id,
      title: event.title,
      description: event.description ?? "",
      location: event.location ?? undefined,
      date: event.startDate.toISOString(),
      time: event.time ?? undefined,
      isAllDay: event.isAllDay,
      type: event.type ?? "other",
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      reminderTime: event.reminderTime ? event.reminderTime.toISOString() : undefined,
      creatorId: event.creatorId,
      relationshipId: event.relationshipId,
      gradient: undefined
    };
    return attachGradientToEvent(mappedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    throw new Error('Failed to create event');
  }
};

// Optional: Batch update multiple memories (useful for bulk operations)
export const updateMultipleMemories = async (updates: { id: string; changes: Partial<NewMemoryData> }[]): Promise<Memory[]> => {
  const promises = updates.map(({ id, changes }) => updateMemory(id, changes));
  return Promise.all(promises);
};

// Optional: Get memories by creator (useful for showing "my memories" vs "partner's memories")
export const getMemoriesByCreator = async (creatorId: string, relationshipId: string): Promise<Memory[]> => {
  const memories = await prisma.memory.findMany({
    where: {
      creatorId,
      relationshipId
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  if (!memories || memories.length === 0) {
    throw new Error(`Failed to fetch memories by creator`);
  }

  return Promise.all(memories.map(async (memory) => {
    const prismaMemory = memory as PrismaMemory
    return {
      id: prismaMemory.id,
      title: prismaMemory.title,
      description: prismaMemory.description,
      album: prismaMemory.album ?? undefined,
      mediaUrls: (prismaMemory.mediaUrls as string[] | null) || [],
      isFavorite: prismaMemory.isFavorite,
      isSaved: prismaMemory.isSaved,
      date: prismaMemory.date.toISOString(),
      location: prismaMemory.location ?? undefined,
      createdAt: prismaMemory.createdAt.toISOString(),
      updatedAt: prismaMemory.updatedAt.toISOString(),
      gradient: await getRandomGradient(),
      creatorId: prismaMemory.creatorId,
      relationshipId: prismaMemory.relationshipId
    };
  }));
};

//Gift-related database functions

export async function createGift(giftData: {
  giftName: string
  date?: Date
  occasion?: string
  description?: string
  reaction?: string
  image?: string
  giverId: string
  recipientId: string
  relationshipId: string
}): Promise<Gift> {
  return await prisma.gift.create({
    data: {
      name: giftData.giftName,
      dateGiven: giftData.date,
      occasion: giftData.occasion,
      description: giftData.description,
      reaction: giftData.reaction,
      imageUrl: giftData.image,
      giverId: giftData.giverId,
      recipientId: giftData.recipientId,
      relationshipId: giftData.relationshipId
    },
    include: {
      giver: { select: { id: true, name: true, email: true } },
      recipient: { select: { id: true, name: true, email: true } }
    }
  })
}

export async function getGiftHistory(userId: string) {
  return await prisma.gift.findMany({
    where: {
      OR: [
        { giverId: userId },
        { recipientId: userId }
      ]
    },
    include: {
      giver: { select: { id: true, name: true, email: true } },
      recipient: { select: { id: true, name: true, email: true } }
    },
    orderBy: { dateGiven: 'desc' }
  })
}

export async function updateGift(id: string, data: Partial<{
  giftName: string
  date: Date
  occasion: string
  description: string
  reaction: string
  image: string
  isFavorite: boolean
}>) {
  const updateData: Record<string, unknown> = {}
  if (data.giftName) updateData.name = data.giftName
  if (data.date) updateData.dateGiven = data.date
  if (data.occasion) updateData.occasion = data.occasion
  if (data.description) updateData.description = data.description
  if (data.reaction) updateData.reaction = data.reaction
  if (data.image) updateData.imageUrl = data.image
  if (data.isFavorite !== undefined) updateData.isFavorite = data.isFavorite
  
  return await prisma.gift.update({
    where: { id },
    data: updateData,
    include: {
      giver: { select: { id: true, name: true, email: true } },
      recipient: { select: { id: true, name: true, email: true } }
    }
  })
}

export async function deleteGift(id: string) {
  return await prisma.gift.delete({
    where: { id }
  })
}

export async function getFavoriteGifts(userId: string) {
  return await prisma.gift.findMany({
    where: {
      AND: [
        { isFavorite: true },
        {
          OR: [
            { giverId: userId },
            { recipientId: userId }
          ]
        }
      ]
    },
    include: {
      giver: { select: { id: true, name: true, email: true } },
      recipient: { select: { id: true, name: true, email: true } }
    },
    orderBy: { dateGiven: 'desc' }
  })
}

// Wishlist Functions
export async function createWishlistItem(data: {
  item: string
  priority: 'MUST_HAVE' | 'WOULD_LOVE' | 'NICE_TO_HAVE'
  surprise?: number
  notes?: string
  userId: string
  relationshipId: string
}) {
  return await prisma.wishlistItem.create({
    data: {
      name: data.item,
      priority: data.priority,
      description: data.notes,
      userId: data.userId,
      relationshipId: data.relationshipId
    },
    include: {
      user: { select: { id: true, name: true, email: true } }
    }
  })
}

export async function getWishlist(userId: string, relationshipId: string) {
  return await prisma.wishlistItem.findMany({
    where: { 
      userId,
      relationshipId
    },
    include: {
      user: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function updateWishlistItem(id: string, data: Partial<{
  item: string
  priority: 'MUST_HAVE' | 'WOULD_LOVE' | 'NICE_TO_HAVE'
  surprise?: number
  notes?: string
  isSecret?: boolean
}>) {
  const updateData: Record<string, unknown> = {}
  if (data.item) updateData.name = data.item
  if (data.priority) updateData.priority = data.priority
  if (data.notes) updateData.description = data.notes
  if (data.isSecret !== undefined) updateData.isSecret = data.isSecret
  
  return await prisma.wishlistItem.update({
    where: { id },
    data: updateData,
    include: {
      user: { select: { id: true, name: true, email: true } }
    }
  })
}

export async function deleteWishlistItem(id: string) {
  return await prisma.wishlistItem.delete({
    where: { id }
  })
}

export async function markAsGifted(id: string) {
  return await prisma.wishlistItem.update({
    where: { id },
    data: { isSecret: true }
  })
}

// Special Occasions Functions
export async function createSpecialOccasion(data: {
  title: string
  date: Date
  budget?: number
  suggestions: string[]
  reminder?: boolean
  userId: string
  relationshipId: string
}) {
  return await prisma.specialOccasion.create({
    data: {
      title: data.title,
      date: data.date,
      budget: data.budget,
      giftIdeas: data.suggestions,
      userId: data.userId,
      relationshipId: data.relationshipId
    },
    include: {
      user: { select: { id: true, name: true, email: true } }
    }
  })
}

export async function getSpecialOccasions(userId: string) {
  return await prisma.specialOccasion.findMany({
    where: { userId },
    include: {
      user: { select: { id: true, name: true, email: true } }
    },
    orderBy: { date: 'asc' }
  })
}

export async function updateSpecialOccasion(id: string, data: Partial<{
  title: string
  date: Date
  budget: number
  suggestions: string[]
  reminder: boolean
}>) {
  return await prisma.specialOccasion.update({
    where: { id },
    data: {
      ...data,
      budget: data.budget ? data.budget : undefined
    },
    include: {
      user: { select: { id: true, name: true, email: true } }
    }
  })
}

export async function deleteSpecialOccasion(id: string) {
  return await prisma.specialOccasion.delete({
    where: { id }
  })
}

// Thoughtful Ideas Functions
export async function createThoughtfulIdea(data: {
  title: string
  description: string
  type: 'DIY' | 'EXPERIENCE' | 'INTIMATE' | 'PERSONALIZED'
  progress?: number
  targetDate?: Date
  userId: string
}) {
  return await prisma.thoughtfulIdea.create({
    data,
    include: {
      user: { select: { id: true, name: true, email: true } }
    }
  })
}

export async function getThoughtfulIdeas(userId: string) {
  return await prisma.thoughtfulIdea.findMany({
    where: { userId },
    include: {
      user: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function updateThoughtfulIdea(id: string, data: Partial<{
  title: string
  description: string
  type: 'DIY' | 'EXPERIENCE' | 'INTIMATE' | 'PERSONALIZED'
  progress: number
  targetDate: Date
  completed: boolean
}>) {
  return await prisma.thoughtfulIdea.update({
    where: { id },
    data,
    include: {
      user: { select: { id: true, name: true, email: true } }
    }
  })
}

export async function deleteThoughtfulIdea(id: string) {
  return await prisma.thoughtfulIdea.delete({
    where: { id }
  })
}

// Secret Plans Functions
export async function createSecretPlan(data: {
  title: string
  description?: string
  progress?: number
  budget?: number
  targetDate?: Date
  userId: string
}) {
  return await prisma.secretPlan.create({
    data: {
      ...data,
      budget: data.budget ? data.budget : undefined
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: true
    }
  })
}

export async function getSecretPlans(userId: string) {
  return await prisma.secretPlan.findMany({
    where: { userId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function updateSecretPlan(id: string, data: Partial<{
  title: string
  description: string
  progress: number
  budget: number
  targetDate: Date
}>) {
  return await prisma.secretPlan.update({
    where: { id },
    data: {
      ...data,
      budget: data.budget ? data.budget : undefined
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: true
    }
  })
}

export async function deleteSecretPlan(id: string) {
  return await prisma.secretPlan.delete({
    where: { id }
  })
}

// Secret Plan Items Functions
export async function createSecretPlanItem(data: {
  item: string
  completed?: boolean
  cost?: number
  notes?: string
  planId: string
}) {
  return await prisma.secretPlanItem.create({
    data: {
      item: data.item,
      completed: data.completed,
      cost: data.cost,
      notes: data.notes,
      secretPlanId: data.planId,
      planId: data.planId
    }
  })
}

export async function updateSecretPlanItem(id: string, data: Partial<{
  item: string
  completed: boolean
  cost: number
  notes: string
}>) {
  const updateData: Record<string, unknown> = {}
  if (data.item) updateData.item = data.item
  if (data.completed !== undefined) updateData.completed = data.completed
  if (data.cost !== undefined) updateData.cost = data.cost
  if (data.notes) updateData.notes = data.notes
  
  return await prisma.secretPlanItem.update({
    where: { id },
    data: updateData
  })
}

export async function deleteSecretPlanItem(id: string) {
  return await prisma.secretPlanItem.delete({
    where: { id }
  })
}

// Love Letters Functions
export async function createLoveLetter(data: {
  content: string
  title?: string
  private?: boolean
  userId: string
}) {
  return await prisma.loveLetter.create({
    data,
    include: {
      user: { select: { id: true, name: true, email: true } }
    }
  })
}

export async function getLoveLetters(userId: string) {
  return await prisma.loveLetter.findMany({
    where: { userId },
    include: {
      user: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function updateLoveLetter(id: string, data: Partial<{
  content: string
  title: string
  private: boolean
  delivered: boolean
}>) {
  return await prisma.loveLetter.update({
    where: { id },
    data,
    include: {
      user: { select: { id: true, name: true, email: true } }
    }
  })
}

export async function deleteLoveLetter(id: string) {
  return await prisma.loveLetter.delete({
    where: { id }
  })
}

// User Functions
export async function createUser(data: {
  email: string
  name?: string
}) {
  return await prisma.user.create({
    data: {
      email: data.email,
      name: data.name ?? "",
      password: ""
    }
  })
}

export async function getUser(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      giftsGiven: true,
      giftsReceived: true,
      wishlistItems: true,
      specialOccasions: true,
      thoughtfulIdeas: true,
      secretPlans: { include: { items: true } },
      loveLetters: true
    }
  })
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email }
  })
}

// Utility Functions
export async function getUpcomingOccasions(userId: string, daysAhead: number = 30) {
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + daysAhead)
  
  return await prisma.specialOccasion.findMany({
    where: {
      userId,
      date: {
        gte: new Date(),
        lte: futureDate
      }
    },
    orderBy: { date: 'asc' }
  })
}

export async function getGiftStats(userId: string) {
  const [totalGifts, totalGiven, totalReceived, favoriteCount] = await Promise.all([
    prisma.gift.count({
      where: {
        OR: [
          { giverId: userId },
          { recipientId: userId }
        ]
      }
    }),
    prisma.gift.count({
      where: { giverId: userId }
    }),
    prisma.gift.count({
      where: { recipientId: userId }
    }),
    prisma.gift.count({
      where: {
        isFavorite: true,
        OR: [
          { giverId: userId },
          { recipientId: userId }
        ]
      }
    })
  ])

  return {
    totalGifts,
    totalGiven,
    totalReceived,
    favoriteCount
  }
}

// Game Functions
export async function getAllGames() {
  try {
    const games = await prisma.game.findMany({
      orderBy: {
        title: 'asc'
      }
    });
    return games;
  } catch (error) {
    console.error('Error fetching games:', error);
    throw new Error('Failed to fetch games');
  }
}

export async function createGame(data: {
  title: string;
  slug: string;
  description: string;
  maxPlayers: number;
}) {
  try {
    const game = await prisma.game.create({
      data
    });
    return game;
  } catch (error) {
    console.error('Error creating game:', error);
    throw new Error('Failed to create game');
  }
}