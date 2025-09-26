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
}

export default function RetakeStatus({
  status,
  formatTimeRemaining,
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
      </div>
    </div>
  );
}
