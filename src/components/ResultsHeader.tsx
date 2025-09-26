"use client";

import { Author, Quiz } from "@/types";
import { Trophy } from "lucide-react";

interface ResultsHeaderProps {
  quiz: Quiz;
  score: number;
  totalQuestions: number;
  gradeLetter: string;
  gradeColorClass: string; // e.g. 'from-green-500 to-emerald-600'
  isBestScore?: boolean;
  onViewAuthor: (author: Author) => void;
}

export default function ResultsHeader({
  quiz,
  score,
  totalQuestions,
  gradeLetter,
  gradeColorClass,
  isBestScore,
  onViewAuthor,
}: ResultsHeaderProps) {
  return (
    <div className='bg-white rounded-2xl border border-gray-200 p-5 sm:p-8 shadow-sm'>
      <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6 mb-4'>
        <div className='flex-1 min-w-0'>
          <div className='mb-1'>
            <h2 className='text-sm font-medium text-gray-500'>Your Score</h2>
          </div>
          <div className='flex items-center gap-3'>
            <div className='text-3xl sm:text-4xl font-bold text-gray-900 leading-none'>
              {score} / {totalQuestions}
            </div>
          </div>
          <div className='mt-3 text-sm sm:text-base text-gray-600 leading-relaxed'>
            <span className='font-semibold text-gray-800'>{quiz.title}</span>
            {quiz.description && (
              <span className='block mt-1 text-gray-600'>
                {quiz.description}
              </span>
            )}
          </div>
        </div>
        <div className='sm:ml-4 flex-shrink-0'>
          <div
            className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${gradeColorClass} rounded-2xl flex items-center justify-center shadow-lg`}
          >
            <span className='text-white font-bold text-xl sm:text-2xl'>
              {gradeLetter}
            </span>
          </div>
          {isBestScore && (
            <div className='mt-2 sm:text-center'>
              <span className='inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full'>
                <Trophy className='h-3 w-3' />
                Best Score
              </span>
            </div>
          )}
        </div>
      </div>

      {quiz.author && (
        <div className='bg-gray-50 rounded-xl p-4 border border-gray-100'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden'>
              {quiz.author.profileImage ? (
                <img
                  src={quiz.author.profileImage}
                  alt={quiz.author.name}
                  className='w-full h-full object-cover'
                />
              ) : (
                <span className='text-lg font-semibold text-gray-600'>
                  {quiz.author.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              )}
            </div>
            <div className='flex-1 min-w-0'>
              <div className='text-sm font-medium text-gray-900'>
                Created by {quiz.author.name}
              </div>
              {quiz.author.title && (
                <div className='text-xs text-gray-600'>{quiz.author.title}</div>
              )}
            </div>
            <button
              onClick={() => onViewAuthor(quiz.author!)}
              className='px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0'
            >
              View Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
