import { useQuery } from "@tanstack/react-query";

interface ExamResponse {
  slug: string;
  title: string;
  description?: string;
  totalPoints: number;
  reviewMode: "immediate" | "post";
  isNew?: boolean;
  retakeSettings?: {
    enabled: boolean;
    maxAttempts: number;
    coolDownDays: number;
  };
  questions: any[];
  author?: {
    _id: string;
    name: string;
    title?: string;
    bio?: string;
    profileImage?: string;
    slug: string;
    socialLinks?: any;
    books?: any;
    quote?: string;
  };
}

interface ExamsResponse {
  exams: ExamResponse[];
  attemptStatuses: Record<string, any>;
}

async function fetchExams(topicSlug: string): Promise<ExamsResponse> {
  const response = await fetch(`/api/topics/${topicSlug}/exams`);
  if (!response.ok) {
    throw new Error("Failed to fetch exams");
  }
  return response.json();
}

export function useExams(topicSlug: string) {
  return useQuery({
    queryKey: ["exams", topicSlug],
    queryFn: () => fetchExams(topicSlug),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!topicSlug, // Only run if topicSlug is provided
  });
}
