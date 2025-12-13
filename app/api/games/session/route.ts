import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
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

    const { gameSlug } = await request.json()
    if (!gameSlug) {
      return NextResponse.json({ error: 'Missing gameSlug' }, { status: 400 })
    }

    const game = await prisma.game.findUnique({ where: { slug: gameSlug } })
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Try to find active relationship
    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [
          { userId: currentUser.id, status: 'ACTIVE' },
          { partnerId: currentUser.id, status: 'ACTIVE' }
        ]
      },
      include: { user: true, partner: true }
    })

    const partner =
      relationship
        ? (relationship.userId === currentUser.id ? relationship.partner : relationship.user)
        : null

    // Find existing session
    let gameSession = await prisma.gameSession.findFirst({
      where: {
        gameId: game.id,
        status: 'in_progress',
        OR: [
          { initiatorId: currentUser.id },
          { opponentId: currentUser.id }
        ]
      }
    })

    // Create session (solo if no partner)
    if (!gameSession) {
      gameSession = await prisma.gameSession.create({
        data: {
          gameId: game.id,
          initiatorId: currentUser.id,
          opponentId: partner?.id ?? null,
          status: 'in_progress'
        }
      })
    }

    return NextResponse.json({
      sessionId: gameSession.id,
      partner: partner
        ? { id: partner.id, name: partner.name, profileImage: partner.profileImage }
        : null
    })
  } catch (error) {
    console.error('Error creating game session:', error)
    return NextResponse.json({ error: 'Failed to create game session' }, { status: 500 })
  }
}