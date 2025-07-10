import { NextRequest, NextResponse } from 'next/server'
import getServerSession  from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// app/api/user/partner/invite/route.ts
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user is trying to invite themselves
    if (email === session.user.email) {
      return NextResponse.json({ error: 'Cannot invite yourself' }, { status: 400 })
    }

    // Check if invitation already exists
    const existingInvitation = await prisma.partnerInvitation.findUnique({
      where: {
        senderId_email: {
          senderId: session.user.id,
          email: email
        }
      }
    })

    if (existingInvitation) {
      return NextResponse.json({ error: 'Invitation already sent to this email' }, { status: 400 })
    }

    // Check if the email belongs to an existing user
    const targetUser = await prisma.user.findUnique({
      where: { email }
    })

    // Create invitation
    const invitation = await prisma.partnerInvitation.create({
      data: {
        email,
        senderId: session.user.id,
        receiverId: targetUser?.id,
        status: 'PENDING'
      }
    })

    // TODO: Send email notification to the invited user
    // This would typically involve using a service like SendGrid, Resend, etc.

    return NextResponse.json({ 
      message: 'Invitation sent successfully',
      invitationId: invitation.id 
    })
  } catch (error) {
    console.error('Error sending partner invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
