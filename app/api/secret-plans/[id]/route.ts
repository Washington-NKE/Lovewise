// PUT /api/secret-plans/[id]
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
    const { title, description, budget, targetDate, progress } = body

    const existingPlan = await prisma.secretPlan.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!existingPlan || existingPlan.userId !== currentUser.id) {
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

    const existingPlan = await prisma.secretPlan.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!existingPlan || existingPlan.userId !== currentUser.id) {
      return NextResponse.json({ error: 'Secret plan not found' }, { status: 404 })
    }

    await prisma.secretPlanItem.deleteMany({
      where: { secretPlanId: id }
    })

    await prisma.secretPlan.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Secret plan deleted successfully' })
  } catch (error) {
    console.error('Error deleting secret plan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
