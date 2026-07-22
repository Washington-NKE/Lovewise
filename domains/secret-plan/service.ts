// domains/secret-plan/service.ts
import { auth } from "@/lib/auth";
import * as SecretPlanRepository from "./repository";

export async function createSecretPlan(data: {
  title: string;
  description?: string;
  progress?: number;
  budget?: number;
  targetDate?: Date;
  userId: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const targetDate = data.targetDate ? new Date(data.targetDate) : undefined;

  return SecretPlanRepository.createPlan({
    title: data.title,
    description: data.description,
    progress: data.progress,
    budget: data.budget,
    targetDate,
    userId: data.userId,
  });
}

export async function getSecretPlans(userId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  return SecretPlanRepository.findPlans({ userId });
}

export async function updateSecretPlan(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    progress: number;
    budget: number;
    targetDate: Date;
  }>
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const plans = await SecretPlanRepository.findPlans({ id });
  if (!plans || plans.length === 0 || plans[0].userId !== session.user.id) {
    throw new Error("Secret plan not found");
  }

  const updateData: any = { ...data };
  if (data.targetDate) updateData.targetDate = new Date(data.targetDate);

  return SecretPlanRepository.updatePlan(id, updateData);
}

export async function deleteSecretPlan(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const plans = await SecretPlanRepository.findPlans({ id });
  if (!plans || plans.length === 0 || plans[0].userId !== session.user.id) {
    throw new Error("Secret plan not found");
  }

  // Deleting items first is handled by CASCADE in prisma schema, but let's be safe
  return SecretPlanRepository.deletePlan(id);
}

export async function getSecretPlanItems() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  return SecretPlanRepository.findPlanItems({
    plan: {
      userId: session.user.id,
    },
  });
}

export async function createSecretPlanItem(data: {
  item: string;
  completed?: boolean;
  cost?: number;
  notes?: string;
  planId: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const plans = await SecretPlanRepository.findPlans({ id: data.planId });
  if (!plans || plans.length === 0 || plans[0].userId !== session.user.id) {
    throw new Error("Secret plan not found");
  }

  return SecretPlanRepository.createPlanItem({
    item: data.item,
    completed: data.completed,
    cost: data.cost,
    notes: data.notes,
    secretPlanId: data.planId,
    planId: data.planId,
  });
}

export async function updateSecretPlanItem(
  id: string,
  data: Partial<{
    item: string;
    completed: boolean;
    cost: number;
    notes: string;
  }>
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const item = await SecretPlanRepository.findPlanItemById(id);
  if (!item || item.plan.userId !== session.user.id) {
    throw new Error("Secret plan item not found");
  }

  const updateData: any = {};
  if (data.item !== undefined) updateData.item = data.item;
  if (data.completed !== undefined) updateData.completed = data.completed;
  if (data.cost !== undefined) updateData.cost = data.cost;
  if (data.notes !== undefined) updateData.notes = data.notes;

  return SecretPlanRepository.updatePlanItem(id, updateData);
}

export async function deleteSecretPlanItem(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const item = await SecretPlanRepository.findPlanItemById(id);
  if (!item || item.plan.userId !== session.user.id) {
    throw new Error("Secret plan item not found");
  }

  return SecretPlanRepository.deletePlanItem(id);
}
