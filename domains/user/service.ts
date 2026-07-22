// domains/user/service.ts
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import * as UserRepository from "./repository";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const user = await UserRepository.findUserById(session.user.id);
  if (!user) throw new Error("User not found");

  return user;
}

export async function getUserProfile(userId: string) {
  const user = await UserRepository.findUserById(userId);
  if (!user) throw new Error("User not found");
  return user;
}

export async function getUser(id: string) {
  return UserRepository.getUserWithDetails(id);
}

export async function getUserByEmail(email: string) {
  return UserRepository.findUserByEmail(email);
}

export async function createUser(data: { email: string; name?: string }) {
  return UserRepository.createUser(data);
}

export async function updateUserProfile(params: { name?: string; email?: string; bio?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  if (params.email && params.email !== session.user.email) {
    const existing = await UserRepository.findUserByEmail(params.email);
    if (existing) throw new Error("Email already in use");
  }

  return UserRepository.updateUser(session.user.id, {
    name: params.name,
    email: params.email,
    bio: params.bio,
  });
}

export async function updateNotificationPreferences(preferences: {
  email: boolean;
  push: boolean;
  reminders: boolean;
  partnerActivity: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  return UserRepository.updateUser(session.user.id, {
    emailNotifications: preferences.email,
    pushNotifications: preferences.push,
    eventReminders: preferences.reminders,
    partnerActivityNotifications: preferences.partnerActivity,
  });
}

export async function updatePassword(params: { currentPassword?: string; newPassword?: string }) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Not authenticated");

  if (!params.currentPassword || !params.newPassword) {
    throw new Error("Current and new passwords are required");
  }

  if (params.newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters");
  }

  const user = await UserRepository.findUserByEmail(session.user.email);
  if (!user || !user.password) throw new Error("User not found or no password set");

  const isValid = await bcrypt.compare(params.currentPassword, user.password);
  if (!isValid) throw new Error("Current password is incorrect");

  const hashedPassword = await bcrypt.hash(params.newPassword, 12);
  return UserRepository.updateUser(user.id, { password: hashedPassword });
}

export const updateUserPresence = async (userId: string): Promise<void> => {
  try {
    await UserRepository.updateUser(userId, { lastActive: new Date() });
  } catch (error) {
    console.error("Error updating user presence:", error);
  }
};

export async function searchUsers(query: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  return UserRepository.searchUsers(query, session.user.id);
}
