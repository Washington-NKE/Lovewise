// app/api/messages/[id]/read/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/lib/auth'

const prisma = new PrismaClient()

// PATCH /api/messages/[id]/read - Mark message as read
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const messageId = params.id

    // Find the message and verify user is the receiver
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        receiverId: session.user.id
      }
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Update message to mark as read
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true }
    })

    return NextResponse.json(updatedMessage)
  } catch (error) {
    console.error('Error marking message as read:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}