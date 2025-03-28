'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Question {
  id: string;
  content: string;
  questionType: string;
  options: string[] | null;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  creator: {
    id: string;
    name: string;
  };
  questions: Question[];
}

export default function TakeQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quizzes/${quizId}`);
        if (response.ok) {
          const data = await response.json();
          setQuiz(data);
          
          // Initialize answers object
          const initialAnswers: Record<string, string> = {};
          data.questions.forEach((question: Question) => {
            initialAnswers[question.id] = '';
          });
          setAnswers(initialAnswers);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to fetch quiz');
        }
      } catch (error) {
        setError('An error occurred while fetching the quiz');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

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

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 text-yellow-700 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Quiz Not Found</h2>
          <p>The quiz you&apos;re looking for doesn&apos;t exist or has no questions.</p>
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

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleAnswerChange = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value
    });
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    // Ensure all questions are answered
    const unansweredQuestions = quiz.questions.filter(q => !answers[q.id]);
    
    if (unansweredQuestions.length > 0) {
      if (!window.confirm(`You have ${unansweredQuestions.length} unanswered questions. Do you want to submit anyway?`)) {
        return;
      }
    }

    setSubmitting(true);

    try {
      const questionResponses = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer: answer || 'No answer provided'
      }));

      const response = await fetch(`/api/quizzes/${quizId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionResponses
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/quiz/${quizId}/response/${data.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to submit quiz');
        setSubmitting(false);
      }
    } catch (error) {
      setError('An error occurred while submitting the quiz');
      console.error(error);
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{quiz.title}</h1>
        {quiz.description && (
          <p className="text-gray-600 mt-2">{quiz.description}</p>
        )}
        <p className="text-sm text-gray-500 mt-2">
          Created by {quiz.creator.name}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </h2>
          <div className="text-sm text-gray-500">
            {currentQuestionIndex + 1} / {quiz.questions.length}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">{currentQuestion.content}</h3>

          {currentQuestion.questionType === 'MULTIPLE_CHOICE' && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <label key={index} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={answers[currentQuestion.id] === option}
                    onChange={() => handleAnswerChange(option)}
                    className="mr-3"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.questionType === 'TRUE_FALSE' && (
            <div className="space-y-3">
              <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value="True"
                  checked={answers[currentQuestion.id] === 'True'}
                  onChange={() => handleAnswerChange('True')}
                  className="mr-3"
                />
                <span>True</span>
              </label>
              <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value="False"
                  checked={answers[currentQuestion.id] === 'False'}
                  onChange={() => handleAnswerChange('False')}
                  className="mr-3"
                />
                <span>False</span>
              </label>
            </div>
          )}

          {currentQuestion.questionType === 'OPEN_ENDED' && (
            <textarea
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={4}
              placeholder="Type your answer here..."
            />
          )}
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <button
              type="button"
              onClick={goToNextQuestion}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>

      {/* Quiz progress */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap gap-2">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                index === currentQuestionIndex
                  ? 'bg-purple-600 text-white'
                  : answers[quiz.questions[index].id]
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}