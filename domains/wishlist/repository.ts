// domains/wishlist/repository.ts
import { prisma } from "@/lib/prisma";

export async function createWishlist(data: {
  name: string;
  description?: string | null;
  priority?: "MUST_HAVE" | "WOULD_LOVE" | "NICE_TO_HAVE";
  isSecret?: boolean;
  priceEstimate?: number | null;
  url?: string | null;
  imageUrl?: string | null;
  userId: string;
  relationshipId: string;
}) {
  return prisma.wishlistItem.create({
    data,
    include: {
      user: { select: { id: true, name: true, email: true, profileImage: true } },
    },
  });
}

export async function findWishlist(conditions: any) {
  return prisma.wishlistItem.findMany({
    where: conditions,
    include: {
      user: { select: { id: true, name: true, email: true, profileImage: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateWishlist(id: string, data: any) {
  return prisma.wishlistItem.update({
    where: { id },
    data,
    include: {
      user: { select: { id: true, name: true, email: true, profileImage: true } },
    },
  });
}

export async function deleteWishlist(id: string) {
  return prisma.wishlistItem.delete({
    where: { id },
  });
}
