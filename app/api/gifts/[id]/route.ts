// app/api/gifts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()
    const { name, dateGiven, occasion, description, reaction, isFavorite } = body

    // Verify ownership
    const existingGift = await prisma.gift.findUnique({
      where: { id }
    })

    if (!existingGift) {
      return NextResponse.json({ error: 'Gift not found' }, { status: 404 })
    }

    if (existingGift.giverId !== currentUser.id && existingGift.recipientId !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const gift = await prisma.gift.update({
      where: { id },
      data: {
        name,
        dateGiven,
        occasion,
        description,
        reaction,
        isFavorite
      },
      include: {
        giver: {
          select: {
            name: true,
            email: true
          }
        },
        recipient: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(gift)
  } catch (error) {
    console.error('Error updating gift:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Verify ownership
    const existingGift = await prisma.gift.findUnique({
      where: { id }
    })

    if (!existingGift) {
      return NextResponse.json({ error: 'Gift not found' }, { status: 404 })
    }

    if (existingGift.giverId !== currentUser.id && existingGift.recipientId !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.gift.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Gift deleted successfully' })
  } catch (error) {
    console.error('Error deleting gift:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}