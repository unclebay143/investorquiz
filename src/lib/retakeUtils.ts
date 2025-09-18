import { Exam, ExamAttempt, ExamAttempts, RetakeStatus } from "@/types";

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

// Check if user can retake an exam
export const getRetakeStatus = (
  exam: Exam,
  topicId: string,
  attempts: ExamAttempts
): RetakeStatus => {
  const examKey = `${topicId}-${exam.id}`;
  const examAttempts = attempts[examKey] || [];
  const retakeSettings = exam.retakeSettings || {
    enabled: true,
    maxAttempts: 2,
    cooldownDays: 0.0001, // ~5 seconds for testing (0.0001 days = ~8.6 seconds)
  };

  // If retake is disabled
  if (!retakeSettings.enabled) {
    return {
      canRetake: false,
      reason: "Retakes are disabled for this exam",
      attemptsRemaining: 0,
      currentAttempt: examAttempts.length,
    };
  }

  // If max attempts reached
  if (examAttempts.length >= retakeSettings.maxAttempts) {
    return {
      canRetake: false,
      reason: `Maximum attempts (${retakeSettings.maxAttempts}) reached`,
      attemptsRemaining: 0,
      currentAttempt: examAttempts.length,
    };
  }

  // If no attempts yet, can retake (current attempt will be attempt 1)
  if (examAttempts.length === 0) {
    return {
      canRetake: true,
      attemptsRemaining: retakeSettings.maxAttempts - 1, // -1 because current attempt counts
      currentAttempt: 1,
    };
  }

  // Check cooldown period
  const lastAttempt = examAttempts[examAttempts.length - 1];
  const lastAttemptDate = new Date(lastAttempt.completedAt);
  const cooldownEndDate = new Date(
    lastAttemptDate.getTime() +
      retakeSettings.cooldownDays * 24 * 60 * 60 * 1000
  );
  const now = new Date();

  if (now < cooldownEndDate) {
    return {
      canRetake: false,
      reason: `Wait ${retakeSettings.cooldownDays} days between attempts`,
      nextRetakeDate: cooldownEndDate.toISOString(),
      attemptsRemaining: retakeSettings.maxAttempts - examAttempts.length - 1, // -1 for current attempt
      currentAttempt: examAttempts.length + 1, // +1 for current attempt
    };
  }

  return {
    canRetake: true,
    attemptsRemaining: retakeSettings.maxAttempts - examAttempts.length - 1, // -1 for current attempt
    currentAttempt: examAttempts.length + 1, // +1 for current attempt
  };
};

// Save exam attempt
export const saveExamAttempt = (
  exam: Exam,
  topicId: string,
  score: number,
  timeSpent: number,
  answers: { [questionId: number]: string },
  attempts: ExamAttempts
): ExamAttempts => {
  const examKey = `${topicId}-${exam.id}`;
  const examAttempts = attempts[examKey] || [];
  const attemptNumber = examAttempts.length + 1;
  const percentage = (score / exam.totalPoints) * 100;
  const gradeInfo = calculateGrade(percentage);

  // Find the best score so far
  const bestScore =
    examAttempts.length > 0
      ? Math.max(...examAttempts.map((a) => a.score))
      : -1; // Use -1 for first attempt
  const isNewBestScore = score > bestScore;

  // Debug logging
  console.log(
    "saveExamAttempt - score:",
    score,
    "bestScore:",
    bestScore,
    "isNewBestScore:",
    isNewBestScore
  );

  // If this is a new best score, mark all previous attempts as not best
  // If this is not a new best score, keep previous best scores as they are
  const updatedAttempts = examAttempts.map((attempt) => ({
    ...attempt,
    isBestScore: isNewBestScore ? false : attempt.isBestScore,
  }));

  const newAttempt: ExamAttempt = {
    examId: exam.id,
    topicId,
    attemptNumber,
    score,
    timeSpent,
    completedAt: new Date().toISOString(),
    answers,
    grade: gradeInfo.grade,
    isBestScore: isNewBestScore,
  };

  return {
    ...attempts,
    [examKey]: [...updatedAttempts, newAttempt],
  };
};

// Get attempt history for an exam
export const getAttemptHistory = (
  exam: Exam,
  topicId: string,
  attempts: ExamAttempts
): ExamAttempt[] => {
  const examKey = `${topicId}-${exam.id}`;
  return attempts[examKey] || [];
};

// Get best attempt for an exam
export const getBestAttempt = (
  exam: Exam,
  topicId: string,
  attempts: ExamAttempts
): ExamAttempt | null => {
  const examAttempts = getAttemptHistory(exam, topicId, attempts);
  return examAttempts.find((attempt) => attempt.isBestScore) || null;
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
  attempts: ExamAttempts
): ExamAttempts => {
  const now = new Date();
  const oldDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago

  const updatedAttempts = { ...attempts };

  Object.keys(updatedAttempts).forEach((examKey) => {
    updatedAttempts[examKey] = updatedAttempts[examKey].map((attempt) => ({
      ...attempt,
      completedAt: oldDate.toISOString(),
    }));
  });

  return updatedAttempts;
};

// Clean up duplicate attempts - keep only the latest few attempts per exam
export const cleanupAttempts = (
  attempts: ExamAttempts,
  maxAttemptsPerExam: number = 5
): ExamAttempts => {
  const cleanedAttempts: ExamAttempts = {};

  Object.keys(attempts).forEach((examKey) => {
    const examAttempts = attempts[examKey];

    // Sort by completedAt date (newest first) and take only the latest attempts
    const sortedAttempts = examAttempts
      .sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      )
      .slice(0, maxAttemptsPerExam);

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

    cleanedAttempts[examKey] = finalAttempts;
  });

  return cleanedAttempts;
};

// Clear all attempts for testing
export const clearAllAttempts = (): void => {
  localStorage.removeItem("exam-attempts");
};
