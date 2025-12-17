import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    const relationship = await prisma.relationship.findUnique({
      where: { id }
    })
    if (!relationship) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    if (relationship.status !== 'PENDING') {
      return NextResponse.json({ error: 'Invitation is no longer valid' }, { status: 400 })
    }

    // Only the invitee (partnerId) can accept
    if (relationship.partnerId !== currentUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.relationship.update({
      where: { id },
      data: { status: 'ACTIVE', anniversaryDate: new Date() }
    })

    return NextResponse.json({ message: 'Invitation accepted' })
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}