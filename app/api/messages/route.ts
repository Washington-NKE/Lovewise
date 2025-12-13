// app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/messages - Get messages for a relationship
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const relationshipId = searchParams.get('relationshipId')

    if (!relationshipId) {
      return NextResponse.json({ error: 'Relationship ID is required' }, { status: 400 })
    }

    // Verify user has access to this relationship
    const relationship = await prisma.relationship.findFirst({
      where: {
        id: relationshipId,
        OR: [
          { userId: session.user.id },
          { partnerId: session.user.id }
        ]
      }
    })

    if (!relationship) {
      return NextResponse.json({ error: 'Relationship not found' }, { status: 404 })
    }

    // Get messages between the two users
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: relationship.userId, receiverId: relationship.partnerId },
          { senderId: relationship.partnerId, receiverId: relationship.userId }
        ]
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/messages - Send a new message
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, receiverId, attachments } = await req.json()

    if (!content || !receiverId) {
      return NextResponse.json({ error: 'Content and receiver ID are required' }, { status: 400 })
    }

    // Verify relationship exists
    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [
          { userId: session.user.id, partnerId: receiverId },
          { userId: receiverId, partnerId: session.user.id }
        ],
        status: 'ACTIVE'
      }
    })

    if (!relationship) {
      return NextResponse.json({ error: 'No active relationship found' }, { status: 400 })
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        receiverId,
        attachments
      }
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}