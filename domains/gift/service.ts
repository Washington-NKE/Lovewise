// domains/gift/service.ts
import { auth } from "@/lib/auth";
import * as GiftRepository from "./repository";

export async function createGift(data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const name = data.giftName || data.name;
  if (!name) throw new Error("Gift name is required");

  const description = data.description ?? null;
  const dateGiven = data.date || data.dateGiven || new Date();
  const occasion = data.occasion ?? null;
  const reaction = data.reaction ?? null;
  const imageUrl = data.image || data.imageUrl || null;
  const giverId = data.giverId || session.user.id;
  const recipientId = data.recipientId;
  const relationshipId = data.relationshipId;
  const type = data.type || "PHYSICAL";
  const status = data.status || "GIVEN";
  const price = data.price ?? null;
  const isSurprise = data.isSurprise ?? false;

  return GiftRepository.createGift({
    name,
    description,
    dateGiven: new Date(dateGiven),
    occasion,
    type,
    status,
    price,
    isSurprise,
    giverId,
    recipientId,
    relationshipId,
    reaction,
    imageUrl,
  });
}

export async function updateGift(id: string, data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const existingGift = await GiftRepository.findGiftById(id);
  if (!existingGift) throw new Error("Gift not found");

  if (existingGift.giverId !== session.user.id && existingGift.recipientId !== session.user.id) {
    throw new Error("Forbidden");
  }

  const updateData: any = {};
  if (data.giftName !== undefined || data.name !== undefined) {
    updateData.name = data.giftName !== undefined ? data.giftName : data.name;
  }
  if (data.date || data.dateGiven) updateData.dateGiven = new Date(data.date || data.dateGiven);
  if (data.occasion !== undefined) updateData.occasion = data.occasion;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.reaction !== undefined) updateData.reaction = data.reaction;
  if (data.image || data.imageUrl) updateData.imageUrl = data.image || data.imageUrl;
  if (data.isFavorite !== undefined) updateData.isFavorite = data.isFavorite;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.status !== undefined) updateData.status = data.status;

  return GiftRepository.updateGift(id, updateData);
}

export async function deleteGift(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const existingGift = await GiftRepository.findGiftById(id);
  if (!existingGift) throw new Error("Gift not found");

  if (existingGift.giverId !== session.user.id && existingGift.recipientId !== session.user.id) {
    throw new Error("Forbidden");
  }

  return GiftRepository.deleteGift(id);
}

export async function getGiftHistory(userId: string) {
  return GiftRepository.findGiftsByUserId(userId);
}

export async function getFavoriteGifts(userId: string) {
  return GiftRepository.findFavoriteGiftsByUserId(userId);
}

export async function getGiftsForRelationship(relationshipId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  return GiftRepository.findGiftsByRelationshipId(relationshipId);
}

export async function getGiftStats(userId: string) {
  const [totalGifts, totalGiven, totalReceived, favoriteCount] = await Promise.all([
    GiftRepository.countGifts({
      OR: [{ giverId: userId }, { recipientId: userId }],
    }),
    GiftRepository.countGifts({ giverId: userId }),
    GiftRepository.countGifts({ recipientId: userId }),
    GiftRepository.countGifts({
      isFavorite: true,
      OR: [{ giverId: userId }, { recipientId: userId }],
    }),
  ]);

  return {
    totalGifts,
    totalGiven,
    totalReceived,
    favoriteCount,
  };
}
