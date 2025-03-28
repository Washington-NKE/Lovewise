// /app/dashboard/quiz/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type QuestionType = 'OPEN_ENDED' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE';

interface Question {
  id: string;
  content: string;
  questionType: QuestionType;
  options: string[];
}

export default function CreateQuizPage() {
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentQuestionType, setCurrentQuestionType] = useState<QuestionType>('OPEN_ENDED');
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addOption = () => {
    if (newOption.trim() && !currentOptions.includes(newOption.trim())) {
      setCurrentOptions([...currentOptions, newOption.trim()]);
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    setCurrentOptions(currentOptions.filter((_, i) => i !== index));
  };

  const addQuestion = () => {
    if (currentQuestion.trim()) {
      // Validation for multiple choice questions
      if (currentQuestionType === 'MULTIPLE_CHOICE' && currentOptions.length < 2) {
        setError('Multiple choice questions require at least 2 options');
        return;
      }

      const newQuestion: Question = {
        id: Date.now().toString(),
        content: currentQuestion.trim(),
        questionType: currentQuestionType,
        options: currentQuestionType === 'MULTIPLE_CHOICE' ? currentOptions : 
                 currentQuestionType === 'TRUE_FALSE' ? ['True', 'False'] : []
      };

      setQuestions([...questions, newQuestion]);
      setCurrentQuestion('');
      setCurrentQuestionType('OPEN_ENDED');
      setCurrentOptions([]);
      setError('');
    }
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Quiz title is required');
      return;
    }

    if (questions.length === 0) {
      setError('Add at least one question to your quiz');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          questions: questions.map(q => ({
            content: q.content,
            questionType: q.questionType,
            options: q.options.length > 0 ? q.options : null
          }))
        }),
      });

      if (response.ok) {
        router.push('/dashboard/quiz');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to create quiz');
      }
    } catch (error) {
      setError('An error occurred while creating the quiz');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Create a New Quiz</h1>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 mb-6 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-8">
          <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
            Quiz Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="What do you know about me?"
          />
        </div>

        <div className="mb-8">
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={3}
            placeholder="Test your partner's knowledge about your preferences and history..."
          />
        </div>

        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Add Questions</h2>

          <div className="mb-4">
            <label htmlFor="question" className="block text-gray-700 font-medium mb-2">
              Question
            </label>
            <input
              type="text"
              id="question"
              value={currentQuestion}
              onChange={e => setCurrentQuestion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="What's my favorite food?"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="questionType" className="block text-gray-700 font-medium mb-2">
              Question Type
            </label>
            <select
              id="questionType"
              value={currentQuestionType}
              onChange={e => setCurrentQuestionType(e.target.value as QuestionType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="OPEN_ENDED">Open Ended</option>
              <option value="MULTIPLE_CHOICE">Multiple Choice</option>
              <option value="TRUE_FALSE">True/False</option>
            </select>
          </div>

          {currentQuestionType === 'MULTIPLE_CHOICE' && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Options
              </label>
              
              <div className="flex mb-2">
                <input
                  type="text"
                  value={newOption}
                  onChange={e => setNewOption(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Add an option"
                />
                <button
                  type="button"
                  onClick={addOption}
                  className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700"
                >
                  Add
                </button>
              </div>

              {currentOptions.length > 0 && (
                <ul className="mt-2 space-y-2">
                  {currentOptions.map((option, index) => (
                    <li key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                      <span>{option}</span>
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={addQuestion}
            className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Add Question
          </button>
        </div>

        {questions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Questions Added ({questions.length})</h2>
            <ul className="space-y-4">
              {questions.map((question) => (
                <li key={question.id} className="bg-white p-4 rounded-lg border">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{question.content}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Type: {question.questionType.replace('_', ' ').toLowerCase()}
                      </p>
                      
                      {question.options.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Options:</p>
                          <ul className="mt-1 text-sm text-gray-700">
                            {question.options.map((option, i) => (
                              <li key={i}>• {option}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeQuestion(question.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard/quiz')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
}