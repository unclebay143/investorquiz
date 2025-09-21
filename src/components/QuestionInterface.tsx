"use client";

import { buttonStyles, formatTime } from "@/lib/utils";
import { Exam } from "@/types";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface QuestionInterfaceProps {
  exam: Exam;
  currentQuestion: number;
  selectedAnswer: string | null;
  showResult: boolean;
  score: number;
  timeSpentInSeconds: number;
  shuffledQuestions: {
    [questionId: number]: {
      shuffledOptions: { [key: string]: string };
      keyMapping: { [key: string]: string };
      correctShuffledKey: string;
    };
  };
  onAnswerSelect: (key: string) => void;
  onSubmit: () => void;
  onNext: () => void;
}

export default function QuestionInterface({
  exam,
  currentQuestion,
  selectedAnswer,
  showResult,
  score,
  timeSpentInSeconds,
  shuffledQuestions,
  onAnswerSelect,
  onSubmit,
  onNext,
}: QuestionInterfaceProps) {
  const question = exam.questions[currentQuestion];
  const shuffled = shuffledQuestions[question.id];

  return (
    <div className='max-w-4xl mx-auto'>
      {/* Header with Progress and Timer */}
      <div className='mb-8'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-4 justify-between w-full'>
            <div className='text-sm font-semibold text-gray-700 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm'>
              Question {currentQuestion + 1} of {exam.questions.length}
            </div>
            <div className='flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm'>
              <Clock className='h-4 w-4' />
              <span className='font-mono'>
                {formatTime(timeSpentInSeconds)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className='w-full bg-gray-200 rounded-full h-2 mb-6'>
          <div
            className='bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300 ease-out'
            style={{
              width: `${
                ((currentQuestion + 1) / exam.questions.length) * 100
              }%`,
            }}
          ></div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-8'>
        <div className='mb-4'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full'></div>
            <span className='text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full'>
              {exam.title}
            </span>
          </div>
          <h2 className='text-2xl font-bold text-gray-900 leading-relaxed'>
            {question.prompt}
          </h2>
        </div>

        <div className='space-y-4'>
          {shuffled && Object.keys(shuffled.shuffledOptions).length > 0
            ? Object.entries(shuffled.shuffledOptions).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => onAnswerSelect(key)}
                  disabled={
                    exam.reviewMode === "immediate" ? showResult : false
                  }
                  className={`group w-full text-left p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-md disabled:hover:shadow-none ${
                    selectedAnswer === key
                      ? "border-blue-500 bg-blue-50 shadow-md transform scale-[1.02]"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  } ${
                    exam.reviewMode === "immediate" &&
                    showResult &&
                    key === shuffled.correctShuffledKey
                      ? "border-green-500 bg-green-50 shadow-md"
                      : ""
                  } ${
                    exam.reviewMode === "immediate" &&
                    showResult &&
                    selectedAnswer === key &&
                    key !== shuffled.correctShuffledKey
                      ? "border-red-500 bg-red-50 shadow-md"
                      : ""
                  }`}
                >
                  <div className='flex items-center gap-4'>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                        selectedAnswer === key
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                      } ${
                        exam.reviewMode === "immediate" &&
                        showResult &&
                        key === shuffled.correctShuffledKey
                          ? "bg-green-500 text-white"
                          : ""
                      } ${
                        exam.reviewMode === "immediate" &&
                        showResult &&
                        selectedAnswer === key &&
                        key !== shuffled.correctShuffledKey
                          ? "bg-red-500 text-white"
                          : ""
                      }`}
                    >
                      {key}
                    </div>
                    <span className='text-gray-900 font-medium'>{value}</span>
                    {exam.reviewMode === "immediate" &&
                      showResult &&
                      key === shuffled.correctShuffledKey && (
                        <CheckCircle className='h-5 w-5 text-green-500 ml-auto' />
                      )}
                    {exam.reviewMode === "immediate" &&
                      showResult &&
                      selectedAnswer === key &&
                      key !== shuffled.correctShuffledKey && (
                        <XCircle className='h-5 w-5 text-red-500 ml-auto' />
                      )}
                  </div>
                </button>
              ))
            : // Fallback to original options if shuffled data is not available
              Object.entries(question.options).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => onAnswerSelect(key)}
                  disabled={
                    exam.reviewMode === "immediate" ? showResult : false
                  }
                  className={`group w-full text-left p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-md disabled:hover:shadow-none ${
                    selectedAnswer === key
                      ? "border-blue-500 bg-blue-50 shadow-md transform scale-[1.02]"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  } ${
                    exam.reviewMode === "immediate" &&
                    showResult &&
                    key === question.correctKey
                      ? "border-green-500 bg-green-50 shadow-md"
                      : ""
                  } ${
                    exam.reviewMode === "immediate" &&
                    showResult &&
                    selectedAnswer === key &&
                    key !== question.correctKey
                      ? "border-red-500 bg-red-50 shadow-md"
                      : ""
                  }`}
                >
                  <div className='flex items-center gap-4'>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                        selectedAnswer === key
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                      } ${
                        exam.reviewMode === "immediate" &&
                        showResult &&
                        key === question.correctKey
                          ? "bg-green-500 text-white"
                          : ""
                      } ${
                        exam.reviewMode === "immediate" &&
                        showResult &&
                        selectedAnswer === key &&
                        key !== question.correctKey
                          ? "bg-red-500 text-white"
                          : ""
                      }`}
                    >
                      {key}
                    </div>
                    <span className='text-gray-900 font-medium'>{value}</span>
                    {exam.reviewMode === "immediate" &&
                      showResult &&
                      key === question.correctKey && (
                        <CheckCircle className='h-5 w-5 text-green-500 ml-auto' />
                      )}
                    {exam.reviewMode === "immediate" &&
                      showResult &&
                      selectedAnswer === key &&
                      key !== question.correctKey && (
                        <XCircle className='h-5 w-5 text-red-500 ml-auto' />
                      )}
                  </div>
                </button>
              ))}
        </div>

        {/* Action Buttons */}
        <div className='mt-4 pt-4 border-t border-gray-100'>
          {exam.reviewMode === "immediate" ? (
            !showResult ? (
              <button
                onClick={onSubmit}
                disabled={!selectedAnswer}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedAnswer ? buttonStyles.primary : buttonStyles.disabled
                }`}
              >
                Submit Answer
              </button>
            ) : (
              <div className='space-y-6'>
                {/* Result Summary */}
                <div
                  className={`p-6 rounded-xl border-2 font-semibold text-lg ${
                    selectedAnswer &&
                    shuffled?.keyMapping[selectedAnswer] === question.correctKey
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    {selectedAnswer &&
                    shuffled?.keyMapping[selectedAnswer] ===
                      question.correctKey ? (
                      <CheckCircle className='h-6 w-6' />
                    ) : (
                      <XCircle className='h-6 w-6' />
                    )}
                    {selectedAnswer &&
                    shuffled?.keyMapping[selectedAnswer] === question.correctKey
                      ? `Correct! +${Math.round(
                          exam.totalPoints / exam.questions.length
                        )} points`
                      : "Incorrect."}
                  </div>
                </div>

                {/* Answer Details */}
                <div className='grid gap-4'>
                  <div className='rounded-xl border-2 border-gray-200 p-6 bg-white'>
                    <div className='text-gray-500 font-semibold mb-2 flex items-center gap-2'>
                      <div className='w-2 h-2 bg-gray-400 rounded-full'></div>
                      Your answer
                    </div>
                    <div className='text-gray-900 text-lg'>
                      {selectedAnswer}.{" "}
                      {selectedAnswer &&
                        (shuffled?.shuffledOptions[selectedAnswer] ||
                          question.options[
                            selectedAnswer as keyof typeof question.options
                          ])}
                    </div>
                  </div>
                  <div className='rounded-xl border-2 border-green-200 p-6 bg-green-50'>
                    <div className='text-green-700 font-semibold mb-2 flex items-center gap-2'>
                      <CheckCircle className='h-4 w-4' />
                      Correct answer
                    </div>
                    <div className='text-green-900 text-lg'>
                      {shuffled?.correctShuffledKey}.{" "}
                      {shuffled?.shuffledOptions[shuffled.correctShuffledKey] ||
                        question.options[
                          question.correctKey as keyof typeof question.options
                        ]}
                    </div>
                  </div>
                  {question.explanation && (
                    <div className='rounded-xl border-2 border-blue-200 p-6 bg-blue-50'>
                      <div className='text-blue-700 font-semibold mb-2 flex items-center gap-2'>
                        <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                        Explanation
                      </div>
                      <div className='text-blue-900 text-lg leading-relaxed'>
                        {question.explanation}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={onNext}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg ${buttonStyles.primary}`}
                >
                  {currentQuestion < exam.questions.length - 1
                    ? "Next Question"
                    : "Complete Exam"}
                </button>
              </div>
            )
          ) : (
            <button
              onClick={onSubmit}
              disabled={!selectedAnswer}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedAnswer ? buttonStyles.primary : buttonStyles.disabled
              }`}
            >
              {currentQuestion < exam.questions.length - 1
                ? "Confirm & Next"
                : "Submit & See Results"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
