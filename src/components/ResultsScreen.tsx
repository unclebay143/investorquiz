"use client";

import { Exam } from "@/types";
import { Clock } from "lucide-react";

interface ResultsScreenProps {
  exam: Exam;
  score: number;
  timeSpent: number;
  postExamAnswers: { [questionId: number]: string };
  onBackToExams: () => void;
  onViewAuthor: (author: any) => void;
}

export default function ResultsScreen({
  exam,
  score,
  timeSpent,
  postExamAnswers,
  onBackToExams,
  onViewAuthor,
}: ResultsScreenProps) {
  const correctCount = exam.questions.filter(
    (q) => postExamAnswers[q.id] === q.correctKey
  ).length;
  const incorrectCount = exam.questions.length - correctCount;

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>Results</h2>
        <div className='text-sm text-gray-600'>
          <span className='font-medium'>{exam.title}</span>
          {exam.description && (
            <span className='ml-2'>• {exam.description}</span>
          )}
        </div>
        {exam.author && (
          <div className='text-xs text-gray-500 mt-1'>
            Created by <span className='font-medium'>{exam.author.name}</span>
            {exam.author.title && (
              <span className='ml-1'>• {exam.author.title}</span>
            )}
            <span className='mx-1'>•</span>
            <button
              onClick={() => onViewAuthor(exam.author!)}
              className='text-xs text-blue-600 hover:text-blue-800 font-medium'
            >
              View Profile
            </button>
          </div>
        )}
      </div>

      {/* Score Summary */}
      <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-sm'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='text-center'>
            <div className='text-3xl font-bold text-gray-900'>
              {score}
              <span className='text-lg text-gray-500'>/{exam.totalPoints}</span>
            </div>
            <div className='text-sm text-gray-600'>Points</div>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-bold text-green-600'>
              {correctCount}
              <span className='text-lg text-gray-500'>
                /{exam.questions.length}
              </span>
            </div>
            <div className='text-sm text-gray-600'>Correct</div>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-bold text-red-600'>
              {incorrectCount}
              <span className='text-lg text-gray-500'>
                /{exam.questions.length}
              </span>
            </div>
            <div className='text-sm text-gray-600'>Incorrect</div>
          </div>
          <div className='text-center'>
            <div className='flex items-center justify-center gap-2 text-3xl font-bold text-blue-600'>
              <Clock className='h-8 w-8' />
              <span className='font-mono'>
                {Math.floor(timeSpent / 60)}:
                {(timeSpent % 60).toString().padStart(2, "0")}
              </span>
            </div>
            <div className='text-sm text-gray-600'>Time Spent</div>
          </div>
        </div>
      </div>

      {/* Question Breakdown */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-gray-900'>
          Question Breakdown
        </h3>
        <div className='space-y-3'>
          {exam.questions.map((question) => {
            const answer = postExamAnswers[question.id];
            const correct = answer === question.correctKey;
            return (
              <div
                key={question.id}
                className={`rounded-xl border-2 p-5 shadow-sm ${
                  correct
                    ? "border-green-300 bg-green-50"
                    : "border-red-300 bg-red-50"
                }`}
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded-full ${
                          correct
                            ? "bg-green-200 text-green-800"
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        {correct ? "✓ Correct" : "✗ Incorrect"}
                      </span>
                      <span className='text-sm font-medium text-gray-600'>
                        Question {question.id}
                      </span>
                    </div>
                    <div className='text-base font-semibold text-gray-900 mb-3'>
                      {question.prompt}
                    </div>
                  </div>
                </div>

                <div className='space-y-3'>
                  <div
                    className={`p-3 rounded-lg border ${
                      correct
                        ? "bg-white border-green-200"
                        : "bg-white border-red-200"
                    }`}
                  >
                    <div className='text-sm font-medium text-gray-600 mb-1'>
                      Your answer
                    </div>
                    <div
                      className={`text-sm font-semibold ${
                        correct ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      {answer
                        ? `${answer}. ${
                            question.options[
                              answer as keyof typeof question.options
                            ]
                          }`
                        : "—"}
                    </div>
                  </div>

                  <div className='p-3 rounded-lg border bg-green-50 border-green-200'>
                    <div className='text-sm font-medium text-green-700 mb-1'>
                      Correct answer
                    </div>
                    <div className='text-sm font-semibold text-green-800'>
                      {question.correctKey}.{" "}
                      {
                        question.options[
                          question.correctKey as keyof typeof question.options
                        ]
                      }
                    </div>
                  </div>

                  {question.explanation && (
                    <div className='p-4 rounded-lg border bg-blue-50 border-blue-200'>
                      <div className='text-sm font-semibold text-blue-800 mb-2'>
                        Explanation
                      </div>
                      <div className='text-sm text-blue-900 leading-relaxed'>
                        {question.explanation}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onBackToExams}
        className='w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors'
      >
        Back to exams
      </button>
    </div>
  );
}
