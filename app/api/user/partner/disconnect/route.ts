import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the user and their active relationship
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        relationships: {
          where: {
            OR: [
              { userId: session.user.id, status: 'ACTIVE' },
              { partnerId: session.user.id, status: 'ACTIVE' }
            ]
          },
          select: {
            id: true,
            userId: true,
            partnerId: true,
            status: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has an active relationship
    const activeRelationship = user.relationships[0]
    if (!activeRelationship) {
      return NextResponse.json(
        { error: 'No active relationship found' },
        { status: 400 }
      )
    }

    // Get partner ID (could be either userId or partnerId in the relationship)
    const partnerId = 
      activeRelationship.userId === session.user.id
        ? activeRelationship.partnerId
        : activeRelationship.userId

    // Execute all updates in a transaction
    await prisma.$transaction([
      // Update both users' partnerId to null
      prisma.user.update({
        where: { id: session.user.id },
        data: { partnerId: null, lovePactId: null }
      }),
      prisma.user.update({
        where: { id: partnerId },
        data: { partnerId: null, lovePactId: null }
      }),
      
      // Update the relationship status to ENDED
      prisma.relationship.update({
        where: { id: activeRelationship.id },
        data: { status: 'ENDED', endedAt: new Date() }
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