"use client";

import {
  calculateGrade,
  formatTimeRemaining,
  getRetakeStatus,
} from "@/lib/retakeUtils";
import { Author, Quiz, QuizAttempt, QuizAttempts, RetakeStatus } from "@/types";
import { AlertCircle, Calendar, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import ResultsHeader from "./ResultsHeader";
import ScoreSummary from "./ScoreSummary";

interface ResultsScreenProps {
  quiz: Quiz;
  score: number;
  timeSpentInSeconds: number;
  postQuizAnswers: { [questionId: number]: string };
  shuffledQuestions?: {
    [questionId: number]: {
      shuffledOptions: { [key: string]: string };
      keyMapping: { [key: string]: string };
      correctShuffledKey: string;
    };
  };
  topicId: string;
  onBackToQuizzes: () => void;
  onViewAuthor: (author: Author) => void;
  onRetakeQuiz: () => void;
  attempts?: QuizAttempts; // Optional for backward compatibility
}

export default function ResultsScreen({
  quiz,
  postQuizAnswers,
  shuffledQuestions = {},
  topicId,
  onBackToQuizzes,
  onViewAuthor,
  onRetakeQuiz,
  attempts: propAttempts,
}: ResultsScreenProps) {
  const hasAnswers = !!postQuizAnswers;
  const safeAnswers = postQuizAnswers || {};

  const correctCount = quiz.questions.filter(
    (q) => safeAnswers[q.id] === q.correctKey
  ).length;


  // State for attempt history and retake status
  const [attempts, setAttempts] = useState<QuizAttempts>({});
  const [retakeStatus, setRetakeStatus] = useState<RetakeStatus | null>(null);
  const [selectedAttempt, setSelectedAttempt] = useState<number>(1); // 1+ = attempt numbers

  // Load attempts from localStorage or use prop
  useEffect(() => {
    if (propAttempts) {
      setAttempts(propAttempts);
    } else {
      const savedAttempts = localStorage.getItem("quiz-attempts");
      if (savedAttempts) {
        const parsedAttempts = JSON.parse(savedAttempts) as QuizAttempts;

        // Auto-fix attempts if they have incorrect isBestScore values
        const quizKey = `${topicId}-${quiz.id}`;
        const quizAttempts = (parsedAttempts[quizKey] || []) as QuizAttempt[];

        if (quizAttempts.length > 0) {
          // Check if any attempt has isBestScore: true
          const hasBestScore = quizAttempts.some(
            (attempt) => attempt.isBestScore === true
          );

          if (!hasBestScore) {
            // Auto-fix the attempts
            const sortedAttempts = [...quizAttempts].sort(
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
              [quizKey]: fixedAttempts,
            };

            setAttempts(updatedAttempts);
            localStorage.setItem(
              "quiz-attempts",
              JSON.stringify(updatedAttempts)
            );
            return;
          }
        }

        setAttempts(parsedAttempts);
      }
    }
  }, [propAttempts, topicId, quiz.id]);

  // Set selectedAttempt to the latest attempt when attempts are loaded
  useEffect(() => {
    const quizAttempts = attempts[`${topicId}-${quiz.id}`] || [];
    if (quizAttempts.length > 0) {
      const latestAttempt = quizAttempts.sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      )[0];
      setSelectedAttempt(latestAttempt.attemptNumber);
    }
  }, [attempts, topicId, quiz.id]);

  // Update retake status when attempts change
  useEffect(() => {
    const status = getRetakeStatus(quiz, topicId, attempts);
    setRetakeStatus(status);
  }, [quiz, topicId, attempts]);

  // Get saved attempts (current attempt should already be saved)
  const quizAttempts = attempts[`${topicId}-${quiz.id}`] || [];
  const allAttempts = quizAttempts
    .map((attempt) => ({
      ...attempt,
      isCurrent: false,
    }))
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

  // Get the selected attempt data
  const selectedAttemptData =
    allAttempts.find((attempt) => attempt.attemptNumber === selectedAttempt) ||
    allAttempts[0]; // Fallback to first attempt if not found

  // Calculate stats for selected attempt (with fallback to current quiz data)
  const selectedCorrectCount = selectedAttemptData
    ? quiz.questions.filter((q) => {
        const answers = (selectedAttemptData as { answers?: Record<string, string> }).answers || {};
        return answers[String(q.id)] === q.correctKey;
      }).length
    : correctCount; // Fallback to current quiz stats
  const selectedPercentage =
    (selectedCorrectCount / quiz.questions.length) * 100;
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
              No quiz attempts were found. Please complete an quiz first.
            </p>
            <button
              onClick={onBackToQuizzes}
              className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {!hasAnswers && (
        <div className='bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold text-gray-900 mb-3'>
              Error Loading Results
            </h2>
            <p className='text-gray-600 mb-4'>
              Unable to load quiz results. Please try again.
            </p>
            <button
              onClick={onBackToQuizzes}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      )}
      {allAttempts.length > 1 && (
        <div className='flex items-center gap-2 overflow-x-auto no-scrollbar -mx-3 sm:mx-0 px-3 sm:px-0'>
          <div className='flex gap-1'>
            {allAttempts.map((attempt) => (
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
        quiz={quiz}
        score={selectedAttemptData.score}
        totalQuestions={quiz.questions.length}
        gradeLetter={selectedGradeInfo.grade}
        gradeColorClass={selectedGradeInfo.color}
        isBestScore={!!selectedAttemptData.isBestScore}
        onViewAuthor={onViewAuthor}
      />

      {/* Score Summary */}
      <ScoreSummary
        points={{ scored: selectedAttemptData.score, total: quiz.totalPoints }}
        correctCount={selectedCorrectCount}
        totalQuestions={quiz.questions.length}
        timeSpentSeconds={selectedAttemptData.timeSpentInSeconds}
        performancePercent={selectedPercentage}
        gradeLetter={selectedGradeInfo.grade}
        gradeColorClass={selectedGradeInfo.color}
      />

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
          {quiz.questions.map((question) => {
            const answerOriginalKey = selectedAttemptData.isCurrent
              ? safeAnswers[question.id]
              : (selectedAttemptData as { answers?: Record<string, string> }).answers?.[question.id] ??
                (selectedAttemptData as { answers?: Record<string, string> }).answers?.[String(question.id)] ??
                safeAnswers[question.id];

            const correct = answerOriginalKey === question.correctKey;
            const shuffled =
              (selectedAttemptData as { shuffledQuestions?: Record<string, { shuffledOptions: Record<string, string>; keyMapping: Record<string, string>; correctShuffledKey: string }> }).shuffledQuestions?.[question.id] ||
              shuffledQuestions[question.id];
            // Map original to shuffled key label for display when available
            const displaySelectedKey = shuffled
              ? Object.keys(shuffled.keyMapping).find(
                  (shuffledKey) =>
                    shuffled.keyMapping[shuffledKey] === answerOriginalKey
                ) || answerOriginalKey
              : answerOriginalKey;

            const displayCorrectKey = shuffled
              ? Object.keys(shuffled.keyMapping).find(
                  (shuffledKey) =>
                    shuffled.keyMapping[shuffledKey] === question.correctKey
                ) || question.correctKey
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
                    <div className='text-base sm:text-lg font-semibold text-gray-900 mb-3'>
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
                            className={`relative p-3 rounded-lg border text-sm sm:text-base flex items-start ${
                              isCorrect && isSelected
                                ? "border-green-300 bg-green-50"
                                : isCorrect
                                ? "border-green-300 bg-green-50"
                                : isSelected
                                ? "border-blue-300 bg-blue-50"
                                : "border-gray-200 bg-white"
                            }`}
                          >
                            <div
                              className={`${
                                isSelected || isCorrect ? "pb-6 sm:pb-7" : ""
                              }`}
                            >
                              <span className='font-semibold mr-2'>
                                {optKey}.
                              </span>
                              {optVal}
                            </div>
                            <div className='absolute bottom-2 left-2 flex gap-1 whitespace-nowrap'>
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
                    <div className='p-3 sm:p-4 rounded-lg border bg-green-50 border-green-200'>
                      <div className='text-sm font-semibold text-green-800 mb-2'>
                        Explanation
                      </div>
                      <div className='text-sm sm:text-base text-green-900 leading-relaxed'>
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

      {/* Retake Status - Only show if retake is enabled */}
      {retakeStatus && quiz.retakeSettings?.enabled !== false && (
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
          </div>
        </div>
      )}

      <div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
        <button
          onClick={onBackToQuizzes}
          className='flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
        >
          Back to Quizzes
        </button>

        {/* Only show retake button if retake is enabled */}
        {quiz.retakeSettings?.enabled !== false &&
          (retakeStatus?.canRetake ? (
            <button
              onClick={() => {
                onRetakeQuiz();
              }}
              className='flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            >
              Retake Quiz
            </button>
          ) : (
            <button
              disabled
              className='flex-1 py-3 px-6 bg-gray-300 text-gray-500 rounded-xl font-semibold cursor-not-allowed'
            >
              Retake Not Available
            </button>
          ))}
      </div>
    </div>
  );
}
