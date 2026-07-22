'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { hash } from 'bcryptjs';
import { revalidatePath } from 'next/cache';

// Helper to assert admin privilege
async function assertAdmin() {
  const session = await auth();
  if (!session || !session.user?.email) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
  return session;
}

// ---------------- USER MANAGEMENT ----------------

export async function getAdminUsers() {
  await assertAdmin();
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      needsPasswordChange: true,
      createdAt: true,
      lastActive: true,
    },
  });
}

export async function createAdminUser(data: { name: string; email: string; role: string }) {
  await assertAdmin();
  const normalizedEmail = data.email.trim().toLowerCase();

  // Basic validation
  if (!normalizedEmail || !data.name) {
    return { success: false, error: 'Name and Email are required.' };
  }

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    return { success: false, error: 'A user with this email already exists.' };
  }

  // Default password is Passw0rd@1
  const defaultPassword = 'Passw0rd@1';
  const hashedPassword = await hash(defaultPassword, 10);

  const newUser = await prisma.user.create({
    data: {
      name: data.name.trim(),
      email: normalizedEmail,
      role: data.role,
      password: hashedPassword,
      needsPasswordChange: true, // User must change password on first login
    },
  });

  revalidatePath('/admin');
  return { success: true, user: newUser };
}

export async function resetUserPassword(userId: string) {
  await assertAdmin();

  const defaultPassword = 'Passw0rd@1';
  const hashedPassword = await hash(defaultPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      needsPasswordChange: true,
    },
  });

  return { success: true };
}

export async function deleteUser(userId: string) {
  await assertAdmin();

  // Prevent admin from deleting themselves
  const session = await auth();
  const currentUser = await prisma.user.findUnique({
    where: { email: session?.user?.email || '' },
  });

  if (currentUser?.id === userId) {
    return { success: false, error: 'You cannot delete your own admin account.' };
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath('/admin');
  return { success: true };
}

// ---------------- PAGE SECURITY MANAGEMENT ----------------

export async function getPageSecurities() {
  await assertAdmin();
  return prisma.pageSecurity.findMany({
    orderBy: { pagePath: 'asc' },
  });
}

export async function savePageSecurity(data: {
  pagePath: string;
  type: 'pin' | 'password';
  value: string;
}) {
  await assertAdmin();

  const path = '/' + data.pagePath.trim().replace(/^\/+|\/+$/g, ''); // Normalize: "/washington/hello-my-love-sarah"

  if (!path.startsWith('/washington')) {
    return { success: false, error: 'Path must start with /washington' };
  }

  if (data.type === 'pin') {
    if (!/^\d{4}$/.test(data.value)) {
      return { success: false, error: 'PIN must be exactly 4 digits.' };
    }
  } else {
    if (data.value.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }
  }

  const existing = await prisma.pageSecurity.findUnique({
    where: { pagePath: path },
  });

  const updateData = {
    pin: data.type === 'pin' ? data.value : null,
    password: data.type === 'password' ? data.value : null,
    isActive: true,
  };

  if (existing) {
    await prisma.pageSecurity.update({
      where: { pagePath: path },
      data: updateData,
    });
  } else {
    await prisma.pageSecurity.create({
      data: {
        pagePath: path,
        ...updateData,
      },
    });
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function removePageSecurity(pageSecurityId: string) {
  await assertAdmin();
  await prisma.pageSecurity.delete({
    where: { id: pageSecurityId },
  });
  revalidatePath('/admin');
  return { success: true };
}

// ---------------- SYSTEM METRICS ----------------

export async function getSystemMetrics() {
  await assertAdmin();

  const [usersCount, relationshipsCount, messagesCount, memoriesCount, giftsCount, securePagesCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.relationship.count(),
      prisma.message.count(),
      prisma.memory.count(),
      prisma.gift.count(),
      prisma.pageSecurity.count(),
    ]);

  return {
    users: usersCount,
    relationships: relationshipsCount,
    messages: messagesCount,
    memories: memoriesCount,
    gifts: giftsCount,
    securePages: securePagesCount,
  };
}

// ---------------- PUBLIC PAGE VERIFICATION ----------------

export async function checkPageSecurity(pagePath: string) {
  const security = await prisma.pageSecurity.findUnique({
    where: { pagePath },
  });

  if (!security || !security.isActive) {
    return { locked: false };
  }

  return {
    locked: true,
    type: security.pin ? 'pin' : 'password',
  };
}

export async function verifyPagePasscode(pagePath: string, code: string) {
  const security = await prisma.pageSecurity.findUnique({
    where: { pagePath },
  });

  if (!security || !security.isActive) {
    return { success: true }; // No security active
  }

  if (security.pin) {
    return { success: security.pin === code };
  }

  if (security.password) {
    return { success: security.password === code };
  }

  return { success: false };
}
