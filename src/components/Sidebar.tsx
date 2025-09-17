"use client";

import { Topic } from "@/types";
import { Search } from "lucide-react";

interface SidebarProps {
  topics: Topic[];
  activeId: string;
  query: string;
  selectedExam: string | null;
  onTopicSelect: (topicId: string) => void;
  onQueryChange: (query: string) => void;
  onClose: () => void;
}

export default function Sidebar({
  topics,
  activeId,
  query,
  selectedExam,
  onTopicSelect,
  onQueryChange,
  onClose,
}: SidebarProps) {
  return (
    <aside className='w-80 bg-white border-r border-gray-200 flex flex-col pt-[73px] lg:pt-0 fixed inset-y-0 left-0 z-30 md:relative -translate-x-full transition-transform duration-300 ease-out lg:translate-x-0'>
      <div className='p-4 border-b border-gray-200'>
        <h2 className='text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3'>
          Topics
        </h2>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder='Search topics...'
            className='w-full h-10 rounded-lg border border-gray-300 pl-9 pr-3 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50'
            disabled={!!selectedExam}
          />
        </div>
      </div>
      <nav className='flex-1 overflow-y-auto p-4 space-y-1'>
        {topics.map((topic) => {
          const isActive = topic.id === activeId;
          const disableInteractions = !!selectedExam;
          const hasExams = topic.exams.length > 0;
          const isDisabled = disableInteractions || !hasExams;

          return (
            <button
              key={topic.id}
              onClick={() => {
                if (isDisabled) return;
                onTopicSelect(topic.id);
                onClose();
              }}
              className={`w-full text-left rounded-lg px-3 py-3 text-sm transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                isActive && hasExams
                  ? "bg-blue-50 text-blue-900 border border-blue-200 shadow-sm"
                  : "text-gray-700 hover:text-gray-900"
              } ${
                isDisabled &&
                "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-700"
              }`}
              disabled={isDisabled}
            >
              <div className='flex items-center justify-between'>
                <div className='text-sm font-medium'>{topic.title}</div>
                <div className='flex gap-1'>
                  {!hasExams ? (
                    <span className='px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full whitespace-nowrap'>
                      Coming Soon
                    </span>
                  ) : (
                    topic.isNew && (
                      <span className='px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full whitespace-nowrap'>
                        New
                      </span>
                    )
                  )}
                </div>
              </div>
              <div className='text-xs text-gray-500 mt-1 line-clamp-2'>
                {topic.description}
              </div>
            </button>
          );
        })}
        {topics.length === 0 && (
          <div className='text-sm text-gray-500 px-3 py-2'>
            No topics found.
          </div>
        )}
      </nav>
    </aside>
  );
}
