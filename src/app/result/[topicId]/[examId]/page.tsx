"use client";

import AuthorModal from "@/components/AuthorModal";
import Layout from "@/components/Layout";
import ResultsScreen from "@/components/ResultsScreen";
import { MOCK_TOPICS } from "@/data/mockData";
import { cleanupAttempts } from "@/lib/retakeUtils";
import { Author, ExamAttempts } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.topicId as string;
  const examId = params.examId as string;

  const [examData, setExamData] = useState<{
    score: number;
    timeSpentInSeconds: number;
    postExamAnswers: { [questionId: number]: string };
    shuffledQuestions?: {
      [questionId: number]: {
        shuffledOptions: { [key: string]: string };
        keyMapping: { [key: string]: string };
        correctShuffledKey: string;
      };
    };
  } | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [attempts, setAttempts] = useState<ExamAttempts>({});
  const [attemptSaved, setAttemptSaved] = useState(false);

  const topic = MOCK_TOPICS.find((t) => t.id === topicId);
  const exam = topic?.exams.find((e) => e.id === examId);

  // Load result data and attempts from localStorage
  useEffect(() => {
    const resultKey = `result-${topicId}-${examId}`;
    const resultData = localStorage.getItem(resultKey);
    const savedAttempts = localStorage.getItem("exam-attempts");

    if (resultData) {
      setExamData(JSON.parse(resultData));
    } else {
      // If no result data, redirect to topic
      router.push(`/topic/${topicId}`);
    }

    if (savedAttempts) {
      const parsedAttempts = JSON.parse(savedAttempts);
      // Clean up duplicate attempts and keep only the latest 5 per exam
      const cleanedAttempts = cleanupAttempts(parsedAttempts, 5);
      setAttempts(cleanedAttempts);
      // Save the cleaned attempts back to localStorage
      localStorage.setItem("exam-attempts", JSON.stringify(cleanedAttempts));
    }
  }, [topicId, examId, router]);

  // Note: Attempts are saved when the exam is completed, not when viewing results

  const handleBackToExams = () => {
    router.push(`/topic/${topicId}`);
  };

  const handleRetakeExam = () => {
    // Clear current exam session and start fresh
    const sessionKey = `exam-${topicId}-${examId}`;
    localStorage.removeItem(sessionKey);
    router.push(`/exam/${topicId}/${examId}`);
  };

  const handleTopicSelect = (id: string) => {
    if (id === "leaderboard") {
      router.push("/leaderboard");
    } else {
      router.push(`/topic/${id}`);
    }
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

  return (
    <>
      <Layout
        activeId={topicId}
        selectedExam={null}
        onTopicSelect={handleTopicSelect}
      >
        <ResultsScreen
          exam={exam}
          score={examData.score}
          timeSpentInSeconds={examData.timeSpentInSeconds}
          postExamAnswers={examData.postExamAnswers}
          shuffledQuestions={examData.shuffledQuestions || {}}
          topicId={topicId}
          onBackToExams={handleBackToExams}
          onViewAuthor={setSelectedAuthor}
          onRetakeExam={handleRetakeExam}
        />
      </Layout>

      {/* Author Profile Modal */}
      <AuthorModal
        author={selectedAuthor}
        onClose={() => setSelectedAuthor(null)}
      />
    </>
  );
}
