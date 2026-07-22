// domains/relationship/repository.ts
import { prisma } from "@/lib/prisma";

export async function findActiveRelationshipByUserId(userId: string) {
  return prisma.relationship.findFirst({
    where: {
      OR: [
        { userId: userId, status: "ACTIVE" },
        { partnerId: userId, status: "ACTIVE" },
      ],
    },
  });
}

export async function findActiveRelationshipWithDetails(userId: string) {
  return prisma.relationship.findFirst({
    where: {
      OR: [
        { userId: userId, status: "ACTIVE" },
        { partnerId: userId, status: "ACTIVE" },
      ],
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
        },
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
        },
      },
    },
  });
}

export async function findAllRelationshipsForUser(userId: string) {
  return prisma.relationship.findMany({
    where: {
      OR: [{ userId }, { partnerId }],
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      partner: { select: { id: true, name: true, email: true } },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function findActiveRelationshipsWithPartners() {
  return prisma.relationship.findMany({
    where: { status: "ACTIVE" },
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
        },
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
        },
      },
    },
  });
}

export async function findRelationshipById(id: string) {
  return prisma.relationship.findUnique({
    where: { id },
  });
}

export async function updateRelationship(id: string, data: any) {
  return prisma.relationship.update({
    where: { id },
    data,
  });
}

export async function deleteRelationship(id: string) {
  return prisma.relationship.delete({
    where: { id },
  });
}

export async function createRelationship(data: { userId: string; partnerId: string; status: "PENDING" | "ACTIVE" | "ENDED" }) {
  return prisma.relationship.create({
    data,
    include: {
      user: {
        select: { id: true, name: true, email: true, profileImage: true },
      },
      partner: {
        select: { id: true, name: true, email: true, profileImage: true },
      },
    },
  });
}

export async function findIncomingInvitations(userId: string) {
  return prisma.relationship.findMany({
    where: { status: "PENDING", partnerId: userId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function findOutgoingInvitations(userId: string) {
  return prisma.relationship.findMany({
    where: { status: "PENDING", userId },
    include: {
      partner: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function disconnectRelationship(id: string, userId: string, partnerId: string) {
  return prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { lovePactId: null },
    }),
    prisma.user.update({
      where: { id: partnerId },
      data: { lovePactId: null },
    }),
    prisma.relationship.update({
      where: { id },
      data: { status: "ENDED" },
    }),
  ]);
}
