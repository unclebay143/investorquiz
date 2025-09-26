import { useMutation, useQueryClient } from "@tanstack/react-query";

// Removed useAttemptStatus: attempts are read via useQuiz(..., { includeAttempts: true })

// Start a new attempt
export function useStartAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      topicSlug,
      quizSlug,
    }: {
      topicSlug: string;
      quizSlug: string;
    }) => {
      const response = await fetch("/api/attempts/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topicSlug, quizSlug }),
      });

      if (!response.ok) {
        throw new Error("Failed to start attempt");
      }

      return response.json();
    },
    onSuccess: (_data, { quizSlug }) => {
      // Invalidate single quiz so embedded attempts refresh
      queryClient.invalidateQueries({ queryKey: ["quiz", quizSlug] });
      queryClient.invalidateQueries({ queryKey: ["topics"] });
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
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: data.answers,
          timeSpentInSeconds: data.timeSpentInSeconds,
          completedAt: new Date().toISOString(),
          inProgress: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || "Failed to submit attempt";
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onSuccess: (_res, variables) => {
      // Invalidate single quiz so results and attempts refresh
      queryClient.invalidateQueries({ queryKey: ["quiz", variables.attemptId] });
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
  });
}
