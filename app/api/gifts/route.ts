// app/api/gifts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const gifts = await prisma.gift.findMany({
      where: {
        OR: [
          { giverId: currentUser.id },
          { recipientId: currentUser.id }
        ]
      },
      include: {
        giver: {
          select: {
            name: true,
            email: true
          }
        },
        recipient: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(gifts)
  } catch (error) {
    console.error('Error fetching gifts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the user's active relationship
    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [
          { userId: currentUser.id, status: 'ACTIVE' },
          { partnerId: currentUser.id, status: 'ACTIVE' }
        ]
      }
    })

    if (!relationship) {
      return NextResponse.json({ error: 'No active relationship found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, dateGiven, occasion, description, reaction, isFavorite, giverId, recipientId } = body

    if (!name) {
      return NextResponse.json({ error: 'Gift name is required' }, { status: 400 })
    }

    const gift = await prisma.gift.create({
      data: {
        name,
        dateGiven: dateGiven ? new Date(dateGiven) : null,
        occasion,
        description,
        reaction,
        isFavorite: isFavorite || false,
        giverId: giverId || currentUser.id,
        recipientId: recipientId || currentUser.id,
        relationshipId: relationship.id
      },
      include: {
        giver: {
          select: {
            name: true,
            email: true
          }
        },
        recipient: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(gift, { status: 201 })
  } catch (error) {
    console.error('Error creating gift:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}