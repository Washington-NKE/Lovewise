// app/api/wishlist/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'


export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the active relationship for the user
    const relationship = await prisma.relationship.findFirst({
      where: {
        status: 'ACTIVE',
        OR: [{ userId: session.user.id }, { partnerId: session.user.id }]
      },
      select: { id: true }
    })

    if (!relationship) {
      return NextResponse.json({ error: 'No active relationship found' }, { status: 400 })
    }

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
        userId: session.user.id,
        relationshipId: relationship.id
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(wishlistItems)
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
 const { 
      name, 
      description, 
      isSecret, 
      priceEstimate, 
      url, 
      imageUrl 
    }: {
      name: string
      description?: string
      isSecret: boolean
      priceEstimate?: number
      url?: string
      imageUrl?: string
    } = body

    if (!name) {
      return NextResponse.json({ error: 'Item is required' }, { status: 400 })
    }

    // Find the active relationship for the user (required by schema)
    const relationship = await prisma.relationship.findFirst({
      where: {
        status: 'ACTIVE',
        OR: [{ userId: session.user.id }, { partnerId: session.user.id }]
      },
      select: { id: true }
    })

    if (!relationship) {
      return NextResponse.json({ error: 'No active relationship found' }, { status: 400 })
    }

    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        name,
        description: description ?? undefined,
        isSecret,
        priceEstimate: typeof priceEstimate === 'number' ? priceEstimate : undefined,
        url: url ?? undefined,
        imageUrl: imageUrl ?? undefined,
        userId: session.user.id,
        relationshipId: relationship.id
      }
    })

    return NextResponse.json(wishlistItem, { status: 201 })
  } catch (error) {
    console.error('Error creating wishlist item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}