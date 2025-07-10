// DashboardHeader.tsx
"use client"

import { usePathname } from 'next/navigation'
import { useIsMobile } from '@/hooks/use-mobile';

export default function DashboardHeader() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-rose-200 bg-white/80 backdrop-blur-sm px-6">
      <div className="flex-1">
        <h1 className={`${isMobile ? "pl-10" : ""} text-lg font-semibold bg-gradient-to-r from-rose-600 to-fuchsia-600 bg-clip-text text-transparent`}>
          {pathname === "/dashboard" && "Your Love Dashboard"}
          {pathname === "/dashboard/journal" && "Couple's Journal"}
          {pathname === "/dashboard/memories" && "Precious Memories"}
          {pathname === "/dashboard/events" && "Special Dates & Celebrations"}
          {pathname === "/dashboard/messages" && "Love Notes & Messages"}
          {pathname === "/dashboard/gifts" && "Gift Ideas & Wishes"}
          {pathname === "/dashboard/settings" && "Account Settings"}
        </h1>
        <div className={`${isMobile ? "ml-10" : ""} h-0.5 w-24 bg-gradient-to-r from-rose-500 to-fuchsia-500 rounded-full mt-1`} />
      </div>

      <div className="px-3 py-1 rounded-full bg-gradient-to-r from-rose-100 to-fuchsia-100 text-xs text-rose-700 border border-rose-200 shadow-sm">
        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>
    </header>
  )
}