"use client";

import AuthorModal from "@/components/AuthorModal";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import ResultsScreen from "@/components/ResultsScreen";
import { useQuiz } from "@/hooks/useQuiz";
import { Author } from "@/types";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const topicSlug = params.topicId as string; // Keep as topicId for backward compatibility
  const quizSlug = params.quizId as string; // Keep as quizId for backward compatibility

  const [attemptData, setAttemptData] = useState<{
    score: number;
    timeSpentInSeconds: number;
    answers: { [questionId: number]: string };
    shuffledQuestions: {
      [questionId: number]: {
        shuffledOptions: { [key: string]: string };
        keyMapping: { [key: string]: string };
        correctShuffledKey: string;
      };
    };
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
  const [isLoadingAttempt, setIsLoadingAttempt] = useState(true);

  const { data: quizData, isLoading: loading } = useQuiz(quizSlug, { 
    includeAttempts: true, 
    includeAnswers: true 
  });
  const quiz = useMemo(() => {
    if (!quizData) return null;
    return {
      ...quizData,
      id: quizData.slug,
      description: quizData.description || "",
      author: quizData.author
        ? {
            ...quizData.author,
            id: quizData.author._id,
            title: quizData.author.title || "",
            bio: quizData.author.bio || "",
          }
        : undefined,
    };
  }, [quizData]);

  // Use embedded attempts from single-quiz API to avoid extra calls
  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/");
      return;
    }

    if (!quizData) return;

    const attempts = (quizData as any)?.attempts as Array<any> | undefined;
    if (!attempts || attempts.length === 0) {
      router.push(`/topic/${topicSlug}`);
      return;
    }

    // Build attempts data for ResultsScreen prop shape
    const attemptsData = {
      [`${topicSlug}-${quizSlug}`]: attempts.map((a) => ({
        quizId: quizSlug,
        topicId: topicSlug,
        attemptNumber: a.attemptNumber,
        score: a.score,
        timeSpentInSeconds: a.timeSpentInSeconds ?? 0,
        answers: a.answers || {},
        shuffledQuestions: a.shuffledQuestions || {},
        completedAt: a.completedAt,
        grade: a.grade,
        isBestScore: !!a.isBestScore,
      })),
    } as const;

    // Use latest attempt for top-level values
    const latest = attemptsData[`${topicSlug}-${quizSlug}`][0];
    setAttemptData({
      score: latest.score,
      timeSpentInSeconds: latest.timeSpentInSeconds,
      answers: latest.answers,
      shuffledQuestions: latest.shuffledQuestions,
      completedAt: latest.completedAt,
      attemptNumber: latest.attemptNumber,
      grade: latest.grade,
      isBestScore: latest.isBestScore,
    });
    setShuffledQuestions(latest.shuffledQuestions || {});
    // Persist attempts prop structure for ResultsScreen
    // We pass it directly below via attempts={attemptsData}
    setIsLoadingAttempt(false);
  }, [quizData, session, status, router, topicSlug]);

  const handleAuthorClick = (author: Author) => {
    setSelectedAuthor(author);
  };

  const handleRetakeQuiz = () => {
    router.push(`/quiz/${topicSlug}/${quizSlug}`);
  };

  const handleBackToTopic = () => {
    router.push(`/topic/${topicSlug}`);
  };

  const handleSidebarTopicSelect = (id: string) => {
    router.push(`/topic/${id}`);
  };

  // Show loading while data is being fetched
  if (loading || isLoadingAttempt) {
    return (
      <Layout
        activeId={topicSlug}
        onTopicSelect={handleSidebarTopicSelect}
        defaultCollapsed={true}
      >
        <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
          <div className='text-center'>
            <LoadingSpinner className='mb-4' />
            <p className='text-gray-600'>Loading results...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error if quiz or attempt data is missing after loading
  if (!quiz || !attemptData) {
    return (
      <Layout
        activeId={topicSlug}
        onTopicSelect={() => {}}
        defaultCollapsed={true}
      >
        <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>
              Results Not Found
            </h1>
            <p className='text-gray-600 mb-4'>
              The results you&apos;re looking for don&apos;t exist.
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

  // Create attempts data structure for ResultsScreen
  // attemptsData now comes from the single-quiz API build above
  const attemptsData = {
    [`${topicSlug}-${quizSlug}`]: attemptData
      ? [
          {
            quizId: quizSlug,
            topicId: topicSlug,
            attemptNumber: attemptData.attemptNumber,
            score: attemptData.score,
            timeSpentInSeconds: attemptData.timeSpentInSeconds,
            answers: attemptData.answers,
            shuffledQuestions: attemptData.shuffledQuestions,
            completedAt: attemptData.completedAt,
            grade: attemptData.grade,
            isBestScore: attemptData.isBestScore,
          },
        ]
      : [],
  };

  return (
    <Layout
      activeId={topicSlug}
      onTopicSelect={handleSidebarTopicSelect}
      defaultCollapsed={true}
    >
      <div className='min-h-screen bg-gray-50'>
        <ResultsScreen
          quiz={quiz}
          score={attemptData.score}
          timeSpentInSeconds={attemptData.timeSpentInSeconds}
          postQuizAnswers={attemptData.answers}
          shuffledQuestions={shuffledQuestions}
          topicId={topicSlug}
          onBackToQuizzes={handleBackToTopic}
          onViewAuthor={handleAuthorClick}
          onRetakeQuiz={handleRetakeQuiz}
          attempts={attemptsData}
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