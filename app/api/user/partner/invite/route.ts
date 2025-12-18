import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true }
    })
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user is trying to invite themselves
    if (email === currentUser.email) {
      return NextResponse.json({ error: 'Cannot invite yourself' }, { status: 400 })
    }

    // Check if the email belongs to an existing user
    const targetUser = await prisma.user.findUnique({
      where: { email }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User with this email not found' }, { status: 404 })
    }

    // Check if already in a relationship with this user
    const existingRelationship = await prisma.relationship.findFirst({
      where: {
        OR: [
          { userId: currentUser.id, partnerId: targetUser.id },
          { userId: targetUser.id, partnerId: currentUser.id }
        ]
      }
    })

    if (existingRelationship) {
      if (existingRelationship.status === 'ACTIVE') {
        return NextResponse.json({ error: 'You are already connected with this user' }, { status: 400 })
      }
      if (existingRelationship.status === 'PENDING') {
        return NextResponse.json({ error: 'Invitation already pending' }, { status: 400 })
      }
    }

    // Create pending relationship (invitation)
    const invitation = await prisma.relationship.create({
      data: {
        userId: currentUser.id,
        partnerId: targetUser.id,
        status: 'PENDING'
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, profileImage: true }
        },
        partner: {
          select: { id: true, name: true, email: true, profileImage: true }
        }
      }
    })

    // TODO: Send email notification to the invited user

    return NextResponse.json({ 
      message: 'Invitation sent successfully',
      invitation
    })
  } catch (error) {
    console.error('Error sending partner invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
