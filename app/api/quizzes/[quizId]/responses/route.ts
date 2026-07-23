import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

interface QuestionResponse {
  questionId: string;
  answer: string;
}

export async function POST(
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
    const body = await request.json();
    const { questionResponses } = body;

    if (!Array.isArray(questionResponses) || questionResponses.length === 0) {
      return NextResponse.json({ message: 'Question responses are required' }, { status: 400 });
    }

    // Verify the quiz exists and user has access
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
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

    // Create the quiz response and question responses in a transaction
    const response = await prisma.$transaction(async (tx) => {
      // Create the quiz response
      const quizResponse = await tx.quizResponse.create({
        data: {
          quizId,
          userId,
          questionResponses: {
            create: questionResponses.map((qr: QuestionResponse) => ({
              questionId: qr.questionId,
              answer: qr.answer
            }))
          }
        }
      });

      return quizResponse;
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error submitting quiz response:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
