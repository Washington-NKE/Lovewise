// domains/auth/service.ts
import { auth, signIn, signOut } from "@/lib/auth";
import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import * as AuthRepository from "./repository";

export const signInWithCredentials = async (
  params: { email: string; password: string }
) => {
  const normalizedEmail = params.email.trim().toLowerCase();

  try {
    const result = await signIn("credentials", {
      email: normalizedEmail,
      password: params.password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: "Invalid credentials" };
    }

    return { success: true };
  } catch (error) {
    console.error("Signin error:", error);
    
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin": {
          const existingUser = await AuthRepository.findUserByEmail(normalizedEmail);

          if (!existingUser) {
            return { success: false, error: "No account found for this email. Please sign up first." };
          }

          if (!existingUser.password) {
            return { success: false, error: "This account has no password set. Use your social provider to sign in." };
          }

          return { success: false, error: "Invalid credentials" };
        }
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
    const normalizedEmail = params.email.trim().toLowerCase();

    const existingUser = await AuthRepository.findUserByEmail(normalizedEmail);

    if (existingUser) {
      return { success: false, error: "Email already in use" };
    }

    const hashedPassword = await hash(params.password, 10);

    await AuthRepository.createUser({
      name: params.fullName.trim(),
      email: normalizedEmail,
      passwordHash: hashedPassword,
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
