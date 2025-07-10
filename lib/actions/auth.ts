// lib/actions/auth.ts
"use server";

import { auth, signIn, signOut } from "@/lib/auth";
import { hash } from "bcryptjs";
import { prisma } from "../prisma";
import {redirect} from 'next/navigation';
import { AuthError } from "next-auth";
import { cache } from "react";

export const signInWithCredentials = async (
  params: { email: string; password: string }
) => {
  try {
    const result = await signIn("credentials", {
      email: params.email,
      password: params.password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: "Invalid credentials" };
    }

    return { success: true };
  } catch (error) {
    console.error("Signin error:", error);
    
    // Handle specific NextAuth errors
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid credentials" };
        default:
          return { success: false, error: "Authentication failed" };
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Signin failed"
    };
  }
};


export const redirectToDashboard = async () => {
  redirect("/dashboard");
};


export const signUp = async (params: {
  fullName: string;
  email: string;
  password: string;
}) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: params.email }
    });

    if (existingUser) {
      return { success: false, error: "Email already in use" };
    }

    const hashedPassword = await hash(params.password, 10);

    await prisma.user.create({
      data: {
        name: params.fullName,
        email: params.email,
        password: hashedPassword
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Signup failed"
    };
  }
};

export const getSession = async () => {
  const session = await auth();
  return session;
};

export const signOutAction = async () => {
  console.log("Sign out action called");
  await signOut({ redirectTo: "/signin" });
  console.log("Sign out completed");
};

export async function createGift(formData: {
  name: string;
  description?: string;
  dateGiven: Date;
  occasion?: string;
  type: string;
  price?: number;
  isSurprise: boolean;
  recipientId: string;
  relationshipId: string;
  imageUrl?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  return prisma.gift.create({
    data: {
      ...formData,
      giverId: session.user.id,
    },
  });
}

export async function updateGift(
  id: string,
  formData: Partial<{
    name: string;
    description: string;
    dateGiven: Date;
    occasion: string;
    type: string;
    price: number;
    isFavorite: boolean;
    reaction: string;
    notes: string;
  }>
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  return prisma.gift.update({
    where: { id },
    data: formData,
  });
}

export async function deleteGift(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  return prisma.gift.delete({
    where: { id },
  });
}

export async function getGiftsForRelationship(relationshipId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  return prisma.gift.findMany({
    where: { relationshipId },
    orderBy: { dateGiven: "desc" },
    include: {
      giver: { select: { name: true, profileImage: true } },
      recipient: { select: { name: true, profileImage: true } },
    },
  });
}

export async function createWishlistItem(formData: {
  name: string;
  description?: string;
  priority: string;
  priceEstimate?: number;
  url?: string;
  relationshipId: string;
  isSecret?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  return prisma.wishlistItem.create({
    data: {
      ...formData,
      userId: session.user.id,
    },
  });
}

export async function getWishlistItems(relationshipId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  return prisma.wishlistItem.findMany({
    where: { 
      relationshipId,
      OR: [
        { isSecret: false },
        { userId: session.user.id } // Users can see their own secret items
      ]
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, profileImage: true } },
    },
  });
}

export interface Partner {
  id: string
  name: string
  email: string
  profileImage?: string | null
  lastActive?: Date | null
  isOnline?: boolean
  bio?: string | null
  phone?: string | null
  favouriteColour?: string | null
  loveLanguage?: string | null
  relationship?: {
    id: string
    status: string
    anniversaryDate?: Date | null
    createdAt: Date
  } | null
}

/**
 * Get partner information for the current user
 * This function is cached to avoid multiple database calls
 */
