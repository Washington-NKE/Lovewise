import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/signin?error=unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  });

  if (!user || user.role !== 'admin') {
    redirect('/dashboard');
  }

  return <AdminDashboard />;
}
