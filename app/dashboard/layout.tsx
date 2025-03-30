// DashboardLayout.tsx (Server Component)
import { auth } from "@/auth"
import { LoveJournalSidebar } from "@/components/SideBar"
import { SidebarProvider } from "@/components/ui/sidebar"
import DashboardHeader from "@/components/DashboardHeader" 

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth();
  
  return (
    <div className="flex h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      <SidebarProvider>
        {session && <LoveJournalSidebar session={session} />}
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
  )
}