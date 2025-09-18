"use client";

import { Trophy } from "lucide-react";

interface AttemptTabsProps {
  attempts: Array<{
    attemptNumber: number;
    isBestScore?: boolean;
  }>;
  selectedAttempt: number;
  onSelect: (attemptNumber: number) => void;
}

export default function AttemptTabs({
  attempts,
  selectedAttempt,
  onSelect,
}: AttemptTabsProps) {
  if (!attempts || attempts.length <= 1) return null;

  return (
    <div className='flex items-center gap-2'>
      <div className='flex gap-1'>
        {attempts.map((attempt) => (
          <button
            key={attempt.attemptNumber}
            onClick={() => onSelect(attempt.attemptNumber)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedAttempt === attempt.attemptNumber
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {`Attempt ${attempt.attemptNumber}`}
            {attempt.isBestScore && <Trophy className='inline h-3 w-3 ml-1' />}
          </button>
        ))}
      </div>
    </div>
  );
}
