// app/api/thoughtful-ideas/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const thoughtfulIdeas = await prisma.thoughtfulIdea.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: [
        { completed: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(thoughtfulIdeas)
  } catch (error) {
    console.error('Error fetching thoughtful ideas:', error)
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
    const { title, description, type, progress, targetDate, completed } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    const thoughtfulIdea = await prisma.thoughtfulIdea.create({
      data: {
        title,
        description,
        type: type || 'DIY',
        progress: progress || 0,
        targetDate,
        completed: completed || false,
        userId: session.user.id
      }
    })

    return NextResponse.json(thoughtfulIdea, { status: 201 })
  } catch (error) {
    console.error('Error creating thoughtful idea:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
