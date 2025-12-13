// app/api/occasions/[id]/route.ts
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
    const { title, date, budget, description, isRecurring, giftIdeas } = body

    // Verify ownership
    const existingOccasion = await prisma.specialOccasion.findUnique({
      where: { id: params.id }
    })

    if (!existingOccasion) {
      return NextResponse.json({ error: 'Occasion not found' }, { status: 404 })
    }

    if (existingOccasion.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const occasion = await prisma.specialOccasion.update({
      where: { id: params.id },
      data: {
        title,
        date,
        budget,
        description,
        isRecurring,
        giftIdeas
      }
    })

    return NextResponse.json(occasion)
  } catch (error) {
    console.error('Error updating occasion:', error)
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
    const existingOccasion = await prisma.specialOccasion.findUnique({
      where: { id: params.id }
    })

    if (!existingOccasion) {
      return NextResponse.json({ error: 'Occasion not found' }, { status: 404 })
    }

    if (existingOccasion.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.specialOccasion.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Occasion deleted successfully' })
  } catch (error) {
    console.error('Error deleting occasion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}