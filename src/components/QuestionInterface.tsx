"use client";

import { Exam } from "@/types";
import { Clock } from "lucide-react";

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
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='text-sm font-semibold text-gray-700'>
          Question {currentQuestion + 1} of {exam.questions.length}
        </div>
        <div className='flex items-center gap-2 text-sm text-gray-600'>
          <Clock className='h-4 w-4' />
          <span className='font-mono'>
            {Math.floor(timeSpentInSeconds / 60)}:
            {(timeSpentInSeconds % 60).toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className='space-y-6'>
        <div className='mb-6'>
          <h2 className='text-lg font-medium text-gray-500 mb-2'>
            {exam.title}
          </h2>
          <h3 className='text-xl font-bold text-gray-900'>{question.prompt}</h3>
        </div>

        <div className='space-y-3'>
          {shuffled && Object.keys(shuffled.shuffledOptions).length > 0
            ? Object.entries(shuffled.shuffledOptions).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => onAnswerSelect(key)}
                  disabled={
                    exam.reviewMode === "immediate" ? showResult : false
                  }
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 hover:bg-gray-50 disabled:hover:bg-transparent ${
                    selectedAnswer === shuffled.keyMapping[key]
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : ""
                  } ${
                    exam.reviewMode === "immediate" &&
                    showResult &&
                    key === shuffled.correctShuffledKey
                      ? "border-green-500 bg-green-50 shadow-sm"
                      : ""
                  } ${
                    exam.reviewMode === "immediate" &&
                    showResult &&
                    selectedAnswer === shuffled.keyMapping[key] &&
                    key !== shuffled.correctShuffledKey
                      ? "border-red-500 bg-red-50 shadow-sm"
                      : ""
                  }`}
                >
                  <span className='font-medium mr-3'>{key}.</span>
                  {value}
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
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 hover:bg-gray-50 disabled:hover:bg-transparent ${
                    selectedAnswer === key
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : ""
                  } ${
                    exam.reviewMode === "immediate" &&
                    showResult &&
                    key === question.correctKey
                      ? "border-green-500 bg-green-50 shadow-sm"
                      : ""
                  } ${
                    exam.reviewMode === "immediate" &&
                    showResult &&
                    selectedAnswer === key &&
                    key !== question.correctKey
                      ? "border-red-500 bg-red-50 shadow-sm"
                      : ""
                  }`}
                >
                  <span className='font-medium mr-3'>{key}.</span>
                  {value}
                </button>
              ))}
        </div>

        {exam.reviewMode === "immediate" ? (
          !showResult ? (
            <button
              onClick={onSubmit}
              disabled={!selectedAnswer}
              className='w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors'
            >
              Submit Answer
            </button>
          ) : (
            <div className='space-y-4'>
              <div className='space-y-3'>
                <div
                  className={`p-4 rounded-xl font-semibold ${
                    selectedAnswer === question.correctKey
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {selectedAnswer === question.correctKey
                    ? `Correct! +${Math.round(
                        exam.totalPoints / exam.questions.length
                      )} points`
                    : "Incorrect."}
                </div>
                <div className='grid gap-3 text-sm'>
                  <div className='rounded-lg border p-4 bg-white'>
                    <div className='text-gray-500 font-medium mb-1'>
                      Your answer
                    </div>
                    <div className='text-gray-900'>
                      {selectedAnswer}.{" "}
                      {
                        question.options[
                          selectedAnswer as keyof typeof question.options
                        ]
                      }
                    </div>
                  </div>
                  <div className='rounded-lg border p-4 bg-green-50 border-green-200'>
                    <div className='text-green-700 font-semibold mb-1'>
                      Correct answer
                    </div>
                    <div className='text-green-900'>
                      {question.correctKey}.{" "}
                      {
                        question.options[
                          question.correctKey as keyof typeof question.options
                        ]
                      }
                    </div>
                  </div>
                  {question.explanation && (
                    <div className='rounded-lg border p-4 bg-blue-50 border-blue-200'>
                      <div className='text-blue-700 font-semibold mb-1'>
                        Explanation
                      </div>
                      <div className='text-blue-900'>
                        {question.explanation}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={onNext}
                className='w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors'
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
            className='w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors'
          >
            {currentQuestion < exam.questions.length - 1
              ? "Confirm & Next"
              : "Submit & See Results"}
          </button>
        )}
      </div>
    </div>
  );
}
