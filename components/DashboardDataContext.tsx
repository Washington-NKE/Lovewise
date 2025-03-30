// DashboardDataContext.tsx
"use client"

import React, { createContext, useContext, ReactNode } from 'react';
import { DashboardData } from './DashboardDataProvider';

// Create a context with a default empty state
const DashboardDataContext = createContext<DashboardData>({
  journalEntries: [],
  memories: [],
  events: [],
  unreadMessages: 0,
});

export const useDashboardData = () => useContext(DashboardDataContext);

// Provider component that will wrap your dashboard content
export function DashboardDataProvider({ 
  children, 
  data 
}: { 
  children: ReactNode, 
  data: DashboardData 
}) {
  return (
    <DashboardDataContext.Provider value={data}>
      {children}
    </DashboardDataContext.Provider>
  );
}