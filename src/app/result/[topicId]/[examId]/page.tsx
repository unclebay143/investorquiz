"use client";

import AuthorModal from "@/components/AuthorModal";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import ResultsScreen from "@/components/ResultsScreen";
import { useExams } from "@/hooks/useExams";
import { shuffleQuestionOptions } from "@/lib/utils";
import { Author } from "@/types";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const topicSlug = params.topicId as string; // Keep as topicId for backward compatibility
  const examSlug = params.examId as string; // Keep as examId for backward compatibility

  const [attemptData, setAttemptData] = useState<{
    score: number;
    timeSpentInSeconds: number;
    answers: { [questionId: number]: string };
    completedAt: string;
    attemptNumber: number;
    grade: string;
    isBestScore: boolean;
  } | null>(null);
  const [shuffledQuestions, setShuffledQuestions] = useState<{
    [questionId: number]: {
      shuffledOptions: { [key: string]: string };
      keyMapping: { [key: string]: string };
      correctShuffledKey: string;
    };
  }>({});
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);

  // Use TanStack Query for exam data
  const { data: examsData, isLoading: loading } = useExams(topicSlug);

  // Find current exam from exams data
  const exam = examsData?.exams?.find((e: any) => e.slug === examSlug) || null;

  // Initialize shuffled questions when exam is loaded
  useEffect(() => {
    if (!exam) return;

    // Generate shuffled questions
    const shuffled: {
      [questionId: number]: {
        shuffledOptions: { [key: string]: string };
        keyMapping: { [key: string]: string };
        correctShuffledKey: string;
      };
    } = {};
    exam.questions.forEach((question) => {
      shuffled[question.id] = shuffleQuestionOptions(question);
    });
    setShuffledQuestions(shuffled);
  }, [exam]);

  // Fetch attempt data
  useEffect(() => {
    const fetchAttemptData = async () => {
      if (!session?.user || !examSlug || !topicSlug) return;

      try {
        const attemptResponse = await fetch(
          `/api/attempts/status?topicSlug=${topicSlug}&examSlug=${examSlug}`
        );
        if (attemptResponse.ok) {
          const attemptStatus = await attemptResponse.json();
          if (attemptStatus.status === "completed") {
            setAttemptData({
              score: attemptStatus.score,
              timeSpentInSeconds: attemptStatus.timeSpentInSeconds,
              answers: attemptStatus.answers,
              completedAt: attemptStatus.completedAt,
              attemptNumber: attemptStatus.attemptNumber,
              grade: attemptStatus.grade,
              isBestScore: attemptStatus.isBestScore,
            });
          } else {
            // No completed attempt found, redirect to topic
            router.push(`/topic/${topicSlug}`);
            return;
          }
        } else if (attemptResponse.status === 401) {
          router.push("/");
          return;
        } else {
          console.error("Failed to fetch attempt data");
          router.push(`/topic/${topicSlug}`);
          return;
        }
      } catch (error) {
        console.error("Error fetching attempt data:", error);
        router.push(`/topic/${topicSlug}`);
      }
    };

    if (status === "loading") return;

    if (!session?.user) {
      console.log("No session, redirecting to home");
      router.push("/");
      return;
    }

    fetchAttemptData();
  }, [examSlug, topicSlug, session, status, router]);

  const handleAuthorClick = (author: Author) => {
    setSelectedAuthor(author);
  };

  const handleRetakeExam = () => {
    router.push(`/exam/${topicSlug}/${examSlug}`);
  };

  const handleBackToTopic = () => {
    router.push(`/topic/${topicSlug}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
          <div className='text-center'>
            <LoadingSpinner className='mb-4' />
            <p className='text-gray-600'>Loading results...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!exam || !attemptData) {
    return (
      <Layout>
        <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>
              Results Not Found
            </h1>
            <p className='text-gray-600 mb-4'>
              The results you're looking for don't exist.
            </p>
            <button
              onClick={() => router.push(`/topic/${topicSlug}`)}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
            >
              Back to Topic
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className='min-h-screen bg-gray-50'>
        <ResultsScreen
          exam={exam}
          attemptData={attemptData}
          shuffledQuestions={shuffledQuestions}
          onAuthorClick={handleAuthorClick}
          onRetakeExam={handleRetakeExam}
          onBackToTopic={handleBackToTopic}
        />

        {selectedAuthor && (
          <AuthorModal
            author={selectedAuthor}
            onClose={() => setSelectedAuthor(null)}
          />
        )}
      </div>
    </Layout>
  );
}
