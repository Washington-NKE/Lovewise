import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import {Toaster} from "sonner";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lovewise",
  description: "Couple Journal",
};

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const session = await auth();
  if (!session) redirect("/signin")
  return (
    <html lang="en">
      <SessionProvider session={session}>
        <ThemeProvider>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >

        {children}
        <Toaster position="top-right" richColors />

      </body>
      </ThemeProvider>
      </SessionProvider>
    </html>
  );
}

export default RootLayout;