// /app/dashboard/quiz/[quizId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Question {
  id: string;
  content: string;
  questionType: string;
  options: string[] | null;
}

interface QuizResponse {
  id: string;
  completedAt: string;
  score: number | null;
  user: {
    id: string;
    name: string;
  };
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  questions: Question[];
  responses: QuizResponse[];
  creator: {
    id: string;
    name: string;
  };
}

export default function QuizDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const response = await fetch(`/api/quizzes/${quizId}`);
        if (response.ok) {
          const data = await response.json();
          setQuiz(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to fetch quiz details');
        }
      } catch (error) {
        setError('An error occurred while fetching the quiz');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuizDetails();
    }
  }, [quizId]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      setIsDeleting(true);
      
      try {
        const response = await fetch(`/api/quizzes/${quizId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          router.push('/dashboard/quiz');
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to delete quiz');
          setIsDeleting(false);
        }
      } catch (error) {
        setError('An error occurred while deleting the quiz');
        console.error(error);
        setIsDeleting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={() => router.push('/dashboard/quiz')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 text-yellow-700 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Quiz Not Found</h2>
          <p>The quiz you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
          <button
            onClick={() => router.push('/dashboard/quiz')}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-gray-600 mt-2">{quiz.description}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            Created by {quiz.creator.name} • {new Date(quiz.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <Link
            href={`/dashboard/quiz/${quizId}/take`}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Take Quiz
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Questions ({quiz.questions.length})</h2>
        
        {quiz.questions.length === 0 ? (
          <p className="text-gray-500">This quiz doesn&apos;t have any questions yet.</p>
        ) : (
          <ul className="space-y-6">
            {quiz.questions.map((question, index) => (
              <li key={question.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                <div className="flex">
                  <span className="font-bold text-purple-600 mr-3">{index + 1}.</span>
                  <div>
                    <p className="font-medium">{question.content}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Type: {question.questionType.replace('_', ' ').toLowerCase()}
                    </p>
                    
                    {question.options && question.options.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Options:</p>
                        <ul className="mt-1 text-sm text-gray-700 space-y-1">
                          {question.options.map((option, i) => (
                            <li key={i} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{option}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Partner Responses</h2>
        
        {quiz.responses.length === 0 ? (
          <p className="text-gray-500">Your partner hasn&apos;t taken this quiz yet.</p>
        ) : (
          <ul className="space-y-4">
            {quiz.responses.map((response) => (
              <li key={response.id} className="border p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{response.user.name}&apos;s Response</p>
                    <p className="text-sm text-gray-500">
                      Completed on {new Date(response.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {response.score !== null && (
                    <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                      Score: {response.score}%
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <Link
                    href={`/dashboard/quiz/${quizId}/response/${response.id}`}
                    className="text-purple-600 hover:text-purple-800 font-medium"
                  >
                    View Responses →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}