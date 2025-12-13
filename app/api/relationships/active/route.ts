
// app/api/relationships/active/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/relationships/active - Get user's active relationship
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [
          { userId: session.user.id },
          { partnerId: session.user.id }
        ],
        status: 'ACTIVE'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            lastActive: true
          }
        },
        partner: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            lastActive: true
          }
        }
      }
    })

    if (!relationship) {
      return NextResponse.json({ error: 'No active relationship found' }, { status: 404 })
    }

    return NextResponse.json(relationship)
  } catch (error) {
    console.error('Error fetching active relationship:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}