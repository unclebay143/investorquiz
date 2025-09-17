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
};

export type Topic = {
  id: string;
  title: string;
  description: string;
  exams: Exam[];
  isNew?: boolean;
};
