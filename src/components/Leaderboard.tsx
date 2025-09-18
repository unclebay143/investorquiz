"use client";

import { formatDate, formatTime } from "@/data/leaderboardData";
import { LeaderboardEntry, LeaderboardFilter } from "@/types";
import {
  Award,
  Clock,
  Medal,
  Minus,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  filter: LeaderboardFilter;
  onFilterChange: (filter: LeaderboardFilter) => void;
}

export default function Leaderboard({
  entries,
  filter,
  onFilterChange,
}: LeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className='h-5 w-5 text-yellow-500' />;
      case 2:
        return <Medal className='h-5 w-5 text-gray-400' />;
      case 3:
        return <Award className='h-5 w-5 text-amber-600' />;
      default:
        return <span className='text-sm font-bold text-gray-500'>#{rank}</span>;
    }
  };

  const getChangeIcon = (change?: number) => {
    if (!change) return <Minus className='h-4 w-4 text-gray-400' />;
    if (change > 0) return <TrendingUp className='h-4 w-4 text-green-500' />;
    return <TrendingDown className='h-4 w-4 text-red-500' />;
  };

  const getChangeText = (change?: number) => {
    if (!change) return "";
    if (change > 0) return `+${change}`;
    return change.toString();
  };

  const getChangeColor = (change?: number) => {
    if (!change) return "text-gray-500";
    if (change > 0) return "text-green-600";
    return "text-red-600";
  };

  return (
    <div className='space-y-6'>
      {/* Filter Controls */}
      <div className='hidden bg-white rounded-xl border border-gray-200 p-6 shadow-sm'>
        <h2 className='text-lg font-semibold text-gray-900 mb-4'>
          Leaderboard Filters
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Time Period */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Time Period
            </label>
            <select
              value={filter.timePeriod}
              onChange={(e) =>
                onFilterChange({ ...filter, timePeriod: e.target.value as any })
              }
              className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value='all'>All Time</option>
              <option value='week'>This Week</option>
              <option value='month'>This Month</option>
              <option value='year'>This Year</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Sort By
            </label>
            <select
              value={filter.sortBy}
              onChange={(e) =>
                onFilterChange({ ...filter, sortBy: e.target.value as any })
              }
              className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value='score'>Total Score</option>
              <option value='exams'>Exams Completed</option>
              <option value='average'>Average Score</option>
              <option value='time'>Time Spent</option>
            </select>
          </div>

          {/* Topic Filter */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Topic
            </label>
            <select
              value={filter.topicId || "all"}
              onChange={(e) =>
                onFilterChange({
                  ...filter,
                  topicId:
                    e.target.value === "all" ? undefined : e.target.value,
                })
              }
              className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value='all'>All Topics</option>
              <option value='equity-analysis'>Equity Analysis</option>
              <option value='fixed-income'>Fixed Income</option>
              <option value='derivatives'>Derivatives</option>
              <option value='portfolio-management'>Portfolio Management</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Top Performers
          </h2>
          <p className='text-sm text-gray-600 mt-1'>
            {entries.length} participants • Updated{" "}
            {formatDate(new Date().toISOString())}
          </p>
        </div>

        <div className='divide-y divide-gray-200'>
          {entries.map((entry, index) => (
            <div
              key={entry.user.userId}
              className={`px-6 py-4 hover:bg-gray-50 transition-colors whitespace-nowrap ${
                index < 3
                  ? "bg-gradient-to-r from-blue-50/30 to-transparent"
                  : ""
              }`}
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  {/* Rank */}
                  <div className='flex items-center space-x-2'>
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* User Info */}
                  <div className='flex items-center space-x-3'>
                    <div className='relative'>
                      <img
                        src={
                          entry.user.userAvatar ||
                          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                        }
                        alt={entry.user.userName}
                        className='h-10 w-10 rounded-full object-cover'
                      />
                      {index < 3 && (
                        <div className='absolute -top-1 -right-1 h-4 w-4 bg-yellow-400 rounded-full flex items-center justify-center'>
                          <span className='text-xs font-bold text-white'>
                            {entry.rank}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className='font-medium text-gray-900'>
                        {entry.user.userName}
                      </h3>
                      <p className='text-xs text-gray-500'>
                        Last active {formatDate(entry.user.lastActivity)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats and Change */}
                <div className='flex items-center space-x-6'>
                  {/* Stats */}
                  <div className='flex items-center space-x-6 text-sm'>
                    <div className='text-center'>
                      <div className='font-semibold text-gray-900'>
                        {entry.user.totalScore}
                      </div>
                      <div className='text-gray-500 text-xs'>Total Score</div>
                    </div>
                    <div className='text-center'>
                      <div className='font-semibold text-gray-900'>
                        {entry.user.totalExams}
                      </div>
                      <div className='text-gray-500 text-xs'>Exams</div>
                    </div>
                    <div className='text-center'>
                      <div className='font-semibold text-gray-900'>
                        {entry.user.averageScore.toFixed(1)}%
                      </div>
                      <div className='text-gray-500 text-xs'>Average</div>
                    </div>
                    <div className='text-center'>
                      <div className='font-semibold text-gray-900'>
                        {entry.user.bestScore}
                      </div>
                      <div className='text-gray-500 text-xs'>Best Score</div>
                    </div>
                    <div className='text-center'>
                      <div className='font-semibold text-gray-900 flex items-center'>
                        <Clock className='h-4 w-4 mr-1' />
                        {formatTime(entry.user.totalTimeSpent)}
                      </div>
                      <div className='text-gray-500 text-xs'>Time Spent</div>
                    </div>
                  </div>

                  {/* Change Indicator - Moved to far right */}
                  <div className='flex items-center space-x-1 min-w-[60px] justify-end'>
                    {getChangeIcon(entry.change)}
                    <span
                      className={`text-xs font-medium ${getChangeColor(
                        entry.change
                      )}`}
                    >
                      {getChangeText(entry.change)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {entries.length === 0 && (
          <div className='px-6 py-12 text-center'>
            <Target className='h-12 w-12 text-gray-300 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No Results Found
            </h3>
            <p className='text-gray-500'>
              Try adjusting your filters to see more results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
