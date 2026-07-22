// domains/relationship/service.ts
import { auth } from "@/lib/auth";
import { cache } from "react";
import * as RelationshipRepository from "./repository";

export interface Partner {
  id: string;
  name: string | null;
  email: string;
  profileImage?: string | null;
  lastActive?: Date | null;
  isOnline?: boolean;
  bio?: string | null;
  phone?: string | null;
  favouriteColour?: string | null;
  loveLanguage?: string | null;
  relationship?: {
    id: string;
    status: string;
    anniversaryDate?: Date | null;
    createdAt: Date;
  } | null;
}

export async function getRelationshipId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const relationship = await RelationshipRepository.findActiveRelationshipByUserId(session.user.id);
  return relationship ? relationship.id : null;
}

export async function getCurrentUserRelationshipDetails() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const rel = await RelationshipRepository.findActiveRelationshipWithDetails(session.user.id);
  if (!rel) return null;

  return {
    ...rel,
    user: rel.user ? { ...rel.user, profileImage: rel.user.profileImage ?? undefined } : undefined,
    partner: rel.partner ? { ...rel.partner, profileImage: rel.partner.profileImage ?? undefined } : undefined,
  };
}

export async function getCurrentUserRelationships() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const relationships = await RelationshipRepository.findAllRelationshipsForUser(session.user.id);
  return relationships.map((rel) => ({
    id: rel.id,
    status: rel.status,
    createdAt: rel.createdAt,
    partner: rel.userId === session.user.id ? rel.partner : rel.user,
  }));
}

export const getPartnerInfo = cache(async (userId: string): Promise<Partner | null> => {
  try {
    if (!userId) return null;

    const rel = await RelationshipRepository.findActiveRelationshipWithDetails(userId);
    if (!rel) return null;

    const partner = rel.userId === userId ? rel.partner : rel.user;
    if (!partner) return null;

    const isOnline = partner.lastActive
      ? new Date().getTime() - new Date(partner.lastActive).getTime() < 5 * 60 * 1000
      : false;

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
        id: rel.id,
        status: rel.status,
        anniversaryDate: rel.anniversaryDate,
        createdAt: rel.createdAt,
      },
    };
  } catch (error) {
    console.error("Error fetching partner info:", error);
    return null;
  }
});

export const getPartnerInfoWithPresence = async (userId: string): Promise<Partner | null> => {
  try {
    const partner = await getPartnerInfo(userId);
    if (!partner) return null;

    const isOnline = partner.lastActive
      ? new Date().getTime() - new Date(partner.lastActive).getTime() < 2 * 60 * 1000
      : false;

    return {
      ...partner,
      isOnline,
    };
  } catch (error) {
    console.error("Error fetching partner info with presence:", error);
    return null;
  }
};

export const getUsersWithPartners = async (): Promise<Array<{ user: Partner; partner: Partner | null }>> => {
  try {
    const activeRels = await RelationshipRepository.findActiveRelationshipsWithPartners();

    return activeRels.map((rel) => {
      const isUserOnline = rel.user.lastActive
        ? new Date().getTime() - new Date(rel.user.lastActive).getTime() < 5 * 60 * 1000
        : false;

      const isPartnerOnline = rel.partner.lastActive
        ? new Date().getTime() - new Date(rel.partner.lastActive).getTime() < 5 * 60 * 1000
        : false;

      return {
        user: {
          id: rel.user.id,
          name: rel.user.name,
          email: rel.user.email,
          profileImage: rel.user.profileImage,
          lastActive: rel.user.lastActive,
          isOnline: isUserOnline,
          bio: rel.user.bio,
          phone: rel.user.phone,
          favouriteColour: rel.user.favouriteColour,
          loveLanguage: rel.user.loveLanguage,
          relationship: {
            id: rel.id,
            status: rel.status,
            anniversaryDate: rel.anniversaryDate,
            createdAt: rel.createdAt,
          },
        },
        partner: {
          id: rel.partner.id,
          name: rel.partner.name,
          email: rel.partner.email,
          profileImage: rel.partner.profileImage,
          lastActive: rel.partner.lastActive,
          isOnline: isPartnerOnline,
          bio: rel.partner.bio,
          phone: rel.partner.phone,
          favouriteColour: rel.partner.favouriteColour,
          loveLanguage: rel.partner.loveLanguage,
          relationship: {
            id: rel.id,
            status: rel.status,
            anniversaryDate: rel.anniversaryDate,
            createdAt: rel.createdAt,
          },
        },
      };
    });
  } catch (error) {
    console.error("Error fetching users with partners:", error);
    return [];
  }
};

