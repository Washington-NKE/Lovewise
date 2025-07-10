import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { auth } from '@/lib/auth';

interface QuizQuestion {
  content: string;
  questionType: string;
  options?: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await auth();

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = session.user.id;

  // GET - Fetch all quizzes for the user's relationship
  if (req.method === 'GET') {
    try {
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
        return res.status(404).json({ message: 'No active relationship found' });
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

      return res.status(200).json(quizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // POST - Create a new quiz
  if (req.method === 'POST') {
    try {
      const { title, description, questions } = req.body;

      if (!title) {
        return res.status(400).json({ message: 'Quiz title is required' });
      }

      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ message: 'At least one question is required' });
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
        return res.status(404).json({ message: 'No active relationship found' });
      }

      // Create the quiz and questions in a transaction
      const quiz = await prisma.$transaction(async (prisma) => {
        // Create the quiz
        const quiz = await prisma.quiz.create({
          data: {
            title,
            description,
            creatorId: userId,
            relationshipId: relationship.id,
            questions: {
              create: questions.map((question: QuizQuestion) => ({
                content: question.content,
                questionType: question.questionType,
                options: question.options
              }))
            }
          },
          include: {
            questions: true
          }
        });

        return quiz;
      });

      return res.status(201).json(quiz);
    } catch (error) {
      console.error('Error creating quiz:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}