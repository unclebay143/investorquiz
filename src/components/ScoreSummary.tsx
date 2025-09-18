"use client";

import { Clock } from "lucide-react";

interface ScoreSummaryProps {
  points: { scored: number; total: number };
  correctCount: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  performancePercent: number;
  gradeLetter: string;
  gradeColorClass: string; // gradient tailwind class suffix
}

export default function ScoreSummary({
  points,
  correctCount,
  totalQuestions,
  timeSpentSeconds,
  performancePercent,
  gradeLetter,
  gradeColorClass,
}: ScoreSummaryProps) {
  return (
    <div className='bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-lg'>
      <div className='text-center mb-6'>
        <h3 className='text-lg font-semibold text-gray-700 mb-2'>
          Exam Summary
        </h3>
        <div className='w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto'></div>
      </div>

      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
        <div className='bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200'>
          <div className='text-center'>
            <div className='inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-3'>
              <span className='text-white font-bold text-lg'>P</span>
            </div>
            <div className='text-2xl sm:text-3xl font-bold text-gray-900 mb-1'>
              {points.scored}
              <span className='text-sm sm:text-base text-gray-500 font-normal'>
                /{points.total}
              </span>
            </div>
            <div className='text-xs sm:text-sm text-gray-600 font-medium'>
              Points
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200'>
          <div className='text-center'>
            <div className='inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-3'>
              <span className='text-white font-bold text-lg'>✓</span>
            </div>
            <div className='text-2xl sm:text-3xl font-bold text-green-600 mb-1'>
              {correctCount}
              <span className='text-sm sm:text-base text-gray-500 font-normal'>
                /{totalQuestions}
              </span>
            </div>
            <div className='text-xs sm:text-sm text-gray-600 font-medium'>
              Correct
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200'>
          <div className='text-center'>
            <div className='inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full mb-3'>
              <span className='text-white font-bold text-lg'>✗</span>
            </div>
            <div className='text-2xl sm:text-3xl font-bold text-red-600 mb-1'>
              {totalQuestions - correctCount}
              <span className='text-sm sm:text-base text-gray-500 font-normal'>
                /{totalQuestions}
              </span>
            </div>
            <div className='text-xs sm:text-sm text-gray-600 font-medium'>
              Incorrect
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200'>
          <div className='text-center'>
            <div className='inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full mb-3'>
              <Clock className='h-6 w-6 text-white' />
            </div>
            <div className='text-2xl sm:text-3xl font-bold text-purple-600 mb-1 font-mono'>
              {Math.floor(timeSpentSeconds / 60)}:
              {(timeSpentSeconds % 60).toString().padStart(2, "0")}
            </div>
            <div className='text-xs sm:text-sm text-gray-600 font-medium'>
              Time Spent
            </div>
          </div>
        </div>
      </div>

      <div className='mt-6 pt-6 border-t border-gray-200'>
        <div className='flex items-center justify-between text-sm text-gray-600 mb-2'>
          <span>Performance</span>
          <div className='flex items-center space-x-3'>
            <span className='font-semibold'>
              {Math.round(performancePercent)}%
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${gradeColorClass}`}
            >
              {gradeLetter}
            </span>
          </div>
        </div>
        <div className='w-full bg-gray-200 rounded-full h-2'>
          <div
            className={`h-2 rounded-full transition-all duration-500 bg-gradient-to-r ${gradeColorClass}`}
            style={{ width: `${performancePercent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
