"use client";

import { AlertCircle, Calendar, Trophy } from "lucide-react";

interface RetakeStatusData {
  canRetake: boolean;
  attemptsRemaining?: number;
  reason?: string;
  nextRetakeDate?: Date | string | number;
}

interface RetakeStatusProps {
  status: RetakeStatusData | null;
  formatTimeRemaining: (dateLike: Date | string | number) => string;
  onFixAttempts?: () => void;
  onCleanupAttempts?: () => void;
  onClearAllAttempts?: () => void;
  isDev?: boolean;
}

export default function RetakeStatus({
  status,
  formatTimeRemaining,
  onFixAttempts,
  onCleanupAttempts,
  onClearAllAttempts,
  isDev,
}: RetakeStatusProps) {
  if (!status) return null;

  return (
    <div className='bg-white rounded-2xl border border-gray-200 p-6 shadow-sm'>
      <div className='flex items-center gap-3 mb-4'>
        <Calendar className='h-5 w-5 text-blue-600' />
        <h3 className='text-lg font-semibold text-gray-900'>Retake Status</h3>
      </div>

      <div
        className={`p-4 rounded-xl ${
          status.canRetake
            ? "bg-green-50 border border-green-200"
            : "bg-yellow-50 border border-yellow-200"
        }`}
      >
        <div className='flex items-center gap-2 mb-2'>
          {status.canRetake ? (
            <Trophy className='h-4 w-4 text-green-600' />
          ) : (
            <AlertCircle className='h-4 w-4 text-yellow-600' />
          )}
          <span
            className={`font-semibold ${
              status.canRetake ? "text-green-800" : "text-yellow-800"
            }`}
          >
            {status.canRetake ? "Ready to Retake" : "Retake Not Available"}
          </span>
        </div>

        <div className='text-sm text-gray-700 mb-3'>
          {status.canRetake
            ? `You have ${status.attemptsRemaining} attempt(s) remaining.`
            : status.reason}
        </div>

        {status.nextRetakeDate && (
          <div className='text-sm text-gray-600'>
            Next retake available: {formatTimeRemaining(status.nextRetakeDate)}
          </div>
        )}

        {isDev && (
          <div className='mt-3 pt-3 border-t border-gray-300 space-y-2'>
            <div className='flex gap-2 flex-wrap'>
              <button
                onClick={onFixAttempts}
                className='px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors'
              >
                🔧 Fix Attempts
              </button>
              <button
                onClick={onCleanupAttempts}
                className='px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors'
              >
                🧹 Cleanup Duplicates
              </button>
              <button
                onClick={onClearAllAttempts}
                className='px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors'
              >
                🗑️ Clear All Attempts
              </button>
            </div>
            <div className='text-xs text-gray-500'>
              Fix: Recalculates isBestScore for existing attempts
              <br />
              Cleanup: Removes duplicates, keeps latest 5 per exam
              <br />
              Clear All: Removes all attempts (for testing)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
