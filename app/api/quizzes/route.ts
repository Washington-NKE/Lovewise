import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

interface QuizQuestion {
  content: string;
  questionType: string;
  options?: string[];
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Find the user's active relationship
    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [
          { userId: userId },
          { partnerId: userId }
        ],
        status: 'ACTIVE'
      },
    });

    if (!relationship) {
      return NextResponse.json({ message: 'No active relationship found' }, { status: 404 });
    }

    // Fetch quizzes for this relationship
    const quizzes = await prisma.quiz.findMany({
      where: {
        relationshipId: relationship.id
      },
      include: {
        _count: {
          select: {
            questions: true,
            responses: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { title, description, questions } = body;

    if (!title) {
      return NextResponse.json({ message: 'Quiz title is required' }, { status: 400 });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ message: 'At least one question is required' }, { status: 400 });
    }

    // Find the user's relationship
    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [
          { userId: userId },
          { partnerId: userId }
        ],
        status: 'ACTIVE'
      },
    });

    if (!relationship) {
      return NextResponse.json({ message: 'No active relationship found' }, { status: 404 });
    }

    // Create the quiz and questions in a transaction
    const quiz = await prisma.$transaction(async (tx) => {
      // Create the quiz
      const newQuiz = await tx.quiz.create({
        data: {
          title,
          description,
          creatorId: userId,
          relationshipId: relationship.id,
          questions: {
            create: questions.map((question: QuizQuestion) => ({
              content: question.content,
              questionType: question.questionType,
              options: question.options || null
            }))
          }
        },
        include: {
          questions: true
        }
      });

      return newQuiz;
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
