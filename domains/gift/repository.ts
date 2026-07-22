// domains/gift/repository.ts
import { prisma } from "@/lib/prisma";

export async function createGift(data: {
  name: string;
  description?: string | null;
  dateGiven?: Date | null;
  occasion?: string | null;
  type?: "PHYSICAL" | "EXPERIENCE" | "DIGITAL" | "FINANCIAL" | "DIY";
  status?: "PLANNED" | "PURCHASED" | "GIVEN" | "RETURNED";
  price?: number | null;
  isSurprise?: boolean;
  surpriseLevel?: number | null;
  imageUrl?: string | null;
  giverId: string;
  recipientId: string;
  relationshipId: string;
  reaction?: string | null;
  notes?: string | null;
}) {
  return prisma.gift.create({
    data,
    include: {
      giver: { select: { id: true, name: true, email: true, profileImage: true } },
      recipient: { select: { id: true, name: true, email: true, profileImage: true } },
    },
  });
}

export async function findGiftById(id: string) {
  return prisma.gift.findUnique({
    where: { id },
  });
}

export async function updateGift(id: string, data: any) {
  return prisma.gift.update({
    where: { id },
    data,
    include: {
      giver: { select: { id: true, name: true, email: true, profileImage: true } },
      recipient: { select: { id: true, name: true, email: true, profileImage: true } },
    },
  });
}

export async function deleteGift(id: string) {
  return prisma.gift.delete({
    where: { id },
  });
}

export async function findGiftsByUserId(userId: string) {
  return prisma.gift.findMany({
    where: {
      OR: [{ giverId: userId }, { recipientId: userId }],
    },
    include: {
      giver: { select: { id: true, name: true, email: true } },
      recipient: { select: { id: true, name: true, email: true } },
    },
    orderBy: { dateGiven: "desc" },
  });
}

export async function findFavoriteGiftsByUserId(userId: string) {
  return prisma.gift.findMany({
    where: {
      isFavorite: true,
      OR: [{ giverId: userId }, { recipientId: userId }],
    },
    include: {
      giver: { select: { id: true, name: true, email: true } },
      recipient: { select: { id: true, name: true, email: true } },
    },
    orderBy: { dateGiven: "desc" },
  });
}

export async function findGiftsByRelationshipId(relationshipId: string) {
  return prisma.gift.findMany({
    where: { relationshipId },
    orderBy: { dateGiven: "desc" },
    include: {
      giver: { select: { name: true, profileImage: true } },
      recipient: { select: { name: true, profileImage: true } },
    },
  });
}

export async function countGifts(conditions: any) {
  return prisma.gift.count({
    where: conditions,
  });
}
