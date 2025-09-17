"use client";

import AuthorModal from "@/components/AuthorModal";
import Header from "@/components/Header";
import ResultsScreen from "@/components/ResultsScreen";
import Sidebar from "@/components/Sidebar";
import { MOCK_TOPICS } from "@/data/mockData";
import { Author } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.topicId as string;
  const examId = params.examId as string;

  const [examData, setExamData] = useState<{
    score: number;
    timeSpent: number;
    postExamAnswers: { [questionId: number]: string };
  } | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const topic = MOCK_TOPICS.find((t) => t.id === topicId);
  const exam = topic?.exams.find((e) => e.id === examId);

  // Load result data from localStorage
  useEffect(() => {
    const resultKey = `result-${topicId}-${examId}`;
    const resultData = localStorage.getItem(resultKey);

    if (resultData) {
      setExamData(JSON.parse(resultData));
    } else {
      // If no result data, redirect to topic
      router.push(`/topic/${topicId}`);
    }
  }, [topicId, examId, router]);

  const handleBackToExams = () => {
    router.push(`/topic/${topicId}`);
  };

  if (!topic || !exam || !examData) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            Result Not Found
          </h1>
          <p className='text-gray-600 mb-4'>
            The result you're looking for doesn't exist or has expired.
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

  const filtered = MOCK_TOPICS.filter((t) =>
    `${t.title} ${t.description}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  );

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
            <ResultsScreen
              exam={exam}
              score={examData.score}
              timeSpent={examData.timeSpent}
              postExamAnswers={examData.postExamAnswers}
              onBackToExams={handleBackToExams}
              onViewAuthor={setSelectedAuthor}
            />
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
