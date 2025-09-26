"use client";

import { buttonStyles } from "@/lib/utils";
import { Author, Quiz } from "@/types";

interface QuizCardProps {
  quiz: Quiz;
  selectedQuiz: string | null;
  onStartQuiz: (quizId: string) => void;
  onViewAuthor: (author: Author) => void;
  onViewResult?: (quizId: string) => void;
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

export default function QuizCard({
  quiz,
  selectedQuiz,
  onStartQuiz,
  onViewAuthor,
  onViewResult,
  buttonState = "start",
  attemptInfo,
}: QuizCardProps) {
  return (
    <div
      className={`group relative w-full rounded-2xl border border-gray-200/60 p-4 sm:p-6 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 hover:bg-white ${
        selectedQuiz ? "opacity-50" : ""
      }`}
    >
      <div className='flex items-start justify-between mb-4 sm:mb-6'>
        <div className='flex-1'>
          <div className='mb-2 sm:mb-3'>
            <div className="flex items-center gap-3 justify-between w-full">
              <div className="flex items-center gap-3">
            <div className='w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full'></div>
            <h3 className='text-lg pr-10 sm:text-xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors duration-200'>
              {quiz.title}
                </h3>
                </div>
               {/* Right-side actions (e.g., Retake link) */}
        {buttonState === "retake" && (
          <button
            onClick={() => onStartQuiz(quiz.id)}
            className='text-xs sm:text-sm font-semibold text-purple-700 hover:text-purple-900 underline underline-offset-4'
            aria-label='Retake quiz'
          >
            Retake ({attemptInfo?.attemptsRemaining || 0} left)
          </button>
        )}
            </div>
            {quiz.createdAt &&
              quiz.createdAt >
                new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                <span className='absolute right-1 top-1 sm:right-0 sm:top-0 sm:relative ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] sm:text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full border border-green-200/50 shadow-sm'>
                  <div className='hidden sm:block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse'></div>
                  New
                </span>
              )}
          </div>
          <p className='text-sm sm:text-base text-gray-600 leading-relaxed'>
            {quiz.description}
          </p>

          {/* Author Information */}
          {quiz.author && (
            <div className='flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl border border-gray-100 group-hover:from-blue-50 group-hover:to-indigo-50/50 transition-all duration-200'>
              <div className='relative'>
                <div className='w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm'>
                  {quiz.author.profileImage ? (
                    <img
                      src={quiz.author.profileImage}
                      alt={quiz.author.name}
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <span className='text-xs sm:text-sm font-bold text-blue-700'>
                      {quiz.author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  )}
                </div>
                <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white'></div>
              </div>
              <div className='flex-1 min-w-0'>
                <div className='text-xs sm:text-sm font-semibold text-gray-900 truncate'>
                  {quiz.author.name}
                </div>
                <div className='text-[11px] sm:text-xs text-gray-600 truncate'>
                  {quiz.author.title}
                </div>
              </div>
              <button
                onClick={() => onViewAuthor(quiz.author!)}
                className='hidden sm:inline-flex text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 bg-white/80 hover:bg-white rounded-lg border border-blue-200/50 hover:border-blue-300 transition-all duration-200'
              >
                View Profile
              </button>
            </div>
          )}
        </div>
       
        {/* New badge is now inline in the header row to avoid overlap */}
      </div>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 pt-4 border-t border-gray-100'>
        <div className='flex items-center gap-4 sm:gap-8 text-xs sm:text-sm'>
          <div className='flex items-center gap-2 text-gray-600'>
            <div className='w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full'></div>
            <span className='font-medium'>
              {quiz.questions.length} questions
            </span>
          </div>
          <div className='flex items-center gap-2 text-gray-600'>
            <div className='w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full'></div>
            <span className='font-medium'>{quiz.totalPoints} points</span>
          </div>
        </div>
        {buttonState === "view-result" && onViewResult ? (
          <button
            onClick={() => onViewResult(quiz.id)}
            className={`${buttonStyles.success} text-sm font-semibold w-full sm:w-auto flex justify-center`}
          >
            <div className='flex items-center gap-2'>
              {/* <span>📊</span> */}
              <span>View Result</span>
            </div>
          </button>
        ) : buttonState === "retake" ? (
          <div className='w-full sm:w-auto flex items-center justify-end'>
            {onViewResult && (
              <button
                onClick={() => onViewResult(quiz.id)}
                className={`${buttonStyles.success} text-sm font-semibold w-full sm:w-auto flex justify-center`}
              >
                <div className='flex items-center gap-2'>
                  <span>View Result</span>
                </div>
              </button>
            )}
          </div>
        ) : buttonState === "loading" ? (
          <button
            disabled
            className={`${buttonStyles.disabled} text-sm font-semibold flex items-center gap-2 w-full sm:w-auto justify-center`}
          >
            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
            <span>Loading...</span>
          </button>
        ) : (
          <button
            onClick={() => onStartQuiz(quiz.id)}
            className={`text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full sm:w-auto flex justify-center ${
              buttonState === "resume"
                ? "group relative px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-500/20"
                : buttonStyles.primary
            }`}
            disabled={!!selectedQuiz}
          >
            <div className='flex items-center gap-2'>
              {/* {buttonState === "resume" && <span>▶️</span>}
              {buttonState === "retake" && <span>🔄</span>}
              {buttonState === "start" && <span>🚀</span>} */}
              <span>
                {buttonState === "resume" && "Resume Quiz"}
                {buttonState === "start" && "Start Quiz"}
              </span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
