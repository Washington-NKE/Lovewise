
import { NextRequest, NextResponse } from 'next/server'
import getServerSession  from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// app/api/user/partner/invitations/[id]/accept/route.ts
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invitationId = params.id

    const invitation = await prisma.partnerInvitation.findUnique({
      where: { id: invitationId },
      include: { sender: true }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json({ error: 'Invitation is no longer valid' }, { status: 400 })
    }

    // Verify the invitation is for the current user
    if (invitation.receiverId !== session.user.id && invitation.email !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Accept the invitation and create partner connection
    await prisma.$transaction([
      // Update invitation status
      prisma.partnerInvitation.update({
        where: { id: invitationId },
        data: { 
          status: 'ACCEPTED',
          receiverId: session.user.id
        }
      }),
      // Create bidirectional partner relationship
      prisma.user.update({
        where: { id: session.user.id },
        data: { partnerId: invitation.senderId }
      }),
      prisma.user.update({
        where: { id: invitation.senderId },
        data: { partnerId: session.user.id }
      })
    ])

    return NextResponse.json({ message: 'Partner invitation accepted successfully' })
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}