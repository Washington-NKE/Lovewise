// DashboardDataProvider.tsx
import { prisma } from "@/lib/prisma"
import { cache } from 'react'

// Interface for Dashboard Data
export interface DashboardData {
  journalEntries: Array<{
    id: string;
    title: string;
    createdAt: string;
  }>;
  memories: Array<{
    id: string;
    imageUrl: string | null;
  }>;
  events: Array<{
    id: string;
    title: string;
    date: string;
  }>;
  unreadMessages: number;
}

// This function still uses cache but only takes the userId directly
export const fetchDashboardData = cache(async (userId: string): Promise<DashboardData> => {
  if (!userId) {
    return {
      journalEntries: [],
      memories: [],
      events: [],
      unreadMessages: 0,
    };
  }

  try {
    const [dashboardData] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          journals: {
            take: 3,
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, createdAt: true }
          },
          memories: {
            take: 6,
            orderBy: { createdAt: 'desc' },
            select: { id: true, mediaUrls: true }
          },
          events: {
            where: { startDate: { gte: new Date() } },
            orderBy: { startDate: 'asc' },
            take: 2,
            select: { id: true, title: true, startDate: true }
          },
          _count: {
            select: {
              messages: {
                where: {
                  receiverId: userId,
                  isRead: false
                }
              }
            }
          }
        }
      })
    ]);

    if (!dashboardData) {
      throw new Error('User not found');
    }

    return {
      journalEntries: dashboardData.journals.map(entry => ({
        ...entry,
        createdAt: entry.createdAt.toISOString()
      })),
      memories: dashboardData.memories.map(memory => ({
        id: memory.id,
        imageUrl: typeof memory.mediaUrls === 'string' ? memory.mediaUrls : '/placeholder.jpg'
      })),
      events: dashboardData.events.map(event => ({
        ...event,
        date: event.startDate.toISOString()
      })),
      unreadMessages: dashboardData._count.messages,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      journalEntries: [],
      memories: [],
      events: [],
      unreadMessages: 0,
    };
  }
});