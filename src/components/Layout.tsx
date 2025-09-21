"use client";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { MOCK_CURRENT_USER } from "@/data/leaderboardData";
import { useTopics } from "@/hooks/useTopics";
import { CurrentUser } from "@/types";
import { ReactNode, useState } from "react";

interface LayoutProps {
  children: ReactNode;
  activeId: string;
  selectedExam?: string | null;
  currentUser?: CurrentUser;
  onTopicSelect: (id: string) => void;
  hideSidebar?: boolean;
}

export default function Layout({
  children,
  activeId,
  selectedExam = null,
  currentUser = MOCK_CURRENT_USER,
  onTopicSelect,
  hideSidebar = false,
}: LayoutProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Use TanStack Query for topics
  const { data: topics = [], isLoading: loading } = useTopics();

  const filtered = topics.filter((t) =>
    `${t.title} ${t.description}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  );

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header
        isOpen={open}
        onToggleMenu={() => setOpen((v) => !v)}
        currentUser={currentUser}
      />

      <div className='flex min-h-[calc(100vh-73px)]'>
        {/* Sidebar */}
        {!hideSidebar && (
          <div className='lg:w-80 flex-shrink-0'>
            <Sidebar
              topics={filtered}
              activeId={activeId}
              query={query}
              selectedExam={selectedExam}
              isOpen={open}
              loading={loading}
              onTopicSelect={onTopicSelect}
              onQueryChange={setQuery}
              onClose={() => setOpen(false)}
            />
          </div>
        )}

        {/* Main Content */}
        <main
          className={`flex-1 overflow-y-auto bg-gray-50 ${
            hideSidebar ? "max-w-6xl mx-auto" : "max-w-5xl mx-auto"
          }`}
        >
          <div
            className={`${hideSidebar ? "p-6 lg:p-8" : "p-4 sm:p-6 lg:p-8"}`}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
