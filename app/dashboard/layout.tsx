// DashboardLayout.tsx (Server Component)
import { auth } from "@/lib/auth"
import { LoveJournalSidebar } from "@/components/SideBar"
import { SidebarProvider } from "@/components/ui/sidebar"
import DashboardHeader from "@/components/DashboardHeader";
import { redirect } from "next/navigation";
import { getPartnerInfo } from "@/lib/actions/auth";
import { WebSocketPresenceProvider } from "@/components/WebSocketPresenceProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth();
  if (!session) {
   redirect('/signin');
  }

    // Get partner information if user is logged in
  let partner = session?.user?.id 
    ? await getPartnerInfo(session.user.id)
    : null

  // Normalize partner.profileImage: convert null to undefined
  if (partner && partner.profileImage === null) {
    partner = { ...partner, profileImage: undefined };
  }

  
  return (
    <WebSocketPresenceProvider userId={session?.user?.id}>

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