// DashboardLayout.tsx (Server Component)
import { auth } from "@/lib/auth"
import { LoveJournalSidebar } from "@/components/SideBar"
import { SidebarProvider } from "@/components/ui/sidebar"
import DashboardHeader from "@/components/DashboardHeader";
import { redirect } from "next/navigation";
import { getPartnerInfo } from "@/lib/actions/auth";
import { WebSocketPresenceProvider } from "@/components/WebSocketPresenceProvider";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth();
  if (!session) {
    redirect('/signin');
  }

  // Get the current user's ID from database using email
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user?.email || '' }
  });

  if (!currentUser) {
    redirect('/signin');
  }

  // Get partner information using the correct user ID
  let partner = await getPartnerInfo(currentUser.id)

  // console.log("Partner query by Washington:", partner)
  // console.log("Session query by Washington:", session)
  // console.log("Current user query by Washington:", currentUser)

  // Normalize partner.profileImage: convert null to undefined
  if (partner && partner.profileImage === null) {
    partner = { ...partner, profileImage: undefined };
  }

  return (
    <WebSocketPresenceProvider userId={currentUser.id}>
      <div className="flex h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
        <SidebarProvider>
          {session && <LoveJournalSidebar session={session} partner={partner} />}
          <div className="flex-1 bg-white">
            <DashboardHeader /> 
            <main className="flex-1 p-6 text-purple-700">
              <div>
                {children}
              </div>
            </main>
          </div>
        </SidebarProvider>
      </div>
    </WebSocketPresenceProvider>
  )
}