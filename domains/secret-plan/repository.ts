// domains/secret-plan/repository.ts
import { prisma } from "@/lib/prisma";

export async function createPlan(data: {
  title: string;
  description?: string | null;
  progress?: number;
  budget?: number | null;
  targetDate?: Date | null;
  userId: string;
}) {
  return prisma.secretPlan.create({
    data,
    include: {
      user: { select: { id: true, name: true, email: true, profileImage: true } },
      items: true,
    },
  });
}

export async function findPlans(conditions: any) {
  return prisma.secretPlan.findMany({
    where: conditions,
    include: {
      user: { select: { id: true, name: true, email: true, profileImage: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updatePlan(id: string, data: any) {
  return prisma.secretPlan.update({
    where: { id },
    data,
    include: {
      user: { select: { id: true, name: true, email: true, profileImage: true } },
      items: true,
    },
  });
}

export async function deletePlan(id: string) {
  return prisma.secretPlan.delete({
    where: { id },
  });
}

export async function createPlanItem(data: {
  item: string;
  completed?: boolean;
  cost?: number | null;
  notes?: string | null;
  secretPlanId: string;
  planId: string;
}) {
  return prisma.secretPlanItem.create({
    data,
  });
}

export async function updatePlanItem(id: string, data: any) {
  return prisma.secretPlanItem.update({
    where: { id },
    data,
  });
}

export async function deletePlanItem(id: string) {
  return prisma.secretPlanItem.delete({
    where: { id },
  });
}

export async function findPlanItems(conditions: any) {
  return prisma.secretPlanItem.findMany({
    where: conditions,
    include: {
      plan: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function findPlanItemById(id: string) {
  return prisma.secretPlanItem.findUnique({
    where: { id },
    include: {
      plan: {
        select: {
          userId: true,
        },
      },
    },
  });
}
