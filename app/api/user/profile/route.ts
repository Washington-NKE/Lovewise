// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'


export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        emailNotifications: true,
        pushNotifications: true,
        eventReminders: true,
        partnerActivityNotifications: true,
        privateJournalDefault: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find active relationship and resolve partner details
    const relationship = await prisma.relationship.findFirst({
      where: {
        status: 'ACTIVE',
        OR: [{ userId: session.user.id }, { partnerId: session.user.id }],
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        partner: { select: { id: true, name: true, email: true } },
      },
    })

    const partner = relationship
      ? relationship.userId === session.user.id
        ? relationship.partner
        : relationship.user
      : null

    // Transform to match frontend interface
    const userData = {
      ...user,
      partner,
      notifications: {
        email: user.emailNotifications,
        push: user.pushNotifications,
        reminders: user.eventReminders,
        partnerActivity: user.partnerActivityNotifications,
      },
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, bio } = body

    // Validate email uniqueness if changed
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      if (existingUser) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
        bio,
      }
    })

    return NextResponse.json({ message: 'Profile updated successfully' })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


