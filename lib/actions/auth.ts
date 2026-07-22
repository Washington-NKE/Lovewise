// lib/actions/auth.ts
"use server";

import * as AuthService from "@/domains/auth/service";
import * as GiftService from "@/domains/gift/service";
import * as WishlistService from "@/domains/wishlist/service";
import * as RelationshipService from "@/domains/relationship/service";
import * as UserService from "@/domains/user/service";

export type { Partner } from "@/domains/relationship/service";

// Auth
export async function signInWithCredentials(data: any) {
  return AuthService.signInWithCredentials(data);
}

export async function redirectToDashboard() {
  return AuthService.redirectToDashboard();
}

export async function signUp(data: any) {
  return AuthService.signUp(data);
}

export async function getSession() {
  return AuthService.getSession();
}

export async function signOutAction() {
  return AuthService.signOutAction();
}

// Gift
export async function createGift(data: any) {
  return GiftService.createGift(data);
}

export async function updateGift(id: string, data: any) {
  return GiftService.updateGift(id, data);
}

export async function deleteGift(id: string) {
  return GiftService.deleteGift(id);
}

export async function getGiftsForRelationship(relationshipId: string) {
  return GiftService.getGiftsForRelationship(relationshipId);
}

// Wishlist
export async function createWishlistItem(data: any) {
  return WishlistService.createWishlistItem(data);
}

export async function getWishlistItems(relationshipId: string) {
  return WishlistService.getWishlistItems(relationshipId);
}

// Relationship
export async function getPartnerInfo(userId: string) {
  return RelationshipService.getPartnerInfo(userId);
}

export async function getPartnerInfoWithPresence(userId: string) {
  return RelationshipService.getPartnerInfoWithPresence(userId);
}

export async function getUsersWithPartners() {
  return RelationshipService.getUsersWithPartners();
}

// User
export async function updateUserPresence(userId: string) {
  return UserService.updateUserPresence(userId);
}

// Password change action
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hash } from "bcryptjs";

export async function changeCurrentUserPassword(password: string) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return { success: false, error: "Unauthorized" };
  }

  // Password validations
  if (password.length < 8) return { success: false, error: "Password must be at least 8 characters long." };
  if (!/[A-Z]/.test(password)) return { success: false, error: "Password must contain at least one uppercase letter." };
  if (!/[a-z]/.test(password)) return { success: false, error: "Password must contain at least one lowercase letter." };
  if (!/[0-9]/.test(password)) return { success: false, error: "Password must contain at least one number." };
  if (!/[^A-Za-z0-9]/.test(password)) return { success: false, error: "Password must contain at least one special character." };
  if (password === "Passw0rd@1") return { success: false, error: "You cannot use the default password." };

  const hashedPassword = await hash(password, 10);

  await prisma.user.update({
    where: { email: session.user.email },
    data: {
      password: hashedPassword,
      needsPasswordChange: false,
    },
  });

  return { success: true };
}