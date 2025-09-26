import { Quiz, QuizAttempt, QuizAttempts, RetakeStatus } from "@/types";

// Calculate grade based on percentage
export const calculateGrade = (percentage: number) => {
  if (percentage >= 97)
    return { grade: "A+", color: "from-green-500 to-emerald-600" };
  if (percentage >= 93)
    return { grade: "A", color: "from-green-500 to-green-600" };
  if (percentage >= 90)
    return { grade: "A-", color: "from-green-400 to-green-500" };
  if (percentage >= 87)
    return { grade: "B+", color: "from-blue-500 to-blue-600" };
  if (percentage >= 83)
    return { grade: "B", color: "from-blue-400 to-blue-500" };
  if (percentage >= 80)
    return { grade: "B-", color: "from-blue-300 to-blue-400" };
  if (percentage >= 77)
    return { grade: "C+", color: "from-yellow-500 to-orange-500" };
  if (percentage >= 73)
    return { grade: "C", color: "from-yellow-400 to-orange-400" };
  if (percentage >= 70)
    return { grade: "C-", color: "from-yellow-300 to-orange-300" };
  if (percentage >= 67)
    return { grade: "D+", color: "from-red-500 to-red-600" };
  if (percentage >= 63) return { grade: "D", color: "from-red-400 to-red-500" };
  if (percentage >= 60)
    return { grade: "D-", color: "from-red-300 to-red-400" };
  return { grade: "F", color: "from-red-600 to-red-700" };
};

// Check if user can retake an quiz
export const getRetakeStatus = (
  quiz: Quiz,
  topicId: string,
  attempts: QuizAttempts
): RetakeStatus => {
  const quizKey = `${topicId}-${quiz.id}`;
  const quizAttempts = attempts[quizKey] || [];
  const retakeSettings = quiz.retakeSettings || {
    enabled: true,
    maxAttempts: 2,
    coolDownDays: 0.0001, // ~5 seconds for testing (0.0001 days = ~8.6 seconds)
  };

  // If retake is disabled
  if (!retakeSettings.enabled) {
    return {
      canRetake: false,
      reason: "Retakes are disabled for this quiz",
      attemptsRemaining: 0,
      currentAttempt: quizAttempts.length,
    };
  }

  // If max attempts reached
  if (quizAttempts.length >= retakeSettings.maxAttempts) {
    return {
      canRetake: false,
      reason: `Maximum attempts (${retakeSettings.maxAttempts}) reached`,
      attemptsRemaining: 0,
      currentAttempt: quizAttempts.length,
    };
  }

  // If no attempts yet, can retake (current attempt will be attempt 1)
  if (quizAttempts.length === 0) {
    return {
      canRetake: true,
      attemptsRemaining: retakeSettings.maxAttempts - 1, // -1 because current attempt counts
      currentAttempt: 1,
    };
  }

  // Check cooldown period
  const lastAttempt = quizAttempts[quizAttempts.length - 1];
  const lastAttemptDate = new Date(lastAttempt.completedAt);
  const cooldownEndDate = new Date(
    lastAttemptDate.getTime() +
      retakeSettings.coolDownDays * 24 * 60 * 60 * 1000
  );
  const now = new Date();

  if (now < cooldownEndDate) {
    return {
      canRetake: false,
      reason: `Wait ${retakeSettings.coolDownDays} days between attempts`,
      nextRetakeDate: cooldownEndDate.toISOString(),
      attemptsRemaining: retakeSettings.maxAttempts - quizAttempts.length - 1, // -1 for current attempt
      currentAttempt: quizAttempts.length + 1, // +1 for current attempt
    };
  }

  return {
    canRetake: true,
    attemptsRemaining: retakeSettings.maxAttempts - quizAttempts.length - 1, // -1 for current attempt
    currentAttempt: quizAttempts.length + 1, // +1 for current attempt
  };
};

