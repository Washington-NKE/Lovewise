import NextAuth, { User } from "next-auth";
import { compare } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./lib/prisma";

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
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { 
            email: credentials.email.toString() 
          },

          select: {
            id: true,
            email: true,
            name: true,
            password: true
          }
        });

        if (!user) return null;

        const isPasswordValid = await compare(
          credentials.password.toString(),
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
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }

      return session;
    },
  },

  // debug: process.env.NODE_ENV === 'development',
});