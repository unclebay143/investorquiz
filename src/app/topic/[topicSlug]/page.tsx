"use client";

import AuthModal from "@/components/AuthModal";
import AuthorModal from "@/components/AuthorModal";
import Layout from "@/components/Layout";
import { investmentTips } from "@/components/LoadingScreen";
import QuizCard from "@/components/QuizCard";
import QuotesModal from "@/components/QuotesModal";
import { useQuizzes } from "@/hooks/useQuizzes";
import { useTopics } from "@/hooks/useTopics";
import { buttonStyles } from "@/lib/utils";
import { Author, Quiz } from "@/types";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TopicPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const topicSlug = params.topicSlug as string;

  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [showQuotesModal, setShowQuotesModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loadingQuizId, setLoadingQuizId] = useState<string | null>(null);

  // Use TanStack Query for data
  const { data: topics } = useTopics();
  const { data: quizzesData, isLoading, error } = useQuizzes(topicSlug);

  // Find current topic from topics data
  const topic = topics?.find((t) => t.id === topicSlug);

  const quizzes: Quiz[] =
    quizzesData?.quizzes?.map((quiz: any) => ({
      id: quiz.slug,
      title: quiz.title,
      description: quiz.description || "",
      totalPoints: quiz.totalPoints,
      questions: quiz.questions || [],
      reviewMode: quiz.reviewMode,

      author: quiz.author
        ? {
            id: quiz.author._id || quiz.author.slug,
            name: quiz.author.name,
            title: quiz.author.title || "",
            bio: quiz.author.bio || "",
            profileImage: quiz.author.profileImage,
            socialLinks: quiz.author.socialLinks,
            books: quiz.author.books,
            quote: quiz.author.quote,
          }
        : undefined,
      retakeSettings: quiz.retakeSettings,
    })) || [];

  const attemptStatuses = quizzesData?.attemptStatuses || {};

  // Avoid hydration mismatch: choose random tip only on client after mount
  const [hasMounted, setHasMounted] = useState(false);
  const [loadingTip, setLoadingTip] = useState("");

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Keep one tip for the duration of visible loading UI
  useEffect(() => {
    if (!hasMounted) return;
    const loadingUIVisible = isLoading || quizzes.length === 0;

    if (loadingUIVisible) {
      if (!loadingTip) {
        const tip =
          investmentTips[Math.floor(Math.random() * investmentTips.length)];
        setLoadingTip(tip);
      }
    } else {
      // Reset when loading UI goes away, so next session picks a new tip
      if (loadingTip) setLoadingTip("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMounted, isLoading, quizzes.length]);

  // Handle authentication
  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      return;
    }
  }, [session, status, router]);

  // Handle API errors
  useEffect(() => {
    if (error) {
      console.error("[TopicPage] Failed to fetch quizzes:", error);
    }
  }, [error]);

  // Handle error state
  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            Error Loading Topic
          </h1>
          <p className='text-gray-600 mb-4'>
            There was an error loading the topic data.
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

  const handleStartQuiz = async (quizId: string) => {
    if (!session?.user) {
      setShowAuthModal(true);
      return;
    }
    setLoadingQuizId(quizId);
    try {
      const quizRes = await fetch(
        `/api/quizzes/${quizId}?includeAttempts=true`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );
      if (quizRes.ok) {
        const quizData = await quizRes.json();
        const inProgress = Array.isArray(quizData?.attempts)
          ? quizData.attempts.find((a: any) => a?.inProgress)
          : null;
        if (inProgress) {
          router.push(`/quiz/${topicSlug}/${quizId}`);
          setLoadingQuizId(null);
          return;
        }
      }
      const res = await fetch("/api/attempts/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicSlug,
          quizSlug: quizId,
        }),
      });
      if (res.ok) {
        router.push(`/quiz/${topicSlug}/${quizId}`);
      } else {
        const error = await res.json();
        console.error("Failed to start attempt:", error);
        router.push(`/quiz/${topicSlug}/${quizId}`);
      }
    } catch (error) {
      console.error("Failed to start attempt:", error);
      router.push(`/quiz/${topicSlug}/${quizId}`);
    } finally {
      setLoadingQuizId(null);
    }
  };

  const handleViewResult = (quizId: string) => {
    router.push(`/result/${topicSlug}/${quizId}`);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const handleTopicSelect = (id: string) => {
    if (id === "leaderboard") {
      router.push("/leaderboard");
    } else {
      router.push(`/topic/${id}`);
    }
  };

  return (
    <>
      <Layout
        activeId={topicSlug}
        selectedQuiz={null}
        onTopicSelect={handleTopicSelect}
      >
        {isLoading || quizzes.length === 0 ? (
          <div className='flex flex-col text-center items-center justify-center py-16'>
            <div className='relative mb-8'>
              <div className='w-16 h-16 border-4 border-blue-200 rounded-full animate-spin'></div>
              <div className='absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin'></div>
            </div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              Loading Quizzes
            </h3>
            <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 max-w-lg'>
              <div className='flex items-center mb-3 text-center justify-center'>
                <span className='text-2xl'>💡</span>
                <span className='font-semibold text-gray-900'>
                  Did you know?
                </span>
              </div>
              <p className='text-gray-700 leading-relaxed'>{loadingTip}</p>
            </div>
          </div>
        ) : (
          <div>
            <div className='mb-12'>
              <div className='relative overflow-visible lg:overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 sm:p-8 border border-blue-100'>
                <div className='absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5'></div>
                <div className='relative'>
                  <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-3'>
                        <div className='w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full'></div>
                        <span className='text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full'>
                          Topic
                        </span>
                      </div>
                      <h1 className='text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4 leading-snug break-words'>
                        {topic?.title}
                      </h1>
                      <p className='text-base sm:text-lg text-gray-600 leading-relaxed max-w-3xl'>
                        {topic?.description}
                      </p>
                    </div>
                    <div className='flex-shrink-0'>
                      <button
                        onClick={() => setShowQuotesModal(true)}
                        className={buttonStyles.primary}
                      >
                        <div className='flex items-center gap-2 relative z-10'>
                          <span className='text-lg'>💡</span>
                          <span className='font-semibold'>Investment Tips</span>
                        </div>
                        <div className='absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <section className='space-y-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900'>
                    Available Quizzes
                  </h2>
                  <p className='text-gray-600 mt-1'>
                    {quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""}{" "}
                    available
                  </p>
                </div>
              </div>
              <div className='grid gap-6'>
                {quizzes.length > 0 ? (
                  quizzes.map((quiz) => {
                    const attemptStatus = attemptStatuses[quiz.id];

                    // Determine button state based on attempt status
                    let buttonState:
                      | "start"
                      | "resume"
                      | "view-result"
                      | "retake"
                      | "loading" = "start";
                    let onButtonClick: (
                      quizId: string
                    ) => void | Promise<void> = handleStartQuiz;

                    // Determine button state based on attempt status
                    if (session?.user && attemptStatus) {
                      if (attemptStatus.status === "in-progress") {
                        buttonState = "resume";
                        onButtonClick = (quizId: string) =>
                          router.push(`/quiz/${topicSlug}/${quizId}`); // Direct navigation for resume
                      } else if (attemptStatus.status === "completed") {
                        if (
                          attemptStatus.canRetake &&
                          attemptStatus.attemptsRemaining &&
                          attemptStatus.attemptsRemaining > 0
                        ) {
                          buttonState = "retake";
                          onButtonClick = handleStartQuiz; // Will create new attempt
                        } else {
                          buttonState = "view-result";
                          onButtonClick = handleViewResult;
                        }
                      }
                    } else if (!session?.user) {
                      // Non-authenticated users can only start quizzes
                      buttonState = "start";
                      onButtonClick = handleStartQuiz;
                    }

                    return (
                      <QuizCard
                        key={quiz.id}
                        quiz={quiz}
                        selectedQuiz={loadingQuizId ? quiz.id : null}
                        onStartQuiz={async (quizId) => {
                          if (!loadingQuizId) await onButtonClick(quizId);
                        }}
                        onViewAuthor={setSelectedAuthor}
                        onViewResult={
                          attemptStatus?.status === "completed"
                            ? handleViewResult
                            : undefined
                        }
                        buttonState={
                          loadingQuizId === quiz.id ? "loading" : buttonState
                        }
                        attemptInfo={attemptStatus}
                      />
                    );
                  })
                ) : (
                  <div className='text-center py-16'>
                    <div className='relative mx-auto w-24 h-24 mb-6'>
                      <div className='absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl transform rotate-6'></div>
                      <div className='relative w-full h-full bg-gradient-to-br from-blue-200 to-indigo-200 rounded-2xl flex items-center justify-center'>
                        <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center'>
                          <span className='text-white text-xl'>📚</span>
                        </div>
                      </div>
                    </div>
                    <h3 className='text-2xl font-bold text-gray-900 mb-3'>
                      No Quizzes Available Yet
                    </h3>
                    <p className='text-gray-600 mb-6 max-w-md mx-auto leading-relaxed'>
                      We&apos;re working hard to bring you comprehensive quiz
                      content. New quizzes will be added regularly to enhance
                      your learning experience.
                    </p>
                    <div className='flex items-center justify-center gap-2 text-sm text-gray-500'>
                      <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'></div>
                      <span>Content coming soon</span>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </Layout>

      {/* Author Profile Modal */}
      <AuthorModal
        author={selectedAuthor}
        onClose={() => setSelectedAuthor(null)}
      />

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Quotes and Tips Modal */}
      <QuotesModal
        isOpen={showQuotesModal}
        onClose={() => setShowQuotesModal(false)}
      />
    </>
  );
}
