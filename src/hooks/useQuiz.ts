import type { Question } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export interface SingleQuizResponse {
  slug: string;
  title: string;
  description?: string;
  totalPoints: number;
  reviewMode: "immediate" | "post";
  retakeSettings?: {
    enabled: boolean;
    maxAttempts: number;
    coolDownDays: number;
  };
  questions: Question[];
  author?: {
    _id: string;
    name: string;
    title?: string;
    bio?: string;
    profileImage?: string;
    slug: string;
    socialLinks?: Record<string, string> | undefined;
    books?: Array<{ title: string; year: number; url?: string }>;
    quote?: string;
  };
  attempts?: Array<{
    attemptId: string;
    attemptNumber: number;
    completedAt: string;
    score: number;
    grade: string;
    isBestScore: boolean;
    timeSpentInSeconds: number;
    answers: Record<string, string>;
    shuffledQuestions: Record<
      string,
      {
        shuffledOptions: Record<string, string>;
        keyMapping: Record<string, string>;
        correctShuffledKey: string;
      }
    >;
  }>;
}

export interface UseQuizOptions {
  includeAnswers?: boolean;
  includeAttempts?: boolean;
}

async function fetchQuiz(
  quizSlug: string,
  opts?: UseQuizOptions
): Promise<SingleQuizResponse> {
  const params = new URLSearchParams();
  if (opts?.includeAnswers) params.set("includeAnswers", "true");
  if (opts?.includeAttempts) params.set("includeAttempts", "true");
  const qs = params.toString();
  const url = qs ? `/api/quizzes/${quizSlug}?${qs}` : `/api/quizzes/${quizSlug}`;
  const response = await fetch(url, {
    cache: "no-store",
    credentials: "include",
  });
  if (response.status === 401) {
    throw new Error("Unauthorized");
  }
  if (!response.ok) {
    throw new Error("Failed to fetch quiz");
  }
  return (await response.json()) as SingleQuizResponse;
}

export function useQuiz(quizSlug: string, opts?: UseQuizOptions) {
  const { data: session, status } = useSession();
  const authKey = session?.user ? "auth" : "anon";
  return useQuery({
    queryKey: ["quiz", quizSlug, authKey, opts?.includeAnswers, opts?.includeAttempts],
    queryFn: () => fetchQuiz(quizSlug, opts),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    enabled: !!quizSlug && status !== "loading",
  });
}


