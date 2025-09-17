"use client";

import { Exam } from "@/types";

interface ExamCardProps {
  exam: Exam;
  selectedExam: string | null;
  onStartExam: (examId: string) => void;
  onViewAuthor: (author: any) => void;
}

export default function ExamCard({
  exam,
  selectedExam,
  onStartExam,
  onViewAuthor,
}: ExamCardProps) {
  return (
    <div
      className={`relative w-full rounded-xl border border-gray-200 p-6 bg-white hover:shadow-lg hover:border-gray-300 transition-all duration-200 hover:-translate-y-0.5 ${
        selectedExam ? "opacity-50" : ""
      }`}
    >
      <div className='flex items-start justify-between mb-4'>
        <div className='flex-1'>
          <h3 className='text-lg font-bold text-gray-900 mb-2'>{exam.title}</h3>
          <p className='text-sm text-gray-600 mb-3'>{exam.description}</p>

          {/* Author Information */}
          {exam.author && (
            <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
              <div className='w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden'>
                {exam.author.profileImage ? (
                  <img
                    src={exam.author.profileImage}
                    alt={exam.author.name}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <span className='text-sm font-semibold text-gray-600'>
                    {exam.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                )}
              </div>
              <div className='flex-1 min-w-0'>
                <div className='text-sm font-semibold text-gray-900 truncate'>
                  {exam.author.name}
                </div>
                <div className='text-xs text-gray-600 truncate'>
                  {exam.author.title}
                </div>
              </div>
              <button
                onClick={() => onViewAuthor(exam.author!)}
                className='text-xs text-slate-600 hover:text-slate-800 font-medium'
              >
                View Profile
              </button>
            </div>
          )}
        </div>
        {exam.isNew && (
          <span className='absolute top-6 right-6 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full whitespace-nowrap ml-3'>
            New
          </span>
        )}
      </div>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-6 text-sm text-gray-500'>
          <span className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
            {exam.questions.length} questions
          </span>
          <span className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-gray-500 rounded-full'></div>
            {exam.totalPoints} points
          </span>
        </div>
        <button
          onClick={() => onStartExam(exam.id)}
          className='px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          disabled={!!selectedExam}
        >
          Start Exam
        </button>
      </div>
    </div>
  );
}
