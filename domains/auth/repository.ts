// domains/auth/repository.ts
import { prisma } from "@/lib/prisma";

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
    },
  });
}

export async function createUser(data: { name: string; email: string; passwordHash: string }) {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.passwordHash,
    },
  });
}
