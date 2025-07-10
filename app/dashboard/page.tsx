// app/dashboard/page.tsx
import { auth } from "@/lib/auth"
import { DashboardDataProvider } from "@/components/DashboardDataContext"
import { fetchDashboardData } from "@/components/DashboardDataProvider"
import DashboardContent from "@/components/DashboardContent"

export default async function DashboardPage() {
  const session = await auth();
  
  // Fetch data based on session
  const dashboardData = session?.user?.id 
    ? await fetchDashboardData(session.user.id)
    : {
        journalEntries: [],
        memories: [],
        events: [],
        unreadMessages: 0,
      };
  
  return (
    <DashboardDataProvider data={dashboardData}>
      <DashboardContent />
    </DashboardDataProvider>
  );
}