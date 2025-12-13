
// PUT /api/secret-plan-items/[id]
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
// Update a secret plan item
export async function PUT(request: NextRequest, { params }: {params: {id : string}}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { item, completed, cost, notes } = body

    // Verify ownership through secret plan
    const existingItem = await prisma.secretPlanItem.findUnique({
      where: { id },
      include: {
        plan: {
          select: { userId: true }
        }
      }
    })

    if (!existingItem || existingItem.plan.userId !== session.user.id) {
      return NextResponse.json({ error: 'Secret plan item not found' }, { status: 404 })
    }

    const updatedItem = await prisma.secretPlanItem.update({
      where: { id },
      data: {
        item,
        completed,
        cost,
        notes
      }
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Error updating secret plan item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/secret-plan-items/[id]
// Delete a secret plan item
export async function DELETE( { params }:{params: {id: string}}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Verify ownership through secret plan
    const existingItem = await prisma.secretPlanItem.findUnique({
      where: { id },
      include: {
        plan: {
          select: { userId: true }
        }
      }
    })

    if (!existingItem || existingItem.plan.userId !== session.user.id) {
      return NextResponse.json({ error: 'Secret plan item not found' }, { status: 404 })
    }

    await prisma.secretPlanItem.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Secret plan item deleted successfully' })
  } catch (error) {
    console.error('Error deleting secret plan item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}