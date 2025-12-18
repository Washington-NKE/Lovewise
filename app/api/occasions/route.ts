// app/api/occasions/route.ts
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

    const occasions = await prisma.specialOccasion.findMany({
      where: {
        userId: currentUser.id
      },
      orderBy: {
        date: 'asc'
      }
    })

    return NextResponse.json(occasions)
  } catch (error) {
    console.error('Error fetching occasions:', error)
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
    const { title, date, budget, description, isRecurring, giftIdeas } = body

    if (!title || !date) {
      return NextResponse.json({ error: 'Title and date are required' }, { status: 400 })
    }

    const occasion = await prisma.specialOccasion.create({
      data: {
        title,
        date: new Date(date),
        description,
        budget,
        giftIdeas: giftIdeas || [],
        isRecurring: isRecurring || false,
        userId: currentUser.id,
        relationshipId: relationship.id
      }
    })

    return NextResponse.json(occasion, { status: 201 })
  } catch (error) {
    console.error('Error creating occasion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}