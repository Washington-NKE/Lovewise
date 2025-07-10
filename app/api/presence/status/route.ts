
// app/api/presence/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import {auth} from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get('userId')

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Get user's presence information
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        lastActive: true,
        profileImage: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Consider user online if they were active in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const isOnline = user.lastActive ? user.lastActive > fiveMinutesAgo : false

    return NextResponse.json({
      userId: user.id,
      name: user.name,
      profileImage: user.profileImage,
      isOnline,
      lastSeen: user.lastActive
    })
  } catch (error) {
    console.error('Error fetching presence status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
