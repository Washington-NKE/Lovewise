// domains/presence/service.ts
import { auth } from "@/lib/auth";
import { serverCache } from "@/lib/server-cache";
import * as PresenceRepository from "./repository";

export async function getUserPresenceStatus(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const cacheKey = `presence:status:${targetUserId}`;
  const cached = serverCache.get<any>(cacheKey);
  if (cached) return cached;

  const user = await PresenceRepository.findUserPresence(targetUserId);
  if (!user) throw new Error("User not found");

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const isOnline = user.lastActive ? user.lastActive > fiveMinutesAgo : false;

  const payload = {
    userId: user.id,
    name: user.name,
    profileImage: user.profileImage,
    isOnline,
    lastSeen: user.lastActive,
  };

  serverCache.set(cacheKey, payload, 5000);
  return payload;
}

export async function updateUserPresence() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await PresenceRepository.updateUserPresence(session.user.id, new Date());
  return { success: true, lastActive: user.lastActive };
}

export async function setUserOffline() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Setting last active to 10 minutes ago to make them immediately show offline
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  await PresenceRepository.updateUserPresence(session.user.id, tenMinutesAgo);
  return { success: true };
}

export async function getUsersPresenceBulk(userIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const users = await PresenceRepository.findUsersPresenceBulk(userIds);
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  return users.map((user) => ({
    userId: user.id,
    name: user.name,
    profileImage: user.profileImage,
    isOnline: user.lastActive ? user.lastActive > fiveMinutesAgo : false,
    lastSeen: user.lastActive,
  }));
}
