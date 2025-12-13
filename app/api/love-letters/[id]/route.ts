// PUT /api/love-letters/[id]
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
    const { content, title, private: isPrivate, delivered } = body

    const existingLetter = await prisma.loveLetter.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!existingLetter || existingLetter.userId !== currentUser.id) {
      return NextResponse.json({ error: 'Love letter not found' }, { status: 404 })
    }

    const updatedLetter = await prisma.loveLetter.update({
      where: { id },
      data: {
        content,
        title,
        private: isPrivate,
        delivered
      }
    })

    return NextResponse.json(updatedLetter)
  } catch (error) {
    console.error('Error updating love letter:', error)
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

    const existingLetter = await prisma.loveLetter.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!existingLetter || existingLetter.userId !== currentUser.id) {
      return NextResponse.json({ error: 'Love letter not found' }, { status: 404 })
    }

    await prisma.loveLetter.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Love letter deleted successfully' })
  } catch (error) {
    console.error('Error deleting love letter:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
