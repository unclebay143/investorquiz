import { CurrentUser, LeaderboardEntry } from "@/types";

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    change: 0,
    user: {
      userId: "user-1",
      userName: "Alex Chen",
      userAvatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      totalScore: 2850,
      totalExams: 12,
      averageScore: 87.5,
      bestScore: 95,
      totalTimeSpent: 18450, // ~5 hours
      lastActivity: "2024-01-15T10:30:00Z",
      completedExams: [
        {
          topicId: "equity-analysis",
          examId: "advanced-valuation",
          score: 95,
          timeSpentInSeconds: 1200,
          completedAt: "2024-01-15T10:30:00Z",
        },
        {
          topicId: "fixed-income",
          examId: "bond-pricing",
          score: 88,
          timeSpentInSeconds: 900,
          completedAt: "2024-01-14T15:20:00Z",
        },
      ],
    },
  },
  {
    rank: 2,
    change: 1,
    user: {
      userId: "user-2",
      userName: "Sarah Johnson",
      userAvatar: "https://github.com/unclebay143.png",
      totalScore: 2720,
      totalExams: 15,
      averageScore: 85.2,
      bestScore: 92,
      totalTimeSpent: 22100, // ~6 hours
      lastActivity: "2024-01-15T09:15:00Z",
      completedExams: [
        {
          topicId: "derivatives",
          examId: "options-strategies",
          score: 92,
          timeSpentInSeconds: 1100,
          completedAt: "2024-01-15T09:15:00Z",
        },
      ],
    },
  },
  {
    rank: 3,
    change: -1,
    user: {
      userId: "user-3",
      userName: "Michael Rodriguez",
      userAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      totalScore: 2650,
      totalExams: 10,
      averageScore: 88.3,
      bestScore: 96,
      totalTimeSpent: 15600, // ~4.3 hours
      lastActivity: "2024-01-14T16:45:00Z",
      completedExams: [
        {
          topicId: "portfolio-management",
          examId: "risk-assessment",
          score: 96,
          timeSpentInSeconds: 1350,
          completedAt: "2024-01-14T16:45:00Z",
        },
      ],
    },
  },
  {
    rank: 4,
    change: 2,
    user: {
      userId: "user-4",
      userName: "Emily Watson",
      userAvatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      totalScore: 2480,
      totalExams: 8,
      averageScore: 86.7,
      bestScore: 94,
      totalTimeSpent: 12800, // ~3.6 hours
      lastActivity: "2024-01-15T11:20:00Z",
      completedExams: [
        {
          topicId: "equity-analysis",
          examId: "financial-modeling",
          score: 94,
          timeSpentInSeconds: 1400,
          completedAt: "2024-01-15T11:20:00Z",
        },
      ],
    },
  },
  {
    rank: 5,
    change: -1,
    user: {
      userId: "user-5",
      userName: "David Kim",
      userAvatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      totalScore: 2310,
      totalExams: 11,
      averageScore: 84.1,
      bestScore: 91,
      totalTimeSpent: 19200, // ~5.3 hours
      lastActivity: "2024-01-14T14:30:00Z",
      completedExams: [
        {
          topicId: "fixed-income",
          examId: "yield-curve",
          score: 91,
          timeSpentInSeconds: 950,
          completedAt: "2024-01-14T14:30:00Z",
        },
      ],
    },
  },
  {
    rank: 6,
    change: 0,
    user: {
      userId: "user-6",
      userName: "Lisa Park",
      userAvatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      totalScore: 2180,
      totalExams: 9,
      averageScore: 82.6,
      bestScore: 89,
      totalTimeSpent: 14500, // ~4 hours
      lastActivity: "2024-01-13T17:10:00Z",
      completedExams: [
        {
          topicId: "derivatives",
          examId: "futures-pricing",
          score: 89,
          timeSpentInSeconds: 1000,
          completedAt: "2024-01-13T17:10:00Z",
        },
      ],
    },
  },
  {
    rank: 7,
    change: 3,
    user: {
      userId: "user-7",
      userName: "James Wilson",
      userAvatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
      totalScore: 2050,
      totalExams: 7,
      averageScore: 85.4,
      bestScore: 93,
      totalTimeSpent: 11200, // ~3.1 hours
      lastActivity: "2024-01-15T08:45:00Z",
      completedExams: [
        {
          topicId: "portfolio-management",
          examId: "asset-allocation",
          score: 93,
          timeSpentInSeconds: 1200,
          completedAt: "2024-01-15T08:45:00Z",
        },
      ],
    },
  },
  {
    rank: 8,
    change: -2,
    user: {
      userId: "user-8",
      userName: "Maria Garcia",
      userAvatar:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face",
      totalScore: 1920,
      totalExams: 6,
      averageScore: 83.5,
      bestScore: 90,
      totalTimeSpent: 9800, // ~2.7 hours
      lastActivity: "2024-01-12T13:25:00Z",
      completedExams: [
        {
          topicId: "equity-analysis",
          examId: "technical-analysis",
          score: 90,
          timeSpentInSeconds: 800,
          completedAt: "2024-01-12T13:25:00Z",
        },
      ],
    },
  },
];

// Helper function to format time
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Helper function to format date
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) {
    return "Just now";
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInHours < 48) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString();
  }
};

// Mock current user data
export const MOCK_CURRENT_USER: CurrentUser = {
  userId: "current-user",
  userName: "You",
  userAvatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
  totalScore: 1920,
  rank: 8,
  examsCompleted: 6,
};
