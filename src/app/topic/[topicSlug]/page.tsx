"use client";

import AuthorModal from "@/components/AuthorModal";
import ExamCard from "@/components/ExamCard";
import Layout from "@/components/Layout";
import { investmentTips } from "@/components/LoadingScreen";
import QuotesModal from "@/components/QuotesModal";
import { buttonStyles } from "@/lib/utils";
import { Author, Exam, Topic } from "@/types";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TopicPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const topicSlug = params.topicSlug as string;

  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuotesModal, setShowQuotesModal] = useState(false);
  const [attemptStatuses, setAttemptStatuses] = useState<{
    [examSlug: string]: {
      status: "none" | "in-progress" | "completed";
      attemptId?: string;
      attemptNumber?: number;
      canRetake?: boolean;
      attemptsRemaining?: number;
      nextRetakeDate?: string;
    };
  }>({});

  // Fetch topic and exams from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Wait for session to load
        if (status === "loading") {
          return;
        }

        if (!session?.user) {
          console.log("No session, redirecting to home");
          router.push("/");
          return;
        }

        // Fetch topic info
        const topicsResponse = await fetch("/api/topics");
        if (topicsResponse.ok) {
          const topicsData = await topicsResponse.json();
          const topicData = topicsData.find((t: any) => t.slug === topicSlug);
          if (topicData) {
            setTopic({
              id: topicData.slug,
              title: topicData.title,
              description: topicData.description || "",
              exams: [],
            });
          } else {
            // Topic not found, set loading to false to show "Topic Not Found"
            setLoading(false);
            return;
          }
        } else if (topicsResponse.status === 401) {
          router.push("/");
          return;
        } else {
          // API error, set loading to false
          setLoading(false);
          return;
        }

        // Fetch exams for this topic (now includes attempt statuses)
        const examsResponse = await fetch(`/api/topics/${topicSlug}/exams`, {
          // Use default caching - let the server control cache headers
          // This allows for 30-second user-specific caching
        });
        if (examsResponse.ok) {
          const data = await examsResponse.json();
          const transformedExams: Exam[] = data.exams.map((exam: any) => ({
            id: exam.slug,
            title: exam.title,
            description: exam.description || "",
            totalPoints: exam.totalPoints,
            questions: exam.questions || [], // Use actual questions from API
            reviewMode: exam.reviewMode,
            isNew: exam.isNew,
            author: exam.author
              ? {
                  id: exam.author._id || exam.author.slug,
                  name: exam.author.name,
                  title: exam.author.title || "",
                  bio: exam.author.bio || "",
                  profileImage: exam.author.profileImage,
                  socialLinks: exam.author.socialLinks,
                  books: exam.author.books,
                  quote: exam.author.quote,
                }
              : undefined,
            retakeSettings: exam.retakeSettings,
          }));
          setExams(transformedExams);

          // Set attempt statuses from the API response
          setAttemptStatuses(data.attemptStatuses || {});

          // Successfully loaded everything, set loading to false
          setLoading(false);
        } else if (examsResponse.status === 401) {
          router.push("/");
          return;
        } else {
          // Exams API error, set loading to false
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Failed to fetch topic data:", error);
        setLoading(false);
      }
    };

    if (topicSlug) {
      fetchData();
    }
  }, [topicSlug, session, status, router]);

  if (!loading && !topic) {
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

  const handleStartExam = async (examId: string) => {
    if (!session?.user) {
      // For non-authenticated users, just navigate
      router.push(`/exam/${topicSlug}/${examId}`);
      return;
    }

    // For authenticated users, start a new attempt first
    try {
      const res = await fetch("/api/attempts/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicSlug,
          examSlug: examId,
        }),
      });

      if (res.ok) {
        // Successfully started attempt, navigate to exam
        router.push(`/exam/${topicSlug}/${examId}`);
      } else {
        const error = await res.json();
        console.error("Failed to start attempt:", error);
        // Still navigate to exam page - it will handle the error
        router.push(`/exam/${topicSlug}/${examId}`);
      }
    } catch (error) {
      console.error("Failed to start attempt:", error);
      // Still navigate to exam page - it will handle the error
      router.push(`/exam/${topicSlug}/${examId}`);
    }
  };

  const handleViewResult = (examId: string) => {
    router.push(`/result/${topicSlug}/${examId}`);
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
        selectedExam={null}
        onTopicSelect={handleTopicSelect}
      >
        {loading ? (
          <div className='flex flex-col text-center items-center justify-center py-16'>
            <div className='relative mb-8'>
              <div className='w-16 h-16 border-4 border-blue-200 rounded-full animate-spin'></div>
              <div className='absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin'></div>
            </div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              Loading Exams
            </h3>
            <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 max-w-lg'>
              <div className='flex items-center mb-3 text-center justify-center'>
                <span className='text-2xl'>💡</span>
                <span className='font-semibold text-gray-900'>
                  Did you know?
                </span>
              </div>
              <p className='text-gray-700 leading-relaxed'>
                {
                  investmentTips[
                    Math.floor(Math.random() * investmentTips.length)
                  ]
                }
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className='mb-12'>
              <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 border border-blue-100'>
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
                      <h1 className='text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4 leading-tight'>
                        {topic?.title}
                      </h1>
                      <p className='text-lg text-gray-600 leading-relaxed max-w-3xl'>
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
                    Available Exams
                  </h2>
                  <p className='text-gray-600 mt-1'>
                    {exams.length} exam{exams.length !== 1 ? "s" : ""} available
                  </p>
                </div>
              </div>
              <div className='grid gap-6'>
                {exams.length > 0 ? (
                  exams.map((exam) => {
                    const attemptStatus = attemptStatuses[exam.id];

                    // Determine button state based on attempt status
                    let buttonState:
                      | "start"
                      | "resume"
                      | "view-result"
                      | "retake"
                      | "loading" = "start";
                    let onButtonClick: (
                      examId: string
                    ) => void | Promise<void> = handleStartExam;

                    // Determine button state based on attempt status
                    if (session?.user && attemptStatus) {
                      if (attemptStatus.status === "in-progress") {
                        buttonState = "resume";
                        onButtonClick = (examId: string) =>
                          router.push(`/exam/${topicSlug}/${examId}`); // Direct navigation for resume
                      } else if (attemptStatus.status === "completed") {
                        if (
                          attemptStatus.canRetake &&
                          attemptStatus.attemptsRemaining &&
                          attemptStatus.attemptsRemaining > 0
                        ) {
                          buttonState = "retake";
                          onButtonClick = handleStartExam; // Will create new attempt
                        } else {
                          buttonState = "view-result";
                          onButtonClick = handleViewResult;
                        }
                      }
                    } else if (!session?.user) {
                      // Non-authenticated users can only start exams
                      buttonState = "start";
                      onButtonClick = handleStartExam;
                    }

                    return (
                      <ExamCard
                        key={exam.id}
                        exam={exam}
                        selectedExam={null}
                        onStartExam={onButtonClick}
                        onViewAuthor={setSelectedAuthor}
                        onViewResult={
                          buttonState === "view-result"
                            ? handleViewResult
                            : undefined
                        }
                        buttonState={buttonState}
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
                      No Exams Available Yet
                    </h3>
                    <p className='text-gray-600 mb-6 max-w-md mx-auto leading-relaxed'>
                      We're working hard to bring you comprehensive exam
                      content. New exams will be added regularly to enhance your
                      learning experience.
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

      {/* Quotes and Tips Modal */}
      <QuotesModal
        isOpen={showQuotesModal}
        onClose={() => setShowQuotesModal(false)}
      />
    </>
  );
}
