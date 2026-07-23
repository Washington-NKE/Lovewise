import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
        creator: {
          select: {
            id: true,
            name: true
          }
        },
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            completedAt: 'desc'
          }
        },
        relationship: true
      }
    });

    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    // Verify the user has access to this quiz
    if (
      quiz.relationship.userId !== userId &&
      quiz.relationship.partnerId !== userId
    ) {
      return NextResponse.json({ message: 'You do not have access to this quiz' }, { status: 403 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        relationship: true
      }
    });

    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    // Only the creator can delete the quiz
    if (quiz.creatorId !== userId) {
      return NextResponse.json({ message: 'You do not have permission to delete this quiz' }, { status: 403 });
    }

    // Delete the quiz and all related records
    await prisma.quiz.delete({
      where: { id: quizId }
    });

    return NextResponse.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
