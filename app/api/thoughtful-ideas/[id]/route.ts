
// app/api/thoughtful-ideas/[id]/route.ts
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
    const { title, description, type, progress, targetDate, completed } = body

    // Verify ownership
    const existingIdea = await prisma.thoughtfulIdea.findUnique({
      where: { id: params.id }
    })

    if (!existingIdea) {
      return NextResponse.json({ error: 'Thoughtful idea not found' }, { status: 404 })
    }

    if (existingIdea.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const thoughtfulIdea = await prisma.thoughtfulIdea.update({
      where: { id: params.id },
      data: {
        title,
        description,
        type,
        progress,
        targetDate,
        completed
      }
    })

    return NextResponse.json(thoughtfulIdea)
  } catch (error) {
    console.error('Error updating thoughtful idea:', error)
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
    const existingIdea = await prisma.thoughtfulIdea.findUnique({
      where: { id: params.id }
    })

    if (!existingIdea) {
      return NextResponse.json({ error: 'Thoughtful idea not found' }, { status: 404 })
    }

    if (existingIdea.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.thoughtfulIdea.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Thoughtful idea deleted successfully' })
  } catch (error) {
    console.error('Error deleting thoughtful idea:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}