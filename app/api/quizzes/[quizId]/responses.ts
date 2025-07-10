import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import {  Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await auth();

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = session.user.id;
  const quizId = req.query.quizId as string;

  // POST - Submit a quiz response
  if (req.method === 'POST') {
    try {
      const { questionResponses } = req.body;

      if (!Array.isArray(questionResponses) || questionResponses.length === 0) {
        return res.status(400).json({ message: 'Question responses are required' });
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
        return res.status(404).json({ message: 'Quiz not found' });
      }

      // Verify the user has access to this quiz
      if (
        quiz.relationship.userId !== userId &&
        quiz.relationship.partnerId !== userId
      ) {
        return res.status(403).json({ message: 'You do not have access to this quiz' });
      }

      // Create the quiz response and question responses in a transaction
      interface QuestionResponse {
        questionId: string;
        answer: string;
      }

      const response = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

      return res.status(201).json(response);
    } catch (error) {
      console.error('Error submitting quiz response:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}