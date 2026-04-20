import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { serverCache } from '@/lib/server-cache'

export const runtime = 'nodejs'

export async function GET() {
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

    const cacheKey = `invites:${currentUser.id}`
    const cached = serverCache.get<{
      incoming: unknown[]
      outgoing: unknown[]
    }>(cacheKey)

    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'private, max-age=0, s-maxage=5, stale-while-revalidate=20'
        }
      })
    }

    const incoming = await prisma.relationship.findMany({
      where: { status: 'PENDING', partnerId: currentUser.id },
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const outgoing = await prisma.relationship.findMany({
      where: { status: 'PENDING', userId: currentUser.id },
      include: {
        partner: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const payload = { incoming, outgoing }
    serverCache.set(cacheKey, payload, 5000)

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'private, max-age=0, s-maxage=5, stale-while-revalidate=20'
      }
    })
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
