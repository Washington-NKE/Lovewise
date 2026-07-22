// app/api/wishlist/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as WishlistService from "@/domains/wishlist/service";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const wishlistItem = await WishlistService.updateWishlistItem(id, body);
    return NextResponse.json(wishlistItem);
  } catch (error: any) {
    console.error("Error updating wishlist item:", error);
    const status =
      error.message === "Not authenticated"
        ? 401
        : error.message === "Wishlist item not found"
        ? 404
        : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await WishlistService.deleteWishlistItem(id);
    return NextResponse.json({ message: "Wishlist item deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting wishlist item:", error);
    const status =
      error.message === "Not authenticated"
        ? 401
        : error.message === "Wishlist item not found"
        ? 404
        : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status });
  }
}