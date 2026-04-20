import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const query = request.nextUrl.searchParams.get('q')?.trim() ?? ''
    const normalized = query.toLowerCase()

    // Do not return all users when query is empty/too short.
    if (!normalized || normalized.length < 2) {
      return NextResponse.json([])
    }

    const users = await prisma.user.findMany({
      where: {
        id: { not: session.user.id },
        OR: [
          { email: { contains: normalized, mode: 'insensitive' } },
          { name: { contains: normalized, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      take: 10,
      orderBy: [{ name: 'asc' }, { email: 'asc' }]
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
