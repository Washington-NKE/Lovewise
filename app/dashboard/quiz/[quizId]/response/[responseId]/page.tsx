'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Heart, Calendar, ArrowLeft, FileText, Star, Bookmark } from "lucide-react";

interface Question {
  id: string;
  content: string;
  questionType: string;
  options: string[] | null;
}

interface QuestionResponse {
  id: string;
  answer: string;
  questionId: string;
  question: Question;
}

interface QuizResponseDetails {
  id: string;
  score: number | null;
  completedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  quiz: {
    id: string;
    title: string;
    description: string | null;
    creator: {
      id: string;
      name: string;
    };
  };
  questionResponses: QuestionResponse[];
}

export default function ResponseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;
  const responseId = params.responseId as string;

  const [details, setDetails] = useState<QuizResponseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResponseDetails = async () => {
      try {
        const response = await fetch(`/api/quizzes/${quizId}/responses/${responseId}`);
        if (response.ok) {
          const data = await response.json();
          setDetails(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to fetch response details');
        }
      } catch (error) {
        setError('An error occurred while fetching the response details');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (quizId && responseId) {
      fetchResponseDetails();
    }
  }, [quizId, responseId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-white to-purple-50">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
          <span className="text-sm text-gray-500 font-serif italic">Loading response details...</span>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-red-50 text-red-700 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error || 'Response not found'}</p>
          <Button
            onClick={() => router.push(`/dashboard/quiz/${quizId}`)}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Back to Quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => router.push(`/dashboard/quiz/${quizId}`)} className="text-rose-600 hover:text-rose-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quiz
        </Button>
      </div>

      <Card className="border-pink-200 bg-gradient-to-br from-rose-50 via-white to-purple-50 shadow-md">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-rose-600 bg-rose-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Quiz Response
              </span>
              <CardTitle className="text-3xl font-bold text-rose-900 mt-2">{details.quiz.title}</CardTitle>
              {details.quiz.description && (
                <CardDescription className="text-rose-800/70 text-sm mt-1">{details.quiz.description}</CardDescription>
              )}
            </div>
            {details.score !== null && (
              <div className="bg-purple-100 border border-purple-200 text-purple-800 px-4 py-2 rounded-xl text-center">
                <div className="text-2xl font-bold">{details.score}%</div>
                <div className="text-xs uppercase font-medium tracking-wider">Score</div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="border-t border-rose-100/50 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold">
              {details.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-rose-900">Completed by {details.user.name}</p>
              <p className="text-xs text-rose-700/60 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(details.completedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
              </p>
            </div>
          </div>
          <p className="text-xs text-rose-800/50 italic">
            Quiz created by {details.quiz.creator.name}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-rose-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-rose-500" />
          Answers Submitted
        </h2>

        <div className="space-y-4">
          {details.questionResponses.map((qr, index) => (
            <Card key={qr.id} className="border-rose-100/80 shadow-sm bg-white hover:border-rose-200/90 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-700 font-bold text-xs shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-rose-900 text-base">{qr.question.content}</h3>
                    <p className="text-xs text-rose-800/40 mt-1 uppercase tracking-wider font-medium">
                      Type: {qr.question.questionType.replace('_', ' ').toLowerCase()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2 pl-12">
                {qr.question.questionType === 'OPEN_ENDED' ? (
                  <div className="bg-rose-50/50 border-l-4 border-rose-400 p-3 rounded-r-lg italic text-rose-900">
                    "{qr.answer}"
                  </div>
                ) : (
                  <div className="grid gap-2 max-w-md">
                    {Array.isArray(qr.question.options) ? (
                      qr.question.options.map((option, oIdx) => {
                        const isSelected = qr.answer === option;
                        return (
                          <div
                            key={oIdx}
                            className={`flex items-center p-3 rounded-lg border text-sm transition-all ${
                              isSelected
                                ? 'bg-rose-100/60 border-rose-300 text-rose-900 font-semibold'
                                : 'bg-zinc-50/50 border-zinc-200 text-zinc-600'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${
                              isSelected ? 'border-rose-500 bg-rose-500 text-white' : 'border-zinc-300'
                            }`}>
                              {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                            <span>{option}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="bg-rose-50/50 border-l-4 border-rose-400 p-3 rounded-r-lg italic text-rose-900">
                        "{qr.answer}"
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
