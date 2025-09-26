import type { Question } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface QuizResponse {
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
}

interface QuizzesResponse {
  quizzes: QuizResponse[];
  attemptStatuses: Record<
    string,
    | { status: "none"; canRetake: boolean; attemptsRemaining: number }
    | {
        status: "in-progress";
        attemptId: string;
        attemptNumber: number;
        startedAt?: string;
      }
    | {
        status: "completed";
        attemptId: string;
        attemptNumber: number;
        score: number;
        canRetake: boolean;
        attemptsRemaining: number;
      }
  >;
}

async function fetchQuizzes(topicSlug: string): Promise<QuizzesResponse> {
  const response = await fetch(`/api/topics/${topicSlug}/quizzes`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch quizzes");
  }
  return response.json();
}

export function useQuizzes(topicSlug: string) {
  const { data: session, status } = useSession();
  const authKey = session?.user ? "auth" : "anon";
  return useQuery({
    queryKey: ["quizzes", topicSlug, authKey],
    queryFn: () => fetchQuizzes(topicSlug),
    staleTime: 0,
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    enabled: !!topicSlug && status !== "loading",
  });
}
