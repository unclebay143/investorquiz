"use client";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { MOCK_CURRENT_USER } from "@/data/leaderboardData";
import { useTopics } from "@/hooks/useTopics";
import { CurrentUser } from "@/types";
import { ReactNode, useEffect, useState } from "react";

interface LayoutProps {
  children: ReactNode;
  activeId: string;
  selectedQuiz?: string | null;
  currentUser?: CurrentUser;
  onTopicSelect: (id: string) => void;
  defaultCollapsed?: boolean; // collapse sidebar by default on desktop
}

export default function Layout({
  children,
  activeId,
  selectedQuiz = null,
  currentUser = MOCK_CURRENT_USER,
  onTopicSelect,
  defaultCollapsed = false,
}: LayoutProps) {
  const [open, setOpen] = useState(false); // mobile drawer
  const [collapsed, setCollapsed] = useState(defaultCollapsed); // desktop sidebar collapse
  useEffect(() => {
    setCollapsed(defaultCollapsed);
  }, [defaultCollapsed]);
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
        desktopOpen={!collapsed}
        onToggleMenu={() => {
          // Toggle mobile drawer on small screens, collapse on desktop
          if (typeof window !== "undefined" && window.innerWidth >= 1024) {
            setCollapsed((v) => !v);
          } else {
            setOpen((v) => !v);
          }
        }}
        currentUser={currentUser}
      />

      <div className='flex min-h-[calc(100vh-73px)]'>
        {/* Sidebar */}
        <div
          className={`lg:w-80 flex-shrink-0 ${
            collapsed ? "lg:hidden" : "lg:block"
          }`}
        >
          <Sidebar
            topics={filtered}
            activeId={activeId}
            query={query}
            selectedQuiz={selectedQuiz}
            isOpen={open}
            loading={loading}
            onTopicSelect={onTopicSelect}
            onQueryChange={setQuery}
            onClose={() => setOpen(false)}
            onToggle={() => setCollapsed((v) => !v)}
          />
        </div>

        {/* Main Content */}
        <main
          className={`flex-1 overflow-y-auto bg-gray-50 ${
            collapsed ? "max-w-7xl mx-auto" : "lg:max-w-8/12 mx-auto"
          }`}
        >
          <div className='p-4 sm:p-6 lg:p-8'>{children}</div>
        </main>
      </div>
    </div>
  );
}
