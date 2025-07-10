import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { auth } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await auth();

  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = session.user.id;
  const quizId = req.query.quizId as string;

  // GET - Fetch a specific quiz
  if (req.method === 'GET') {
    try {
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
        return res.status(404).json({ message: 'Quiz not found' });
      }

      // Verify the user has access to this quiz
      if (
        quiz.relationship.userId !== userId &&
        quiz.relationship.partnerId !== userId
      ) {
        return res.status(403).json({ message: 'You do not have access to this quiz' });
      }

      return res.status(200).json(quiz);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // DELETE - Delete a quiz
  if (req.method === 'DELETE') {
    try {
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          relationship: true
        }
      });

      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }

      // Only the creator can delete the quiz
      if (quiz.creatorId !== userId) {
        return res.status(403).json({ message: 'You do not have permission to delete this quiz' });
      }

      // Delete the quiz and all related records
      await prisma.quiz.delete({
        where: { id: quizId }
      });

      return res.status(200).json({ message: 'Quiz deleted successfully' });
    } catch (error) {
      console.error('Error deleting quiz:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
