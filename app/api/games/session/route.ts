import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const sessionId = url.searchParams.get('sessionId')
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const gameSession = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        initiatorId: true,
        opponentId: true,
        status: true
      }
    })

    if (!gameSession) {
      return NextResponse.json({ error: 'Game session not found' }, { status: 404 })
    }

    const isParticipant =
      gameSession.initiatorId === currentUser.id || gameSession.opponentId === currentUser.id

    if (!isParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const opponentJoined = Boolean(gameSession.opponentId)

    return NextResponse.json({
      sessionId: gameSession.id,
      status: gameSession.status,
      opponentJoined,
      opponentId: gameSession.opponentId
    })
  } catch (error) {
    console.error('Error fetching game session status:', error)
    return NextResponse.json({ error: 'Failed to fetch game session status' }, { status: 500 })
  }
}

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

    const resolveGameSession = async () => {
      // Find an existing in-progress session for this game and couple.
      let gameSession = await prisma.gameSession.findFirst({
        where: {
          gameId: game.id,
          status: 'in_progress',
          ...(partner
            ? {
                OR: [
                  { initiatorId: currentUser.id, opponentId: partner.id },
                  { initiatorId: partner.id, opponentId: currentUser.id },
                  { initiatorId: currentUser.id, opponentId: null },
                  { initiatorId: partner.id, opponentId: null }
                ]
              }
            : {
                OR: [
                  { initiatorId: currentUser.id },
                  { opponentId: currentUser.id }
                ]
              })
        },
        orderBy: { createdAt: 'desc' }
      })

      // If joining partner finds an open session without opponent, claim that seat atomically.
      if (
        gameSession &&
        partner &&
        gameSession.opponentId === null &&
        gameSession.initiatorId !== currentUser.id
      ) {
        await prisma.gameSession.updateMany({
          where: {
            id: gameSession.id,
            opponentId: null,
            status: 'in_progress'
          },
          data: { opponentId: currentUser.id }
        })

        gameSession = await prisma.gameSession.findUnique({ where: { id: gameSession.id } })
      }

      // Create session. For partner play, keep opponent slot open until the partner actually joins.
      if (!gameSession) {
        gameSession = await prisma.gameSession.create({
          data: {
            gameId: game.id,
            initiatorId: currentUser.id,
            opponentId: null,
            status: 'in_progress'
          }
        })
      }

      return gameSession
    }

    let gameSession: Awaited<ReturnType<typeof resolveGameSession>> | null = null
    let attempt = 0
    const maxAttempts = 3

    while (attempt < maxAttempts && !gameSession) {
      try {
        gameSession = await resolveGameSession()
      } catch (error) {
        if (attempt === maxAttempts - 1) {
          throw error
        }
      }
      attempt += 1
    }

    if (!gameSession) {
      return NextResponse.json({ error: 'Could not create game session' }, { status: 500 })
    }

    return NextResponse.json({
      sessionId: gameSession.id,
      opponentJoined: Boolean(gameSession.opponentId),
      opponentId: gameSession.opponentId,
      partner: partner
        ? { id: partner.id, name: partner.name, profileImage: partner.profileImage }
        : null
    })
  } catch (error) {
    console.error('Error creating game session:', error)
    return NextResponse.json({ error: 'Failed to create game session' }, { status: 500 })
  }
}