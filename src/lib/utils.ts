import type { Question } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
}

export function shuffleQuestionOptions(question: Question) {
  const options = question.options;
  const optionKeys = Object.keys(options);
  const shuffledKeys = [...optionKeys].sort(() => Math.random() - 0.5);

  const shuffledOptions: { [key: string]: string } = {};
  const keyMapping: { [key: string]: string } = {};

  const orderedLabels = ["A", "B", "C", "D"];
  shuffledKeys.forEach((originalKey, index) => {
    const newLabel = orderedLabels[index];
    shuffledOptions[newLabel] = options[originalKey as keyof typeof options];
    keyMapping[newLabel] = originalKey;
  });

  const correctShuffledKey =
    Object.keys(shuffledOptions).find(
      (key) =>
        shuffledOptions[key] ===
        options[question.correctKey as keyof typeof options]
    ) || question.correctKey;

  return {
    shuffledOptions,
    keyMapping,
    correctShuffledKey,
  };
}

// Common button styles
export const buttonStyles = {
  primary:
    "group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/20",
  secondary:
    "px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors",
  success:
    "px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500/20",
  danger:
    "px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/20",
  disabled:
    "px-6 py-3 bg-gray-400 text-white rounded-xl cursor-not-allowed shadow-lg",
};
