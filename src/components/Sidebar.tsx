"use client";

import { Topic } from "@/types";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";

interface SidebarProps {
  topics: Topic[];
  activeId: string;
  query: string;
  selectedQuiz: string | null;
  isOpen: boolean;
  loading?: boolean;
  onTopicSelect: (topicId: string) => void;
  onQueryChange: (query: string) => void;
  onClose: () => void;
  onToggle?: () => void;
}

export default function Sidebar({
  topics,
  activeId,
  query,
  selectedQuiz,
  isOpen,
  loading = false,
  onTopicSelect,
  onQueryChange,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const isResultPage = pathname.includes("/result/");
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className='fixed inset-0 bg-black/10 backdrop-blur-[1px] z-20 lg:hidden'
          onClick={onClose}
          aria-hidden='true'
        />
      )}

      <aside
        className={`lg:w-80 bg-white border-r border-gray-200 flex flex-col pt-[73px] lg:pt-0 fixed inset-y-0 left-0 z-30 lg:sticky lg:top-[73px] lg:h-[calc(100vh-73px)] transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
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
              disabled={!isResultPage && !!selectedQuiz}
            />
          </div>
        </div>
        <nav className='flex-1 overflow-y-auto p-4 space-y-1'>
          {loading ? (
            // Skeleton loading state
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className='w-full rounded-lg px-3 py-3 animate-pulse'
                >
                  <div className='flex items-center justify-between'>
                    <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                    <div className='flex gap-1'>
                      {i === 1 && (
                        <div className='h-5 bg-gray-200 rounded-full w-12'></div>
                      )}
                    </div>
                  </div>
                  <div className='h-3 bg-gray-200 rounded w-full mt-1'></div>
                  <div className='h-3 bg-gray-200 rounded w-2/3 mt-1'></div>
                </div>
              ))}
            </>
          ) : (
            // Actual content
            <>
              {/* Leaderboard Link */}
              {/* <button
                onClick={() => {
                  onTopicSelect("leaderboard");
                  onClose();
                }}
                className={`w-full text-left rounded-lg px-3 py-3 text-sm transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                  activeId === "leaderboard"
                    ? "bg-blue-50 text-blue-900 border border-blue-200 shadow-sm"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                <div className='flex items-center space-x-3'>
                  <Trophy className='h-4 w-4' />
                  <div>
                    <div className='text-sm font-medium'>Leaderboard</div>
                    <div className='text-xs text-gray-500'>Top performers</div>
                  </div>
                </div>
              </button> */}

              {/* Divider */}
              {/* <div className='my-4 border-t border-gray-200'></div> */}

              {topics.map((topic) => {
                const isActive = topic.id === activeId;
                // Allow navigation on result pages, disable only when actively taking an quiz
                const disableInteractions = !isResultPage && !!selectedQuiz;
                const isDisabled = disableInteractions;

                return (
                  <button
                    key={topic.id}
                    onClick={() => {
                      if (isDisabled) return;
                      onTopicSelect(topic.id);
                      onClose();
                    }}
                    className={`w-full text-left rounded-lg px-4 py-4 text-base lg:text-sm transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                      isActive
                        ? "bg-blue-50 text-blue-900 border border-blue-200 shadow-sm"
                        : "text-gray-700 hover:text-gray-900"
                    } ${
                      isDisabled &&
                      "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-700"
                    }`}
                    disabled={isDisabled}
                  >
                    <div className='flex items-center justify-between'>
                      <div className='text-base lg:text-sm font-medium'>
                        {topic.title}
                      </div>
                      <div className='flex gap-1'>
                        {
                          // if created in the last 30 days
                          topic.createdAt &&
                            topic.createdAt.getTime() >
                              Date.now() - 30 * 24 * 60 * 60 * 1000 && (
                              <span className='px-2 py-1 text-[10px] lg:text-xs font-medium bg-green-100 text-green-700 rounded-full whitespace-nowrap'>
                                New
                              </span>
                            )
                        }
                      </div>
                    </div>
                    <div className='text-sm lg:text-xs text-gray-500 mt-1 line-clamp-2'>
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
            </>
          )}
        </nav>

        {/* Sidebar Footer Motivation */}
        <div className='mt-auto p-4 border-t border-gray-200'>
          <p className='text-xs text-gray-600'>
            Practice makes perfect. Keep learning, keep asking and answering
            questions and you&apos;ll become an investor master in no time!
          </p>
          <div className='mt-2'>
            <a
              href='https://x.com/intent/user?screen_name=unclebigbay143'
              target='_blank'
              rel='noopener noreferrer'
              className='text-xs font-medium text-blue-600 hover:text-blue-700'
            >
              <span className="text-gray-600">
              Need help?
              </span>{" "}
              <span className="text-blue-600 hover:text-blue-700 underline">
              Contact support on X
              </span>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
