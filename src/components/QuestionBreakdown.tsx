"use client";

import { Quiz } from "@/types";

interface QuestionBreakdownProps {
  quiz: Quiz;
  selectedAttemptData: {
    attemptNumber: number;
    isCurrent?: boolean;
    answers: { [questionId: number]: string };
  };
  postQuizAnswers: { [questionId: number]: string };
}

export default function QuestionBreakdown({
  quiz,
  selectedAttemptData,
  postQuizAnswers,
}: QuestionBreakdownProps) {
  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold text-gray-900'>
        Question Breakdown
        <span className='ml-2 text-sm font-normal text-gray-500'>
          (Attempt {selectedAttemptData.attemptNumber})
        </span>
      </h3>
      <div className='space-y-3'>
        {quiz.questions.map((question) => {
          const answer = selectedAttemptData.isCurrent
            ? postQuizAnswers[question.id]
            : selectedAttemptData.answers[question.id];
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
  );
}
