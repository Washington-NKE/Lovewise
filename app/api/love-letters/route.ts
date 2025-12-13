
// GET /api/love-letters
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
// Get all love letters for the authenticated user
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const loveLetters = await prisma.loveLetter.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(loveLetters)
  } catch (error) {
    console.error('Error fetching love letters:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/love-letters
// Create a new love letter
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content, title, private: isPrivate, delivered } = body

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const loveLetter = await prisma.loveLetter.create({
      data: {
        content,
        title,
        private: isPrivate || false,
        delivered: delivered || false,
        userId: session.user.id
      }
    })

    return NextResponse.json(loveLetter)
  } catch (error) {
    console.error('Error creating love letter:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}