// Save quiz attempt
export const saveQuizAttempt = (
  quiz: Quiz,
  topicId: string,
  score: number,
  timeSpentInSeconds: number,
  answers: { [questionId: number]: string },
  attempts: QuizAttempts
): QuizAttempts => {
  const quizKey = `${topicId}-${quiz.id}`;
  const quizAttempts = attempts[quizKey] || [];
  const attemptNumber = quizAttempts.length + 1;
  const percentage = (score / quiz.totalPoints) * 100;
  const gradeInfo = calculateGrade(percentage);

  // Find the best score so far
  const bestScore =
    quizAttempts.length > 0
      ? Math.max(...quizAttempts.map((a) => a.score))
      : -1; // Use -1 for first attempt
  const isNewBestScore = score > bestScore;


  // If this is a new best score, mark all previous attempts as not best
  // If this is not a new best score, keep previous best scores as they are
  const updatedAttempts = quizAttempts.map((attempt) => ({
    ...attempt,
    isBestScore: isNewBestScore ? false : attempt.isBestScore,
  }));

  const newAttempt: QuizAttempt = {
    quizId: quiz.id,
    topicId,
    attemptNumber,
    score,
    timeSpentInSeconds,
    completedAt: new Date().toISOString(),
    answers,
    grade: gradeInfo.grade,
    isBestScore: isNewBestScore,
  };

  return {
    ...attempts,
    [quizKey]: [...updatedAttempts, newAttempt],
  };
};

// Get attempt history for an quiz
export const getAttemptHistory = (
  quiz: Quiz,
  topicId: string,
  attempts: QuizAttempts
): QuizAttempt[] => {
  const quizKey = `${topicId}-${quiz.id}`;
  return attempts[quizKey] || [];
};

// Get best attempt for an quiz
export const getBestAttempt = (
  quiz: Quiz,
  topicId: string,
  attempts: QuizAttempts
): QuizAttempt | null => {
  const quizAttempts = getAttemptHistory(quiz, topicId, attempts);
  return quizAttempts.find((attempt) => attempt.isBestScore) || null;
};

// Format date for display
export const formatAttemptDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format time remaining for cooldown
export const formatTimeRemaining = (nextRetakeDate: string): string => {
  const now = new Date();
  const retakeDate = new Date(nextRetakeDate);
  const diffMs = retakeDate.getTime() - now.getTime();

  if (diffMs <= 0) return "Available now";

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  if (minutes > 0) return `${minutes}m remaining`;
  return `${seconds}s remaining`;
};

// For testing: Clear cooldown by updating attempt timestamps
export const clearCooldownForTesting = (
  attempts: QuizAttempts
): QuizAttempts => {
  const now = new Date();
  const oldDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago

  const updatedAttempts = { ...attempts };

  Object.keys(updatedAttempts).forEach((quizKey) => {
    updatedAttempts[quizKey] = updatedAttempts[quizKey].map((attempt) => ({
      ...attempt,
      completedAt: oldDate.toISOString(),
    }));
  });

  return updatedAttempts;
};

// Clean up duplicate attempts - keep only the latest few attempts per quiz
export const cleanupAttempts = (
  attempts: QuizAttempts,
  maxAttemptsPerQuiz: number = 5
): QuizAttempts => {
  const cleanedAttempts: QuizAttempts = {};

  Object.keys(attempts).forEach((quizKey) => {
    const quizAttempts = attempts[quizKey];

    // Sort by completedAt date (newest first) and take only the latest attempts
    const sortedAttempts = quizAttempts
      .sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      )
      .slice(0, maxAttemptsPerQuiz);

    // Reassign attempt numbers starting from 1
    const renumberedAttempts = sortedAttempts.map((attempt, index) => ({
      ...attempt,
      attemptNumber: index + 1,
    }));

    // Find the best score and mark it
    const bestScore = Math.max(...renumberedAttempts.map((a) => a.score), 0);
    const finalAttempts = renumberedAttempts.map((attempt) => ({
      ...attempt,
      isBestScore: attempt.score === bestScore && bestScore > 0,
    }));

    cleanedAttempts[quizKey] = finalAttempts;
  });

  return cleanedAttempts;
};

// Clear all attempts for testing
export const clearAllAttempts = (): void => {
  localStorage.removeItem("quiz-attempts");
};
