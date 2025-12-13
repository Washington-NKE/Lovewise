// GET /api/secret-plans
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
// Get all secret plans for the authenticated user
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const secretPlans = await prisma.secretPlan.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(secretPlans)
  } catch (error) {
    console.error('Error fetching secret plans:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/secret-plans
// Create a new secret plan
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, budget, targetDate, progress } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const secretPlan = await prisma.secretPlan.create({
      data: {
        title,
        description,
        budget,
        targetDate: targetDate ? new Date(targetDate) : null,
        progress: progress || 0,
        userId: session.user.id
      }
    })

    return NextResponse.json(secretPlan)
  } catch (error) {
    console.error('Error creating secret plan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}