export async function invitePartner(params: { email?: string; userId?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { serverCache } = await import("@/lib/server-cache");
  const UserRepository = await import("../user/repository");

  const inviterId = session.user.id;

  const targetUser = params.userId
    ? await UserRepository.findUserById(params.userId)
    : params.email
    ? await UserRepository.findUserByEmail(params.email.trim().toLowerCase())
    : null;

  if (!targetUser) throw new Error("User not found");
  if (targetUser.id === inviterId) throw new Error("Cannot invite yourself");

  const inviterActive = await RelationshipRepository.findActiveRelationshipByUserId(inviterId);
  if (inviterActive) throw new Error("You already have an active partner. Disconnect first.");

  const targetActive = await RelationshipRepository.findActiveRelationshipByUserId(targetUser.id);
  if (targetActive) throw new Error("This user already has an active partner.");

  const existing = await prismaFindRelationshipBetweenUsers(inviterId, targetUser.id);
  if (existing) {
    if (existing.status === "ACTIVE") throw new Error("You are already connected with this user");
    if (existing.status === "PENDING") throw new Error("Invitation already pending");
  }

  const invitation = await RelationshipRepository.createRelationship({
    userId: inviterId,
    partnerId: targetUser.id,
    status: "PENDING",
  });

  serverCache.delete(`invites:${inviterId}`);
  serverCache.delete(`invites:${targetUser.id}`);

  return invitation;
}

export async function getInvitations() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { serverCache } = await import("@/lib/server-cache");
  const cacheKey = `invites:${session.user.id}`;
  const cached = serverCache.get<{ incoming: any[]; outgoing: any[] }>(cacheKey);
  if (cached) return cached;

  const incoming = await RelationshipRepository.findIncomingInvitations(session.user.id);
  const outgoing = await RelationshipRepository.findOutgoingInvitations(session.user.id);

  const payload = { incoming, outgoing };
  serverCache.set(cacheKey, payload, 5000);
  return payload;
}

export async function acceptInvitation(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { serverCache } = await import("@/lib/server-cache");

  const relationship = await RelationshipRepository.findRelationshipById(id);
  if (!relationship) throw new Error("Invitation not found");
  if (relationship.status !== "PENDING") throw new Error("Invitation is no longer valid");
  if (relationship.partnerId !== session.user.id) throw new Error("Unauthorized");

  await RelationshipRepository.updateRelationship(id, {
    status: "ACTIVE",
    anniversaryDate: new Date(),
  });

  serverCache.delete(`invites:${session.user.id}`);
  serverCache.delete(`invites:${relationship.userId}`);

  return { message: "Invitation accepted" };
}

export async function declineInvitation(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { serverCache } = await import("@/lib/server-cache");

  const relationship = await RelationshipRepository.findRelationshipById(id);
  if (!relationship) throw new Error("Invitation not found");
  if (relationship.status !== "PENDING") throw new Error("Invitation is no longer valid");
  if (relationship.partnerId !== session.user.id) throw new Error("Unauthorized");

  await RelationshipRepository.deleteRelationship(id);

  serverCache.delete(`invites:${session.user.id}`);
  serverCache.delete(`invites:${relationship.userId}`);

  return { message: "Invitation declined" };
}

export async function disconnectPartner() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const activeRelationship = await RelationshipRepository.findActiveRelationshipByUserId(session.user.id);
  if (!activeRelationship) throw new Error("No active relationship found");

  const partnerId =
    activeRelationship.userId === session.user.id
      ? activeRelationship.partnerId
      : activeRelationship.userId;

  await RelationshipRepository.disconnectRelationship(activeRelationship.id, session.user.id, partnerId);

  return { message: "Partner disconnected and relationship ended successfully" };
}

async function prismaFindRelationshipBetweenUsers(u1: string, u2: string) {
  const { prisma } = await import("@/lib/prisma");
  return prisma.relationship.findFirst({
    where: {
      OR: [
        { userId: u1, partnerId: u2 },
        { userId: u2, partnerId: u1 },
      ],
    },
  });
}
