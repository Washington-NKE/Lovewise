// domains/wishlist/service.ts
import { auth } from "@/lib/auth";
import * as WishlistRepository from "./repository";

export async function createWishlistItem(data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const name = data.item || data.name;
  if (!name) throw new Error("Item name is required");

  const description = data.notes !== undefined ? data.notes : (data.description ?? null);
  const priority = data.priority || "WOULD_LOVE";
  const isSecret = data.isSecret ?? false;
  const priceEstimate = data.priceEstimate ?? null;
  const url = data.url ?? null;
  const imageUrl = data.imageUrl ?? null;
  const userId = data.userId || session.user.id;
  const relationshipId = data.relationshipId;

  return WishlistRepository.createWishlist({
    name,
    description,
    priority,
    isSecret,
    priceEstimate,
    url,
    imageUrl,
    userId,
    relationshipId,
  });
}

export async function getWishlist(userId: string, relationshipId: string) {
  // Return wishlist items belonging to the user
  return WishlistRepository.findWishlist({
    userId,
    relationshipId,
  });
}

export async function getWishlistItems(relationshipId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  // In getWishlistItems, filter secret items that don't belong to the current user
  return WishlistRepository.findWishlist({
    relationshipId,
    OR: [
      { isSecret: false },
      { userId: session.user.id },
    ],
  });
}

export async function updateWishlistItem(id: string, data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const existing = await WishlistRepository.findWishlist({ id });
  if (!existing || existing.length === 0 || existing[0].userId !== session.user.id) {
    throw new Error("Wishlist item not found");
  }

  const updateData: any = {};
  if (data.item !== undefined || data.name !== undefined) {
    updateData.name = data.item !== undefined ? data.item : data.name;
  }
  if (data.notes !== undefined) updateData.description = data.notes;
  else if (data.description !== undefined) updateData.description = data.description;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.isSecret !== undefined) updateData.isSecret = data.isSecret;
  if (data.priceEstimate !== undefined) updateData.priceEstimate = data.priceEstimate;
  if (data.url !== undefined) updateData.url = data.url;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

  return WishlistRepository.updateWishlist(id, updateData);
}

export async function deleteWishlistItem(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const existing = await WishlistRepository.findWishlist({ id });
  if (!existing || existing.length === 0 || existing[0].userId !== session.user.id) {
    throw new Error("Wishlist item not found");
  }

  return WishlistRepository.deleteWishlist(id);
}

export async function markAsGifted(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  return WishlistRepository.updateWishlist(id, { isSecret: true });
}
