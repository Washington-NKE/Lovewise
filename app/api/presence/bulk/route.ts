// app/api/presence/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/lib/auth' // Import the auth function directly

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await auth() 
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userIds } = await request.json()

    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: 'User IDs array required' }, { status: 400 })
    }

    // Get multiple users' presence information
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        lastActive: true,
        profileImage: true
      }
    })

    // Consider user online if they were active in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    
    const presenceData = users.map(user => ({
      userId: user.id,
      name: user.name,
      profileImage: user.profileImage,
      isOnline: user.lastActive ? user.lastActive > fiveMinutesAgo : false,
      lastSeen: user.lastActive
    }))

    return NextResponse.json({ presenceData })
  } catch (error) {
    console.error('Error fetching bulk presence status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}