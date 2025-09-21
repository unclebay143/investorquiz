"use client";

import { buttonStyles } from "@/lib/utils";
import { Exam } from "@/types";

interface ExamCardProps {
  exam: Exam;
  selectedExam: string | null;
  onStartExam: (examId: string) => void;
  onViewAuthor: (author: any) => void;
  onViewResult?: (examId: string) => void;
  buttonState?: "start" | "resume" | "view-result" | "retake" | "loading";
  attemptInfo?: {
    status: "none" | "in-progress" | "completed";
    attemptId?: string;
    attemptNumber?: number;
    canRetake?: boolean;
    attemptsRemaining?: number;
    nextRetakeDate?: string;
  };
}

export default function ExamCard({
  exam,
  selectedExam,
  onStartExam,
  onViewAuthor,
  onViewResult,
  buttonState = "start",
  attemptInfo,
}: ExamCardProps) {
  return (
    <div
      className={`group relative w-full rounded-2xl border border-gray-200/60 p-6 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 hover:bg-white ${
        selectedExam ? "opacity-50" : ""
      }`}
    >
      <div className='flex items-start justify-between mb-6'>
        <div className='flex-1'>
          <div className='flex items-center gap-3 mb-3'>
            <div className='w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full'></div>
            <h3 className='text-xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors duration-200'>
              {exam.title}
            </h3>
          </div>
          <p className='text-gray-600 mb-4 leading-relaxed'>
            {exam.description}
          </p>

          {/* Author Information */}
          {exam.author && (
            <div className='flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl border border-gray-100 group-hover:from-blue-50 group-hover:to-indigo-50/50 transition-all duration-200'>
              <div className='relative'>
                <div className='w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm'>
                  {exam.author.profileImage ? (
                    <img
                      src={exam.author.profileImage}
                      alt={exam.author.name}
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <span className='text-sm font-bold text-blue-700'>
                      {exam.author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  )}
                </div>
                <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white'></div>
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
                className='text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 bg-white/80 hover:bg-white rounded-lg border border-blue-200/50 hover:border-blue-300 transition-all duration-200'
              >
                View Profile
              </button>
            </div>
          )}
        </div>
        {exam.isNew && (
          <div className='absolute top-6 right-6'>
            <span className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full border border-green-200/50 shadow-sm'>
              <div className='w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse'></div>
              New
            </span>
          </div>
        )}
      </div>
      <div className='flex items-center justify-between pt-4 border-t border-gray-100'>
        <div className='flex items-center gap-8 text-sm'>
          <div className='flex items-center gap-2 text-gray-600'>
            <div className='w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full'></div>
            <span className='font-medium'>
              {exam.questions.length} questions
            </span>
          </div>
          <div className='flex items-center gap-2 text-gray-600'>
            <div className='w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full'></div>
            <span className='font-medium'>{exam.totalPoints} points</span>
          </div>
        </div>
        {buttonState === "view-result" && onViewResult ? (
          <button
            onClick={() => onViewResult(exam.id)}
            className={`${buttonStyles.success} text-sm font-semibold`}
          >
            <div className='flex items-center gap-2'>
              {/* <span>📊</span> */}
              <span>View Result</span>
            </div>
          </button>
        ) : buttonState === "loading" ? (
          <button
            disabled
            className={`${buttonStyles.disabled} text-sm font-semibold flex items-center gap-2`}
          >
            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
            <span>Loading...</span>
          </button>
        ) : (
          <button
            onClick={() => onStartExam(exam.id)}
            className={`text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
              buttonState === "resume"
                ? "group relative px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-500/20"
                : buttonState === "retake"
                ? "group relative px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/20"
                : buttonStyles.primary
            }`}
            disabled={!!selectedExam}
          >
            <div className='flex items-center gap-2'>
              {/* {buttonState === "resume" && <span>▶️</span>}
              {buttonState === "retake" && <span>🔄</span>}
              {buttonState === "start" && <span>🚀</span>} */}
              <span>
                {buttonState === "resume" && "Resume Exam"}
                {buttonState === "retake" &&
                  `Retake (${attemptInfo?.attemptsRemaining || 0} left)`}
                {buttonState === "start" && "Start Exam"}
              </span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
