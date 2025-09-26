export type Author = {
  id: string;
  name: string;
  title: string; // e.g., "CFA, Former Goldman Sachs VP"
  bio: string;
  profileImage?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  books?: {
    title: string;
    year: number;
    url?: string;
  }[];
  quote?: string;
};

export type Question = {
  id: number;
  prompt: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctKey: string;
  explanation?: string;
};

export type Quiz = {
  id: string;
  createdAt?: Date;
  title: string;
  description: string;
  totalPoints: number;
  questions: Question[];
  reviewMode: "immediate" | "post"; // immediate: feedback per question, post: feedback after quiz
  author?: Author;
  retakeSettings?: {
    enabled: boolean;
    maxAttempts: number;
    coolDownDays: number;
  };
};

export type Topic = {
  id: string;
  title: string;
  description: string;
  quizzes: Quiz[];
  createdAt?: Date;
};

export type UserScore = {
  userId: string;
  userName: string;
  userAvatar?: string;
  totalScore: number;
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number; // in seconds
  lastActivity: string; // ISO date string
  completedQuizzes: {
    topicId: string;
    quizId: string;
    score: number;
    timeSpentInSeconds: number;
    completedAt: string;
  }[];
};

export type LeaderboardEntry = {
  rank: number;
  user: UserScore;
  change?: number; // rank change from previous period (+1, -2, etc.)
};

export type LeaderboardFilter = {
  timePeriod: "all" | "week" | "month" | "year";
  topicId?: string; // filter by specific topic
  sortBy: "score" | "quizzes" | "average" | "time";
};

export type CurrentUser = {
  userId: string;
  userName: string;
  userAvatar?: string;
  totalScore: number;
  rank: number;
  quizzesCompleted: number;
};

export type QuizAttempt = {
  quizId: string;
  topicId: string;
  attemptNumber: number;
  score: number;
  timeSpentInSeconds: number;
  completedAt: string;
  answers: { [questionId: number]: string };
  shuffledQuestions?: {
    [questionId: number]: {
      shuffledOptions: { [key: string]: string };
      keyMapping: { [key: string]: string };
      correctShuffledKey: string;
    };
  };
  grade: string;
  isBestScore: boolean; // Track if this is the user's best attempt
};

export type QuizAttempts = {
  [quizKey: string]: QuizAttempt[]; // quizKey = `${topicId}-${quizId}`
};

export type RetakeStatus = {
  canRetake: boolean;
  reason?: string;
  nextRetakeDate?: string;
  attemptsRemaining: number;
  currentAttempt: number;
};
