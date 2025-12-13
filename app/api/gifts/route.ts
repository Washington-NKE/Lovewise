// app/api/gifts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const gifts = await prisma.gift.findMany({
      where: {
        OR: [
          { giverId: session.user.id },
          { recipientId: session.user.id }
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
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, dateGiven, occasion, description, reaction, isFavorite, giverId, recipientId } = body

    if (!name || !dateGiven || !occasion) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const gift = await prisma.gift.create({
      data: {
        name,
        dateGiven,
        occasion,
        description,
        reaction,
        isFavorite: isFavorite || false,
        giverId: giverId || session.user.id,
        recipientId: recipientId || session.user.id
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