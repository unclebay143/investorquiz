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
    exams: [], // Will be populated separately
    isNew: topic.isNew,
    createdAt: topic.createdAt,
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
