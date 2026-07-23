import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string; responseId: string }> }
) {
  try {
    const { quizId, responseId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch the quiz response with answers
    const quizResponse = await prisma.quizResponse.findUnique({
      where: { id: responseId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        quiz: {
          include: {
            creator: {
              select: { id: true, name: true }
            }
          }
        },
        questionResponses: {
          include: {
            question: true
          }
        }
      }
    });

    if (!quizResponse || quizResponse.quizId !== quizId) {
      return NextResponse.json({ message: 'Quiz response not found' }, { status: 404 });
    }

    // Verify access via relationship
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { relationship: true }
    });

    if (!quiz || (quiz.relationship.userId !== userId && quiz.relationship.partnerId !== userId)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(quizResponse);
  } catch (error) {
    console.error('Error fetching quiz response details:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
