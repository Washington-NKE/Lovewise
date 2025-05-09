"use server";

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { signIn } from "@/auth";


export const signInWithCredentials = async (
  params: Pick<AuthCredentials, "email" | "password">,
) => {
  const { email, password } = params;

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.log(error, "Signin error");
    return { success: false, error: "Signin error" };
  }
};

export const signUp = async (params: AuthCredentials) => {
  const { fullName, email, password } = params;

  // Check for existing user
  const existingUserByEmail = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUserByEmail) {
    return { success: false, error: "User with this email already exists" };
  }

  const hashedPassword = await hash(password, 10);

  try {
    // Create user with Prisma
    await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
      }
    });

    // Sign in after successful signup
    await signInWithCredentials({ email, password });

    return { success: true };
  } catch (error) {
    console.log(error, "Signup error");
    return { success: false, error: "Signup error" };
  }
};