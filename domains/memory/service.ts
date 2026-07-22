// domains/memory/service.ts
import { JsonValue } from "@prisma/client/runtime/library";
import * as MemoryRepository from "./repository";

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
  gradient?: string;
}

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
  "from-sky-400 via-blue-500 to-indigo-600",
];

export const getRandomGradient = async (): Promise<string> => {
  return GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];
};

const attachGradientToMemory = async (memory: PrismaMemory): Promise<Memory> => {
  const gradient = await getRandomGradient();
  return {
    ...memory,
    date: memory.date.toISOString(),
    createdAt: memory.createdAt.toISOString(),
    updatedAt: memory.updatedAt.toISOString(),
    gradient,
  };
};

export const getMemoriesByRelationship = async (relationshipId: string): Promise<Memory[]> => {
  try {
    const memories = await MemoryRepository.findMemories(relationshipId);
    return await Promise.all(memories.map(attachGradientToMemory));
  } catch (error) {
    console.error("Error fetching memories:", error);
    throw new Error("Failed to fetch memories");
  }
};

export const getFavoriteMemoriesByRelationship = async (relationshipId: string): Promise<Memory[]> => {
  try {
    const memories = await MemoryRepository.findMemories(relationshipId, { isFavorite: true });
    return await Promise.all(memories.map(attachGradientToMemory));
  } catch (error) {
    console.error("Error fetching favorite memories:", error);
    throw new Error("Failed to fetch favorite memories");
  }
};

export const getMemoriesByAlbum = async (relationshipId: string, album: string): Promise<Memory[]> => {
  try {
    const memories = await MemoryRepository.findMemories(relationshipId, { album });
    return await Promise.all(memories.map(attachGradientToMemory));
  } catch (error) {
    console.error("Error fetching memories by album:", error);
    throw new Error("Failed to fetch memories by album");
  }
};

export const getAlbumsByRelationship = async (relationshipId: string): Promise<string[]> => {
  try {
    const albums = await MemoryRepository.findAlbums(relationshipId);
    return albums.map((item) => item.album).filter(Boolean) as string[];
  } catch (error) {
    console.error("Error fetching albums:", error);
    throw new Error("Failed to fetch albums");
  }
};

export const createMemory = async (data: NewMemoryData): Promise<Memory> => {
  try {
    const memory = await MemoryRepository.createMemory({
      title: data.title,
      description: data.description,
      album: data.album,
      mediaUrls: data.mediaUrls,
      isFavorite: data.isFavorite,
      relationshipId: data.relationshipId,
      creatorId: data.creatorId,
      location: data.location,
      date: new Date(),
      isSaved: false,
    });
    return attachGradientToMemory(memory);
  } catch (error) {
    console.error("Error creating memory:", error);
    throw new Error("Failed to create memory");
  }
};

export const toggleMemoryFavorite = async (memoryId: string): Promise<Memory> => {
  try {
    const currentMemory = await MemoryRepository.findMemoryById(memoryId);
    if (!currentMemory) throw new Error("Memory not found");

    const updatedMemory = await MemoryRepository.updateMemory(memoryId, {
      isFavorite: !currentMemory.isFavorite,
      updatedAt: new Date(),
    });
    return attachGradientToMemory(updatedMemory);
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw new Error("Failed to toggle favorite status");
  }
};

export const toggleMemorySaved = async (memoryId: string): Promise<Memory> => {
  try {
    const currentMemory = await MemoryRepository.findMemoryById(memoryId);
    if (!currentMemory) throw new Error("Memory not found");

    const updatedMemory = await MemoryRepository.updateMemory(memoryId, {
      isSaved: !currentMemory.isSaved,
      updatedAt: new Date(),
    });
    return attachGradientToMemory(updatedMemory);
  } catch (error) {
    console.error("Error toggling saved:", error);
    throw new Error("Failed to toggle saved status");
  }
};

export const getMemoryById = async (memoryId: string): Promise<Memory | null> => {
  try {
    const memory = await MemoryRepository.findMemoryById(memoryId);
    return memory ? attachGradientToMemory(memory) : null;
  } catch (error) {
    console.error("Error fetching memory:", error);
    throw new Error("Failed to fetch memory");
  }
};

export const deleteMemory = async (memoryId: string): Promise<boolean> => {
  try {
    await MemoryRepository.deleteMemory(memoryId);
    return true;
  } catch (error) {
    console.error("Error deleting memory:", error);
    throw new Error("Failed to delete memory");
  }
};

export const updateMemory = async (memoryId: string, data: Partial<NewMemoryData>): Promise<Memory> => {
  try {
    const updatedMemory = await MemoryRepository.updateMemory(memoryId, {
      ...data,
      updatedAt: new Date(),
    });
    return attachGradientToMemory(updatedMemory);
  } catch (error) {
    console.error("Error updating memory:", error);
    throw new Error("Failed to update memory");
  }
};

export const getMemoryStats = async (relationshipId: string) => {
  try {
    const [totalMemories, favoriteMemories, savedMemories, albumCount] = await Promise.all([
      MemoryRepository.countMemories(relationshipId),
      MemoryRepository.countMemories(relationshipId, { isFavorite: true }),
      MemoryRepository.countMemories(relationshipId, { isSaved: true }),
      MemoryRepository.getAlbumsGrouped(relationshipId),
    ]);

    return {
      totalMemories,
      favoriteMemories,
      savedMemories,
      albumCount: albumCount.length,
    };
  } catch (error) {
    console.error("Error fetching memory stats:", error);
    throw new Error("Failed to fetch memory statistics");
  }
};

export const updateMultipleMemories = async (
  updates: { id: string; changes: Partial<NewMemoryData> }[]
): Promise<Memory[]> => {
  const promises = updates.map(({ id, changes }) => updateMemory(id, changes));
  return Promise.all(promises);
};

export const getMemoriesByCreator = async (creatorId: string, relationshipId: string): Promise<Memory[]> => {
  const memories = await MemoryRepository.findMemoriesByCreator(creatorId, relationshipId);
  if (!memories || memories.length === 0) {
    throw new Error(`Failed to fetch memories by creator`);
  }

  return Promise.all(
    memories.map(async (memory) => {
      const prismaMemory = memory as PrismaMemory;
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
        relationshipId: prismaMemory.relationshipId,
      };
    })
  );
};
