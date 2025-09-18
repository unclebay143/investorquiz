"use client";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { MOCK_CURRENT_USER } from "@/data/leaderboardData";
import { MOCK_TOPICS } from "@/data/mockData";
import { CurrentUser } from "@/types";
import { ReactNode, useState } from "react";

interface LayoutProps {
  children: ReactNode;
  activeId: string;
  selectedExam?: string | null;
  currentUser?: CurrentUser;
  onTopicSelect: (id: string) => void;
}

export default function Layout({
  children,
  activeId,
  selectedExam = null,
  currentUser = MOCK_CURRENT_USER,
  onTopicSelect,
}: LayoutProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = MOCK_TOPICS.filter((t) =>
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

      <div className='flex h-[calc(100vh-73px)]'>
        {/* Sidebar */}
        <Sidebar
          topics={filtered}
          activeId={activeId}
          query={query}
          selectedExam={selectedExam}
          isOpen={open}
          onTopicSelect={onTopicSelect}
          onQueryChange={setQuery}
          onClose={() => setOpen(false)}
        />

        {/* Main Content */}
        <main className='flex-1 overflow-y-auto bg-gray-50'>
          <div className='p-4 sm:p-6 lg:p-8'>{children}</div>
        </main>
      </div>
    </div>
  );
}
