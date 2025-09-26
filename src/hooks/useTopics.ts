import { Topic } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface TopicsResponse {
  slug: string;
  title: string;
  description?: string;
  isNew?: boolean;
  createdAt?: string;
}

async function fetchTopics(): Promise<Topic[]> {
  const response = await fetch("/api/topics");
  if (!response.ok) {
    throw new Error("Failed to fetch topics");
  }
  const topicsData: TopicsResponse[] = await response.json();

  // Transform API data to match our Topic type
  return topicsData.map((topic) => ({
    id: topic.slug,
    title: topic.title,
    description: topic.description || "",
    quizzes: [], // Will be populated separately
    ...(() => {
      const createdAtDate = topic.createdAt ? new Date(topic.createdAt) : undefined;
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      return {
        isNew: createdAtDate ? createdAtDate.getTime() > thirtyDaysAgo : false,
        createdAt: createdAtDate,
      };
    })(),
  }));
}

export function useTopics() {
  return useQuery({
    queryKey: ["topics"],
    queryFn: fetchTopics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
