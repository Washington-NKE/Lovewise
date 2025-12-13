
// PUT /api/love-letters/[id]
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
// Update a love letter
export async function PUT(request: NextRequest, {params}: {params: {id: string}}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { content, title, private: isPrivate, delivered } = body

    // Verify ownership
    const existingLetter = await prisma.loveLetter.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!existingLetter || existingLetter.userId !== session.user.id) {
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

// DELETE /api/love-letters/[id]
// Delete a love letter
export async function DELETE({params}: { params: {id: string} }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Verify ownership
    const existingLetter = await prisma.loveLetter.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!existingLetter || existingLetter.userId !== session.user.id) {
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
