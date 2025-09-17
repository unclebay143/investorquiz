"use client";

import AuthorModal from "@/components/AuthorModal";
import ExamCard from "@/components/ExamCard";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { MOCK_TOPICS } from "@/data/mockData";
import { Author } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TopicPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.topicId as string;

  const [query, setQuery] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [completedExams, setCompletedExams] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);

  const topic = MOCK_TOPICS.find((t) => t.id === topicId);

  // Load completed exams from localStorage
  useEffect(() => {
    const completed = localStorage.getItem("completedExams");
    if (completed) {
      setCompletedExams(new Set(JSON.parse(completed)));
    }
  }, []);

  const filtered = MOCK_TOPICS.filter((t) =>
    `${t.title} ${t.description}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  );

  if (!topic) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            Topic Not Found
          </h1>
          <p className='text-gray-600 mb-4'>
            The topic you're looking for doesn't exist.
          </p>
          <button
            onClick={() => router.push("/")}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const handleStartExam = (examId: string) => {
    router.push(`/exam/${topicId}/${examId}`);
  };

  const handleViewResult = (examId: string) => {
    router.push(`/result/${topicId}/${examId}`);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header isOpen={open} onToggleMenu={() => setOpen((v) => !v)} />

      <div className='flex h-[calc(100vh-73px)]'>
        {/* Sidebar */}
        <Sidebar
          topics={filtered}
          activeId={topicId}
          query={query}
          selectedExam={null}
          isOpen={open}
          onTopicSelect={(id) => router.push(`/topic/${id}`)}
          onQueryChange={setQuery}
          onClose={() => setOpen(false)}
        />

        {/* Main Content */}
        <main className='flex-1 overflow-y-auto bg-gray-50'>
          <div className='p-4 sm:p-6 lg:p-8'>
            <div className='mb-8'>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                {topic.title}
              </h1>
              <p className='text-gray-600 text-lg'>{topic.description}</p>
            </div>

            <section className='grid gap-3'>
              {topic.exams.length > 0 ? (
                topic.exams.map((exam) => {
                  const isCompleted = completedExams.has(
                    `${topicId}-${exam.id}`
                  );
                  return (
                    <ExamCard
                      key={exam.id}
                      exam={exam}
                      selectedExam={null}
                      onStartExam={handleStartExam}
                      onViewAuthor={setSelectedAuthor}
                      onViewResult={isCompleted ? handleViewResult : undefined}
                      isCompleted={isCompleted}
                    />
                  );
                })
              ) : (
                <div className='text-center py-12'>
                  <div className='w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center'>
                    <div className='w-8 h-8 bg-gray-300 rounded-lg'></div>
                  </div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    No exams available
                  </h3>
                  <p className='text-gray-500'>Content will be added soon.</p>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* Author Profile Modal */}
      <AuthorModal
        author={selectedAuthor}
        onClose={() => setSelectedAuthor(null)}
      />
    </div>
  );
}
