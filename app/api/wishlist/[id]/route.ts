// app/api/wishlist/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, priority, isSecret, priceEstimate, url, imageUrl } = body

    // Verify ownership
    const existingItem = await prisma.wishlistItem.findUnique({
      where: { id: params.id }
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Wishlist item not found' }, { status: 404 })
    }

    if (existingItem.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const wishlistItem = await prisma.wishlistItem.update({
      where: { id: params.id },
      data: {
        name,
        priority,
        description,
        isSecret, 
        priceEstimate, 
        url, 
        imageUrl 
      }
    })

    return NextResponse.json(wishlistItem)
  } catch (error) {
    console.error('Error updating wishlist item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const existingItem = await prisma.wishlistItem.findUnique({
      where: { id: params.id }
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Wishlist item not found' }, { status: 404 })
    }

    if (existingItem.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.wishlistItem.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Wishlist item deleted successfully' })
  } catch (error) {
    console.error('Error deleting wishlist item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}