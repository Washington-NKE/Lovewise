'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Quiz {
    id: string;
    title: string;
    description: string | null;
    createdAt: string;
    _count: {
        questions: number;
        responses: number;
    };
}

export default function QuizPage() {
    const { data: session} = useSession();
    const router = useRouter();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuizzes = async () => {
            if(!session?.user) return;

            try{
                const response = await fetch('/api/quizzes');
                if(response.ok){
                    const data = await response.json();
                    setQuizzes(data);
                }
            } catch (error){
                console.error('Failed to fetch quizzes', error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuizzes();
    }, [session]);

    if (loading) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Relationship Quizzes</h1>
        <button
          onClick={() => router.push('/dashboard/quiz/create')}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Create New Quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium text-gray-600 mb-4">No quizzes yet</h3>
          <p className="text-gray-500 mb-6">Create your first quiz to learn more about each other!</p>
          <button
            onClick={() => router.push('/dashboard/quiz/create')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Create Your First Quiz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{quiz.title}</h3>
                {quiz.description && (
                  <p className="text-gray-600 mb-4 line-clamp-2">{quiz.description}</p>
                )}
                <div className="flex text-sm text-gray-500 mb-4">
                  <div className="mr-4">
                    <span className="font-medium">{quiz._count.questions}</span> questions
                  </div>
                  <div>
                    <span className="font-medium">{quiz._count.responses}</span> responses
                  </div>
                </div>
                <div className="flex justify-between mt-4">
                  <Link
                    href={`/dashboard/quiz/${quiz.id}`}
                    className="text-purple-600 hover:text-purple-800 font-medium"
                  >
                    View Quiz
                  </Link>
                  <Link
                    href={`/dashboard/quiz/${quiz.id}/take`}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-1 px-3 rounded transition-colors"
                  >
                    Take Quiz
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    );
}