"use client";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { MOCK_CURRENT_USER } from "@/data/leaderboardData";
import { CurrentUser, Topic } from "@/types";
import { ReactNode, useEffect, useState } from "react";

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
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch topics from API (only once)
  useEffect(() => {
    // Check if topics are already cached in sessionStorage
    const cachedTopics = sessionStorage.getItem("topics");
    if (cachedTopics) {
      try {
        const parsedTopics = JSON.parse(cachedTopics);
        setTopics(parsedTopics);
        setLoading(false);
        return;
      } catch (error) {
        console.error("Failed to parse cached topics:", error);
      }
    }

    const fetchTopics = async () => {
      try {
        const response = await fetch("/api/topics");
        if (response.ok) {
          const topicsData = await response.json();
          // Transform API data to match our Topic type
          const transformedTopics: Topic[] = topicsData.map((topic: any) => ({
            id: topic.slug,
            title: topic.title,
            description: topic.description || "",
            exams: Array(topic.examCount || 0).fill(null), // Mock exams array for count
            isNew: topic.isNew,
          }));
          setTopics(transformedTopics);
          // Cache topics in sessionStorage
          sessionStorage.setItem("topics", JSON.stringify(transformedTopics));
        }
      } catch (error) {
        console.error("Failed to fetch topics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

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
