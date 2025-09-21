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

export type Exam = {
  id: string;
  title: string;
  description: string;
  totalPoints: number;
  questions: Question[];
  reviewMode: "immediate" | "post"; // immediate: feedback per question, post: feedback after exam
  isNew?: boolean;
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
  exams: Exam[];
  createdAt?: Date;
};

export type UserScore = {
  userId: string;
  userName: string;
  userAvatar?: string;
  totalScore: number;
  totalExams: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number; // in seconds
  lastActivity: string; // ISO date string
  completedExams: {
    topicId: string;
    examId: string;
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
  sortBy: "score" | "exams" | "average" | "time";
};

export type CurrentUser = {
  userId: string;
  userName: string;
  userAvatar?: string;
  totalScore: number;
  rank: number;
  examsCompleted: number;
};

export type ExamAttempt = {
  examId: string;
  topicId: string;
  attemptNumber: number;
  score: number;
  timeSpentInSeconds: number;
  completedAt: string;
  answers: { [questionId: number]: string };
  grade: string;
  isBestScore: boolean; // Track if this is the user's best attempt
};

export type ExamAttempts = {
  [examKey: string]: ExamAttempt[]; // examKey = `${topicId}-${examId}`
};

export type RetakeStatus = {
  canRetake: boolean;
  reason?: string;
  nextRetakeDate?: string;
  attemptsRemaining: number;
  currentAttempt: number;
};
