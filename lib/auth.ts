// lib/auth.ts
import NextAuth, { User } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

const nextAuthSecret = process.env.NEXTAUTH_SECRET;
declare module "next-auth" {
  interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
  }
          
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email: string;
    }
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: nextAuthSecret,
  adapter: PrismaAdapter(prisma),
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const normalizedEmail = credentials.email.toString().trim().toLowerCase();
        const plainPassword = credentials.password.toString();

        const user = await (prisma as any).user.findUnique({
          where: {
            email: normalizedEmail
          },
          select: {
            id: true,
            email: true,
            name: true,
            password: true
          }
        }) as {
          id: string;
          email: string;
          name: string | null;
          password: string | null;
        } | null;
                        
        if (!user || !user.password) return null;
                        
        const isPasswordValid = await compare(
          plainPassword,
          user.password,
        );
                        
        if (!isPasswordValid) return null;
                        
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
        } as User;
      },
    }),
  ],
  
  pages: {
    signIn: "/signin",
  },
  
  callbacks: {
    async jwt({ token, user }) {
      // Persist the user ID to the token right after signin
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    
    async session({ session, token }) {
      // Send properties to the client
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  
  // Add debug logging in development
  debug: process.env.NODE_ENV === "development",
});