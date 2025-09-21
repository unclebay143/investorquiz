import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface AttemptResponse {
  _id: string;
  user: string;
  exam: string;
  topic: string;
  attemptNumber: number;
  score: number;
  timeSpentInSeconds?: number;
  completedAt: string;
  answers: Record<string, string>;
  grade: string;
  isBestScore?: boolean;
  inProgress?: boolean;
}

// Fetch attempt status for a specific exam
export function useAttemptStatus(examSlug: string) {
  return useQuery({
    queryKey: ["attemptStatus", examSlug],
    queryFn: async (): Promise<AttemptResponse | null> => {
      const response = await fetch(`/api/attempts/status?examSlug=${examSlug}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null; // No attempt found
        }
        throw new Error("Failed to fetch attempt status");
      }
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!examSlug,
  });
}

// Start a new attempt
export function useStartAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (examSlug: string) => {
      const response = await fetch("/api/attempts/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ examSlug }),
      });

      if (!response.ok) {
        throw new Error("Failed to start attempt");
      }

      return response.json();
    },
    onSuccess: (data, examSlug) => {
      // Invalidate and refetch attempt status
      queryClient.invalidateQueries({ queryKey: ["attemptStatus", examSlug] });
    },
  });
}

// Submit attempt answers
export function useSubmitAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      attemptId: string;
      answers: Record<string, string>;
      timeSpentInSeconds: number;
    }) => {
      const response = await fetch(`/api/attempts/${data.attemptId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: data.answers,
          timeSpentInSeconds: data.timeSpentInSeconds,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit attempt");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["attemptStatus"] });
      queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
  });
}
