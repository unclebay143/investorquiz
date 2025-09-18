"use client";

interface ResultsActionsProps {
  canRetake: boolean;
  onBackToExams: () => void;
  onRetakeExam: () => void;
}

export default function ResultsActions({
  canRetake,
  onBackToExams,
  onRetakeExam,
}: ResultsActionsProps) {
  return (
    <div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
      <button
        onClick={onBackToExams}
        className='flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
      >
        Back to Exams
      </button>

      {canRetake ? (
        <button
          onClick={onRetakeExam}
          className='flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
        >
          Retake Exam
        </button>
      ) : (
        <button
          disabled
          className='flex-1 py-3 px-6 bg-gray-300 text-gray-500 rounded-xl font-semibold cursor-not-allowed'
        >
          Retake Not Available
        </button>
      )}
    </div>
  );
}
