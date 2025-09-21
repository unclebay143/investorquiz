"use client";

import { Exam } from "@/types";
import { Trophy } from "lucide-react";

interface ResultsHeaderProps {
  exam: Exam;
  gradeLetter: string;
  gradeColorClass: string; // e.g. 'from-green-500 to-emerald-600'
  isBestScore?: boolean;
  onViewAuthor: (author: any) => void;
}

export default function ResultsHeader({
  exam,
  gradeLetter,
  gradeColorClass,
  isBestScore,
  onViewAuthor,
}: ResultsHeaderProps) {
  return (
    <div className='bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm'>
      <div className='flex items-start justify-between mb-4'>
        <div className='flex-1'>
          <div className='mb-3'>
            <h2 className='text-2xl sm:text-3xl font-bold text-gray-900'>
              Results
            </h2>
          </div>
          <div className='text-sm sm:text-base text-gray-600 leading-relaxed'>
            <span className='font-semibold text-gray-800'>{exam.title}</span>
            {exam.description && (
              <span className='block mt-1 text-gray-600'>
                {exam.description}
              </span>
            )}
          </div>
        </div>
        <div className='ml-4 flex-shrink-0'>
          <div
            className={`w-16 h-16 bg-gradient-to-br ${gradeColorClass} rounded-2xl flex items-center justify-center shadow-lg`}
          >
            <span className='text-white font-bold text-2xl'>{gradeLetter}</span>
          </div>
          {isBestScore && (
            <div className='mt-2 text-center'>
              <span className='inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full'>
                <Trophy className='h-3 w-3' />
                Best Score
              </span>
            </div>
          )}
        </div>
      </div>

      {exam.author && (
        <div className='bg-gray-50 rounded-xl p-4 border border-gray-100'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden'>
              {exam.author.profileImage ? (
                <img
                  src={exam.author.profileImage}
                  alt={exam.author.name}
                  className='w-full h-full object-cover'
                />
              ) : (
                <span className='text-lg font-semibold text-gray-600'>
                  {exam.author.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              )}
            </div>
            <div className='flex-1 min-w-0'>
              <div className='text-sm font-medium text-gray-900'>
                Created by {exam.author.name}
              </div>
              {exam.author.title && (
                <div className='text-xs text-gray-600'>{exam.author.title}</div>
              )}
            </div>
            <button
              onClick={() => onViewAuthor(exam.author!)}
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
