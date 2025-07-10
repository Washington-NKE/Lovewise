import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
// app/api/user/notifications/route.ts
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, push, reminders, partnerActivity } = body

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        emailNotifications: email,
        pushNotifications: push,
        eventReminders: reminders,
        partnerActivityNotifications: partnerActivity,
      }
    })

    return NextResponse.json({ message: 'Notification preferences updated' })
  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}