import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST() {
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

    // Find active relationship involving this user
    const activeRelationship = await prisma.relationship.findFirst({
      where: {
        status: 'ACTIVE',
        OR: [{ userId: currentUser.id }, { partnerId: currentUser.id }]
      }
    })

    if (!activeRelationship) {
      return NextResponse.json(
        { error: 'No active relationship found' },
        { status: 400 }
      )
    }

    // Get partner ID (could be either userId or partnerId in the relationship)
    const partnerId =
      activeRelationship.userId === currentUser.id
        ? activeRelationship.partnerId
        : activeRelationship.userId

    // Execute all updates in a transaction
    await prisma.$transaction([
      // Clear love pact for both users
      prisma.user.update({
        where: { id: currentUser.id },
        data: { lovePactId: null }
      }),
      prisma.user.update({
        where: { id: partnerId },
        data: { lovePactId: null }
      }),

      // Update the relationship status to ENDED
      prisma.relationship.update({
        where: { id: activeRelationship.id },
        data: { status: 'ENDED' }
      })
    ])

    return NextResponse.json({ 
      message: 'Partner disconnected and relationship ended successfully' 
    })
  } catch (error) {
    console.error('Error disconnecting partner:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}