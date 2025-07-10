
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import {auth} from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, timestamp } = await request.json()

    // Verify the user is updating their own presence
    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update user's last active timestamp
    await prisma.user.update({
      where: { id: userId },
      data: { lastActive: new Date(timestamp) }
    })

    // Get partner information for real-time updates
    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [
          { userId: userId, status: 'ACTIVE' },
          { partnerId: userId, status: 'ACTIVE' }
        ]
      },
      include: {
        user: true,
        partner: true
      }
    })

    let partnerInfo = null
    if (relationship) {
      partnerInfo = relationship.userId === userId ? relationship.partner : relationship.user
    }

    return NextResponse.json({ 
      success: true, 
      partner: partnerInfo ? {
        id: partnerInfo.id,
        name: partnerInfo.name,
        lastActive: partnerInfo.lastActive
      } : null
    })
  } catch (error) {
    console.error('Error updating presence:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}