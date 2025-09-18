"use client";

import {
  calculateGrade,
  cleanupAttempts,
  clearAllAttempts,
  formatTimeRemaining,
  getRetakeStatus,
} from "@/lib/retakeUtils";
import { Exam, ExamAttempts, RetakeStatus } from "@/types";
import { AlertCircle, Calendar, Clock, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import ResultsHeader from "./ResultsHeader";

interface ResultsScreenProps {
  exam: Exam;
  score: number;
  timeSpentInSeconds: number;
  postExamAnswers: { [questionId: number]: string };
  shuffledQuestions?: {
    [questionId: number]: {
      shuffledOptions: { [key: string]: string };
      keyMapping: { [key: string]: string };
      correctShuffledKey: string;
    };
  };
  topicId: string;
  onBackToExams: () => void;
  onViewAuthor: (author: any) => void;
  onRetakeExam: () => void;
  attempts?: ExamAttempts; // Optional for backward compatibility
}

export default function ResultsScreen({
  exam,
  score,
  timeSpentInSeconds,
  postExamAnswers,
  shuffledQuestions = {},
  topicId,
  onBackToExams,
  onViewAuthor,
  onRetakeExam,
  attempts: propAttempts,
}: ResultsScreenProps) {
  const correctCount = exam.questions.filter(
    (q) => postExamAnswers[q.id] === q.correctKey
  ).length;
  const incorrectCount = exam.questions.length - correctCount;

  // Calculate grade based on percentage
  const percentage = (correctCount / exam.questions.length) * 100;
  const gradeInfo = calculateGrade(percentage);

  // State for attempt history and retake status
  const [attempts, setAttempts] = useState<ExamAttempts>({});
  const [retakeStatus, setRetakeStatus] = useState<RetakeStatus | null>(null);
  const [selectedAttempt, setSelectedAttempt] = useState<number>(1); // 1+ = attempt numbers

  // Load attempts from localStorage or use prop
  useEffect(() => {
    if (propAttempts) {
      setAttempts(propAttempts);
    } else {
      const savedAttempts = localStorage.getItem("exam-attempts");
      if (savedAttempts) {
        const parsedAttempts = JSON.parse(savedAttempts);
        console.log("Loading attempts from localStorage:", parsedAttempts);

        // Auto-fix attempts if they have incorrect isBestScore values
        const examKey = `${topicId}-${exam.id}`;
        const examAttempts = parsedAttempts[examKey] || [];

        if (examAttempts.length > 0) {
          // Check if any attempt has isBestScore: true
          const hasBestScore = examAttempts.some(
            (attempt: any) => attempt.isBestScore === true
          );

          if (!hasBestScore) {
            console.log("No best score found, auto-fixing attempts...");
            // Auto-fix the attempts
            const sortedAttempts = [...examAttempts].sort(
              (a, b) => a.attemptNumber - b.attemptNumber
            );
            let bestScoreSoFar = -1;
            const fixedAttempts = sortedAttempts.map((attempt) => {
              const isBest = attempt.score > bestScoreSoFar;
              if (isBest) {
                bestScoreSoFar = attempt.score;
              }
              return {
                ...attempt,
                isBestScore: isBest,
              };
            });

            const updatedAttempts = {
              ...parsedAttempts,
              [examKey]: fixedAttempts,
            };

            setAttempts(updatedAttempts);
            localStorage.setItem(
              "exam-attempts",
              JSON.stringify(updatedAttempts)
            );
            console.log("Auto-fixed attempts:", fixedAttempts);
            return;
          }
        }

        setAttempts(parsedAttempts);
      }
    }
  }, [propAttempts, topicId, exam.id]);

  // Set selectedAttempt to the latest attempt when attempts are loaded
  useEffect(() => {
    const examAttempts = attempts[`${topicId}-${exam.id}`] || [];
    if (examAttempts.length > 0) {
      const latestAttempt = examAttempts.sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      )[0];
      setSelectedAttempt(latestAttempt.attemptNumber);
    }
  }, [attempts, topicId, exam.id]);

  // Update retake status when attempts change
  useEffect(() => {
    const status = getRetakeStatus(exam, topicId, attempts);
    setRetakeStatus(status);
  }, [exam, topicId, attempts]);

  // Cleanup function for testing
  const handleCleanupAttempts = () => {
    const cleanedAttempts = cleanupAttempts(attempts, 5);
    setAttempts(cleanedAttempts);
    localStorage.setItem("exam-attempts", JSON.stringify(cleanedAttempts));
  };

  // Clear all attempts for testing
  const handleClearAllAttempts = () => {
    clearAllAttempts();
    setAttempts({});
    window.location.reload(); // Refresh to see changes
  };

  // Fix existing attempts data (recalculate isBestScore)
  const handleFixAttempts = () => {
    const examKey = `${topicId}-${exam.id}`;
    const examAttempts = attempts[examKey] || [];

    if (examAttempts.length === 0) return;

    // Sort by attempt number to process in order
    const sortedAttempts = [...examAttempts].sort(
      (a, b) => a.attemptNumber - b.attemptNumber
    );

    // Recalculate isBestScore for each attempt
    let bestScoreSoFar = -1;
    const fixedAttempts = sortedAttempts.map((attempt) => {
      const isBest = attempt.score > bestScoreSoFar;
      if (isBest) {
        bestScoreSoFar = attempt.score;
      }
      return {
        ...attempt,
        isBestScore: isBest,
      };
    });

    const updatedAttempts = {
      ...attempts,
      [examKey]: fixedAttempts,
    };

    setAttempts(updatedAttempts);
    localStorage.setItem("exam-attempts", JSON.stringify(updatedAttempts));
    console.log("Fixed attempts data:", fixedAttempts);
  };

  // Get saved attempts (current attempt should already be saved)
  const examAttempts = attempts[`${topicId}-${exam.id}`] || [];
  const allAttempts = examAttempts
    .map((attempt) => ({
      ...attempt,
      isCurrent: false,
    }))
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

  // Debug logging
  console.log("ResultsScreen - allAttempts:", allAttempts);
  console.log("ResultsScreen - examAttempts:", examAttempts);
  allAttempts.forEach((attempt, index) => {
    console.log(`Attempt ${index + 1}:`, {
      attemptNumber: attempt.attemptNumber,
      score: attempt.score,
      isBestScore: attempt.isBestScore,
      timeSpentInSeconds: attempt.timeSpentInSeconds,
    });
  });

  // Get the selected attempt data
  const selectedAttemptData =
    allAttempts.find((attempt) => attempt.attemptNumber === selectedAttempt) ||
    allAttempts[0]; // Fallback to first attempt if not found

  // Calculate stats for selected attempt (with fallback to current exam data)
  const selectedCorrectCount = selectedAttemptData
    ? exam.questions.filter(
        (q) => (selectedAttemptData as any).answers[q.id] === q.correctKey
      ).length
    : correctCount; // Fallback to current exam stats
  const selectedIncorrectCount = exam.questions.length - selectedCorrectCount;
  const selectedPercentage =
    (selectedCorrectCount / exam.questions.length) * 100;
  const selectedGradeInfo = calculateGrade(selectedPercentage);

  // If no attempts exist, show a message
  if (allAttempts.length === 0) {
    return (
      <div className='space-y-6'>
        <div className='bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm'>
          <div className='text-center'>
            <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-4'>
              No Attempts Found
            </h2>
            <p className='text-gray-600 mb-6'>
              No exam attempts were found. Please complete an exam first.
            </p>
            <button
              onClick={onBackToExams}
              className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              Back to Exams
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {allAttempts.length > 1 && (
        <div className='flex items-center gap-2'>
          <div className='flex gap-1'>
            {allAttempts.map((attempt, index) => (
              <button
                key={attempt.attemptNumber}
                onClick={() => setSelectedAttempt(attempt.attemptNumber)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedAttempt === attempt.attemptNumber
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {`Attempt ${attempt.attemptNumber}`}
                {attempt.isBestScore && (
                  <Trophy className='inline h-3 w-3 ml-1' />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      <ResultsHeader
        exam={exam}
        gradeLetter={selectedGradeInfo.grade}
        gradeColorClass={selectedGradeInfo.color}
        isBestScore={!!selectedAttemptData.isBestScore}
        onViewAuthor={onViewAuthor}
      />

      {/* Score Summary */}
      <div className='bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-lg'>
        <div className='text-center mb-6'>
          <h3 className='text-lg font-semibold text-gray-700 mb-2'>
            Exam Summary
          </h3>
          <div className='w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto'></div>
        </div>

        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
          {/* Points Card */}
          <div className='bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200'>
            <div className='text-center'>
              <div className='inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-3'>
                <span className='text-white font-bold text-lg'>P</span>
              </div>
              <div className='text-2xl sm:text-3xl font-bold text-gray-900 mb-1'>
                {selectedAttemptData.score}
                <span className='text-sm sm:text-base text-gray-500 font-normal'>
                  /{exam.totalPoints}
                </span>
              </div>
              <div className='text-xs sm:text-sm text-gray-600 font-medium'>
                Points
              </div>
            </div>
          </div>

          {/* Correct Card */}
          <div className='bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200'>
            <div className='text-center'>
              <div className='inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-3'>
                <span className='text-white font-bold text-lg'>✓</span>
              </div>
              <div className='text-2xl sm:text-3xl font-bold text-green-600 mb-1'>
                {selectedCorrectCount}
                <span className='text-sm sm:text-base text-gray-500 font-normal'>
                  /{exam.questions.length}
                </span>
              </div>
              <div className='text-xs sm:text-sm text-gray-600 font-medium'>
                Correct
              </div>
            </div>
          </div>

          {/* Incorrect Card */}
          <div className='bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200'>
            <div className='text-center'>
              <div className='inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full mb-3'>
                <span className='text-white font-bold text-lg'>✗</span>
              </div>
              <div className='text-2xl sm:text-3xl font-bold text-red-600 mb-1'>
                {selectedIncorrectCount}
                <span className='text-sm sm:text-base text-gray-500 font-normal'>
                  /{exam.questions.length}
                </span>
              </div>
              <div className='text-xs sm:text-sm text-gray-600 font-medium'>
                Incorrect
              </div>
            </div>
          </div>

          {/* Time Card */}
          <div className='bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200'>
            <div className='text-center'>
              <div className='inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full mb-3'>
                <Clock className='h-6 w-6 text-white' />
              </div>
              <div className='text-2xl sm:text-3xl font-bold text-purple-600 mb-1 font-mono'>
                {Math.floor(selectedAttemptData.timeSpentInSeconds / 60)}:
                {(selectedAttemptData.timeSpentInSeconds % 60)
                  .toString()
                  .padStart(2, "0")}
              </div>
              <div className='text-xs sm:text-sm text-gray-600 font-medium'>
                Time Spent
              </div>
            </div>
          </div>
        </div>

        {/* Performance Bar */}
        <div className='mt-6 pt-6 border-t border-gray-200'>
          <div className='flex items-center justify-between text-sm text-gray-600 mb-2'>
            <span>Performance</span>
            <div className='flex items-center space-x-3'>
              <span className='font-semibold'>
                {Math.round(selectedPercentage)}%
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${selectedGradeInfo.color}`}
              >
                {selectedGradeInfo.grade}
              </span>
            </div>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className={`h-2 rounded-full transition-all duration-500 bg-gradient-to-r ${selectedGradeInfo.color}`}
              style={{
                width: `${selectedPercentage}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Breakdown */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-gray-900'>
          Question Breakdown
          {allAttempts.length > 1 ? (
            <span className='ml-2 text-sm font-normal text-gray-500'>
              (Attempt {selectedAttemptData.attemptNumber})
            </span>
          ) : null}
        </h3>
        <div className='space-y-3'>
          {exam.questions.map((question) => {
            const answerOriginalKey = selectedAttemptData.isCurrent
              ? postExamAnswers[question.id]
              : (selectedAttemptData as any).answers?.[question.id] ??
                postExamAnswers[question.id];
            const correct = answerOriginalKey === question.correctKey;
            const shuffled = shuffledQuestions[question.id];
            // Map original to shuffled key label for display when available
            const displaySelectedKey = shuffled
              ? Object.keys(shuffled.keyMapping).find(
                  (shuffledKey) =>
                    shuffled.keyMapping[shuffledKey] === answerOriginalKey
                ) || answerOriginalKey
              : answerOriginalKey;
            const displayCorrectKey = shuffled
              ? shuffled.correctShuffledKey
              : question.correctKey;
            const optionsForDisplay: { [key: string]: string } =
              (shuffled && shuffled.shuffledOptions) || question.options;
            return (
              <div
                key={question.id}
                className={`rounded-xl border-2 p-5 shadow-sm ${
                  correct
                    ? "border-green-300 bg-green-50"
                    : "border-red-300 bg-red-50"
                }`}
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded-full ${
                          correct
                            ? "bg-green-200 text-green-800"
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        {correct ? "✓ Correct" : "✗ Incorrect"}
                      </span>
                      <span className='text-sm font-medium text-gray-600'>
                        Question {question.id}
                      </span>
                    </div>
                    <div className='text-base font-semibold text-gray-900 mb-3'>
                      {question.prompt}
                    </div>
                  </div>
                </div>

                <div className='space-y-3'>
                  {/* Options list with inline badges */}
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                    {Object.entries(optionsForDisplay).map(
                      ([optKey, optVal]) => {
                        const isCorrect = optKey === displayCorrectKey;
                        const isSelected = optKey === displaySelectedKey;
                        return (
                          <div
                            key={optKey}
                            className={`p-3 rounded-lg border text-sm flex items-start justify-between ${
                              isCorrect && isSelected
                                ? "border-green-300 bg-green-50"
                                : isCorrect
                                ? "border-green-300 bg-green-50"
                                : isSelected
                                ? "border-blue-300 bg-blue-50"
                                : "border-gray-200 bg-white"
                            }`}
                          >
                            <div className='pr-3'>
                              <span className='font-semibold mr-2'>
                                {optKey}.
                              </span>
                              {optVal}
                            </div>
                            <div className='flex gap-1'>
                              {isCorrect && (
                                <span className='px-2 py-0.5 rounded-full text-xs font-semibold text-green-800 bg-green-100'>
                                  Correct
                                </span>
                              )}
                              {isSelected && (
                                <span className='px-2 py-0.5 rounded-full text-xs font-semibold text-blue-800 bg-blue-100'>
                                  You picked
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>

                  {question.explanation && (
                    <div className='p-4 rounded-lg border bg-green-50 border-green-200'>
                      <div className='text-sm font-semibold text-green-800 mb-2'>
                        Explanation
                      </div>
                      <div className='text-sm text-green-900 leading-relaxed'>
                        {question.explanation}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Retake Status */}
      {retakeStatus && (
        <div className='bg-white rounded-2xl border border-gray-200 p-6 shadow-sm'>
          <div className='flex items-center gap-3 mb-4'>
            <Calendar className='h-5 w-5 text-blue-600' />
            <h3 className='text-lg font-semibold text-gray-900'>
              Retake Status
            </h3>
          </div>

          <div
            className={`p-4 rounded-xl ${
              retakeStatus.canRetake
                ? "bg-green-50 border border-green-200"
                : "bg-yellow-50 border border-yellow-200"
            }`}
          >
            <div className='flex items-center gap-2 mb-2'>
              {retakeStatus.canRetake ? (
                <Trophy className='h-4 w-4 text-green-600' />
              ) : (
                <AlertCircle className='h-4 w-4 text-yellow-600' />
              )}
              <span
                className={`font-semibold ${
                  retakeStatus.canRetake ? "text-green-800" : "text-yellow-800"
                }`}
              >
                {retakeStatus.canRetake
                  ? "Ready to Retake"
                  : "Retake Not Available"}
              </span>
            </div>

            <div className='text-sm text-gray-700 mb-3'>
              {retakeStatus.canRetake
                ? `You have ${retakeStatus.attemptsRemaining} attempt(s) remaining.`
                : retakeStatus.reason}
            </div>

            {retakeStatus.nextRetakeDate && (
              <div className='text-sm text-gray-600'>
                Next retake available:{" "}
                {formatTimeRemaining(retakeStatus.nextRetakeDate)}
              </div>
            )}

            {/* Cleanup buttons for testing */}
            {process.env.NODE_ENV === "development" && (
              <div className='mt-3 pt-3 border-t border-gray-300 space-y-2'>
                <div className='flex gap-2 flex-wrap'>
                  <button
                    onClick={handleFixAttempts}
                    className='px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors'
                  >
                    🔧 Fix Attempts
                  </button>
                  <button
                    onClick={handleCleanupAttempts}
                    className='px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors'
                  >
                    🧹 Cleanup Duplicates
                  </button>
                  <button
                    onClick={handleClearAllAttempts}
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
      )}

      <div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
        <button
          onClick={onBackToExams}
          className='flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
        >
          Back to Exams
        </button>

        {retakeStatus?.canRetake ? (
          <button
            onClick={() => {
              console.log("Retake button clicked!");
              onRetakeExam();
            }}
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
    </div>
  );
}
