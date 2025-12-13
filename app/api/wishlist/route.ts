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

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
        userId: session.user.id
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

    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        name,
        description,
        isSecret,
        priceEstimate,
        url,
        imageUrl,
        userId: session.user.id
      }
    })

    return NextResponse.json(wishlistItem, { status: 201 })
  } catch (error) {
    console.error('Error creating wishlist item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}