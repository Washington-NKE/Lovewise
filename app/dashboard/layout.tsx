import { headers } from 'next/headers'
import { auth } from "@/auth"
import { LoveJournalSidebar } from "@/components/SideBar"
import { SidebarProvider } from "@/components/ui/sidebar"
//import { Motion } from "@/components/Motion"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth();
  const headersList = await headers();
  const pathname = headersList.get('x-invoke-path') || '';

  return (
    <div className="flex h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      <SidebarProvider>
        {session && <LoveJournalSidebar session={session} />}
        <div className="flex-1 bg-white">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-rose-200 bg-white/80 backdrop-blur-sm px-6">
            <div className="flex-1">
              <h1
                className="text-lg font-semibold bg-gradient-to-r from-rose-600 to-fuchsia-600 bg-clip-text text-transparent"
                // initial={{ opacity: 0, y: -10 }}
                // animate={{ opacity: 1, y: 0 }}
                // transition={{ duration: 0.5 }}
              >
                {pathname === "/dashboard" && "Your Love Dashboard"}
                {pathname === "/dashboard/journal" && "Couple's Journal"}
                {pathname === "/dashboard/memories" && "Precious Memories"}
                {pathname === "/dashboard/events" && "Special Dates & Celebrations"}
                {pathname === "/dashboard/messages" && "Love Notes & Messages"}
                {pathname === "/dashboard/gifts" && "Gift Ideas & Wishes"}
                {pathname === "/dashboard/settings" && "Account Settings"}
              </h1>
              <div
                className="h-0.5 w-24 bg-gradient-to-r from-rose-500 to-fuchsia-500 rounded-full mt-1"
                // initial={{ width: 0 }}
                // animate={{ width: "6rem" }}
                // transition={{ delay: 0.3, duration: 0.5 }}
              />
            </div>
            
            <div 
              className="px-3 py-1 rounded-full bg-gradient-to-r from-rose-100 to-fuchsia-100 text-xs text-rose-700 border border-rose-200 shadow-sm"
              // whileHover={{ scale: 1.05 }}
              // transition={{ duration: 0.2 }}
            >
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </header>
          
          <main className="flex-1 p-6 text-purple-700">
            <div
              // initial={{ opacity: 0, y: 20 }}
              // animate={{ opacity: 1, y: 0 }}
              // transition={{ duration: 0.5 }}
            >
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  )
}