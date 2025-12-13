// GET /api/secret-plan-items
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
// Get all secret plan items for the authenticated user
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const secretPlanItems = await prisma.secretPlanItem.findMany({
      where: {
        plan: {
          userId: session.user.id
        }
      },
      include: {
        plan: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(secretPlanItems)
  } catch (error) {
    console.error('Error fetching secret plan items:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/secret-plan-items
// Create a new secret plan item
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { secretPlanId, item, cost, notes } = body

    if (!secretPlanId || !item) {
      return NextResponse.json({ error: 'Secret plan ID and item are required' }, { status: 400 })
    }

    // Verify the secret plan belongs to the user
    const secretPlan = await prisma.secretPlan.findUnique({
      where: { id: secretPlanId },
      select: { userId: true }
    })

    if (!secretPlan || secretPlan.userId !== session.user.id) {
      return NextResponse.json({ error: 'Secret plan not found' }, { status: 404 })
    }

    const secretPlanItem = await prisma.secretPlanItem.create({
      data: {
        secretPlanId,
        item,
        cost,
        notes,
        completed: false
      }
    })

    return NextResponse.json(secretPlanItem)
  } catch (error) {
    console.error('Error creating secret plan item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}