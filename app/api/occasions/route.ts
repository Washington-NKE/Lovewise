// app/api/occasions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const occasions = await prisma.specialOccasion.findMany({
      where: {
        userId: session.user.id
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
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, date, budget, description, isRecurring, giftIdeas } = body

    if (!title || !date) {
      return NextResponse.json({ error: 'Title and date are required' }, { status: 400 })
    }

    const occasion = await prisma.specialOccasion.create({
      data: {
        title,
        date,
        description,
        budget,
        giftIdeas: giftIdeas || [],
        isRecurring: isRecurring || false,
        userId: session.user.id
      }
    })

    return NextResponse.json(occasion, { status: 201 })
  } catch (error) {
    console.error('Error creating occasion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}