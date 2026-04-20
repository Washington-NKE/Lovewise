import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { serverCache } from '@/lib/server-cache'

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
    const rawEmail = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const rawUserId = typeof body?.userId === 'string' ? body.userId.trim() : ''

    if (!rawEmail && !rawUserId) {
      return NextResponse.json({ error: 'Email or userId is required' }, { status: 400 })
    }

    // Resolve invite target by userId (preferred) or email.
    const targetUser = rawUserId
      ? await prisma.user.findUnique({ where: { id: rawUserId } })
      : await prisma.user.findUnique({ where: { email: rawEmail } })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is trying to invite themselves
    if (targetUser.id === currentUser.id) {
      return NextResponse.json({ error: 'Cannot invite yourself' }, { status: 400 })
    }

    const inviterActiveRelationship = await prisma.relationship.findFirst({
      where: {
        status: 'ACTIVE',
        OR: [{ userId: currentUser.id }, { partnerId: currentUser.id }]
      },
      select: { id: true }
    })

    if (inviterActiveRelationship) {
      return NextResponse.json(
        { error: 'You already have an active partner. Disconnect first.' },
        { status: 400 }
      )
    }

    const targetActiveRelationship = await prisma.relationship.findFirst({
      where: {
        status: 'ACTIVE',
        OR: [{ userId: targetUser.id }, { partnerId: targetUser.id }]
      },
      select: { id: true }
    })

    if (targetActiveRelationship) {
      return NextResponse.json(
        { error: 'This user already has an active partner.' },
        { status: 400 }
      )
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

    serverCache.delete(`invites:${currentUser.id}`)
    serverCache.delete(`invites:${targetUser.id}`)

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
