// PUT /api/secret-plans/[id]
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
// Update a secret plan
export async function PUT(request:NextRequest, { params }:{params: {id: string}}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { title, description, budget, targetDate, progress } = body

    // Verify ownership
    const existingPlan = await prisma.secretPlan.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!existingPlan || existingPlan.userId !== session.user.id) {
      return NextResponse.json({ error: 'Secret plan not found' }, { status: 404 })
    }

    const updatedPlan = await prisma.secretPlan.update({
      where: { id },
      data: {
        title,
        description,
        budget,
        targetDate: targetDate ? new Date(targetDate) : null,
        progress
      }
    })

    return NextResponse.json(updatedPlan)
  } catch (error) {
    console.error('Error updating secret plan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/secret-plans/[id]
// Delete a secret plan
export async function DELETE( { params }: {params: {id: string}}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Verify ownership
    const existingPlan = await prisma.secretPlan.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!existingPlan || existingPlan.userId !== session.user.id) {
      return NextResponse.json({ error: 'Secret plan not found' }, { status: 404 })
    }

    // Delete related items first
    await prisma.secretPlanItem.deleteMany({
      where: { secretPlanId: id }
    })

    // Delete the plan
    await prisma.secretPlan.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Secret plan deleted successfully' })
  } catch (error) {
    console.error('Error deleting secret plan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
