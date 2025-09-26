"use client";

import Layout from "@/components/Layout";
import Leaderboard from "@/components/Leaderboard";
import { MOCK_LEADERBOARD } from "@/data/leaderboardData";
import { LeaderboardFilter } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LeaderboardPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<LeaderboardFilter>({
    timePeriod: "all",
    sortBy: "score",
  });

  // Filter and sort leaderboard entries based on current filter
  const filteredEntries = MOCK_LEADERBOARD.filter((entry) => {
    if (filter.topicId) {
      return entry.user.completedQuizzes.some(
        (quiz) => quiz.topicId === filter.topicId
      );
    }
    return true;
  })
    .sort((a, b) => {
      switch (filter.sortBy) {
        case "score":
          return b.user.totalScore - a.user.totalScore;
        case "quizzes":
          return b.user.totalQuizzes - a.user.totalQuizzes;
        case "average":
          return b.user.averageScore - a.user.averageScore;
        case "time":
          return b.user.totalTimeSpent - a.user.totalTimeSpent;
        default:
          return 0;
      }
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  const handleTopicSelect = (id: string) => {
    if (id === "leaderboard") {
      // Already on leaderboard page
      return;
    } else {
      router.push(`/topic/${id}`);
    }
  };

  return (
    <Layout
      activeId='leaderboard'
      selectedQuiz={null}
      onTopicSelect={handleTopicSelect}
    >
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Leaderboard</h1>
        <p className='text-gray-600 text-lg'>
          Compete with other learners and track your progress
        </p>
      </div>

      <Leaderboard
        entries={filteredEntries}
        filter={filter}
        onFilterChange={setFilter}
      />
    </Layout>
  );
}