export const getPartnerInfo = cache(async (userId: string): Promise<Partner | null> => {
  try {
    if (!userId) {
      return null
    }

    // Find the user's active relationship
    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [
          { userId: userId, status: 'ACTIVE' },
          { partnerId: userId, status: 'ACTIVE' }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            lastActive: true,
            bio: true,
            phone: true,
            favouriteColour: true,
            loveLanguage: true,
          }
        },
        partner: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            lastActive: true,
            bio: true,
            phone: true,
            favouriteColour: true,
            loveLanguage: true,
          }
        }
      }
    })

    if (!relationship) {
      return null
    }

    // Determine which user is the partner (not the current user)
    const partner = relationship.userId === userId ? relationship.partner : relationship.user

    if (!partner) {
      return null
    }

    // Check if partner is online (last active within 5 minutes)
    const isOnline = partner.lastActive 
      ? new Date().getTime() - new Date(partner.lastActive).getTime() < 5 * 60 * 1000
      : false

    return {
      id: partner.id,
      name: partner.name,
      email: partner.email,
      profileImage: partner.profileImage,
      lastActive: partner.lastActive,
      isOnline,
      bio: partner.bio,
      phone: partner.phone,
      favouriteColour: partner.favouriteColour,
      loveLanguage: partner.loveLanguage,
      relationship: {
        id: relationship.id,
        status: relationship.status,
        anniversaryDate: relationship.anniversaryDate,
        createdAt: relationship.createdAt,
      }
    }
  } catch (error) {
    console.error('Error fetching partner info:', error)
    return null
  }
})

/**
 * Get partner information with real-time presence status
 * This version makes an additional check for more accurate online status
 */
export const getPartnerInfoWithPresence = async (userId: string): Promise<Partner | null> => {
  try {
    const partner = await getPartnerInfo(userId)
    
    if (!partner) {
      return null
    }

    // You can extend this to check a real-time presence system
    // For now, we'll use the lastActive field with a shorter timeout
    const isOnline = partner.lastActive 
      ? new Date().getTime() - new Date(partner.lastActive).getTime() < 2 * 60 * 1000 // 2 minutes
      : false

    return {
      ...partner,
      isOnline
    }
  } catch (error) {
    console.error('Error fetching partner info with presence:', error)
    return null
  }
}

/**
 * Update user's last active timestamp
 * Call this when user performs actions to maintain presence
 */
export const updateUserPresence = async (userId: string): Promise<void> => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastActive: new Date() }
    })
  } catch (error) {
    console.error('Error updating user presence:', error)
  }
}

/**
 * Get all users in relationships with their partner info
 * Useful for admin or analytics purposes
 */
export const getUsersWithPartners = async (): Promise<{
  user: Partner,
  partner: Partner | null
}[]> => {
  try {
    const relationships = await prisma.relationship.findMany({
      where: { status: 'ACTIVE' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            lastActive: true,
            bio: true,
            phone: true,
            favouriteColour: true,
            loveLanguage: true,
          }
        },
        partner: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            lastActive: true,
            bio: true,
            phone: true,
            favouriteColour: true,
            loveLanguage: true,
          }
        }
      }
    })

    return relationships.map(rel => ({
      user: {
        id: rel.user.id,
        name: rel.user.name,
        email: rel.user.email,
        profileImage: rel.user.profileImage,
        lastActive: rel.user.lastActive,
        isOnline: rel.user.lastActive 
          ? new Date().getTime() - new Date(rel.user.lastActive).getTime() < 5 * 60 * 1000
          : false,
        bio: rel.user.bio,
        phone: rel.user.phone,
        favouriteColour: rel.user.favouriteColour,
        loveLanguage: rel.user.loveLanguage,
        relationship: {
          id: rel.id,
          status: rel.status,
          anniversaryDate: rel.anniversaryDate,
          createdAt: rel.createdAt,
        }
      },
      partner: {
        id: rel.partner.id,
        name: rel.partner.name,
        email: rel.partner.email,
        profileImage: rel.partner.profileImage,
        lastActive: rel.partner.lastActive,
        isOnline: rel.partner.lastActive 
          ? new Date().getTime() - new Date(rel.partner.lastActive).getTime() < 5 * 60 * 1000
          : false,
        bio: rel.partner.bio,
        phone: rel.partner.phone,
        favouriteColour: rel.partner.favouriteColour,
        loveLanguage: rel.partner.loveLanguage,
        relationship: {
          id: rel.id,
          status: rel.status,
          anniversaryDate: rel.anniversaryDate,
          createdAt: rel.createdAt,
        }
      }
    }))
  } catch (error) {
    console.error('Error fetching users with partners:', error)
    return []
  }
}