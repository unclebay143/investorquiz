"use client";

import AuthorModal from "@/components/AuthorModal";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import ResultsScreen from "@/components/ResultsScreen";
import { shuffleQuestionOptions } from "@/lib/utils";
import { Author, Exam } from "@/types";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const topicSlug = params.topicId as string; // Keep as topicId for backward compatibility
  const examSlug = params.examId as string; // Keep as examId for backward compatibility

  const [exam, setExam] = useState<Exam | null>(null);
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
  const [loading, setLoading] = useState(true);

  // Fetch exam and attempt data from API
  useEffect(() => {
    const fetchResultData = async () => {
      try {
        setLoading(true);

        // Wait for session to load
        if (status === "loading") {
          return;
        }

        if (!session?.user) {
          console.log("No session, redirecting to topic");
          router.push(`/topic/${topicSlug}`);
          return;
        }

        // Fetch exam data
        const examRes = await fetch(`/api/exams/${examSlug}`);
        if (!examRes.ok) {
          router.push(`/topic/${topicSlug}`);
          return;
        }
        const examData = await examRes.json();

        const transformedExam: Exam = {
          id: examData.slug,
          title: examData.title,
          description: examData.description || "",
          totalPoints: examData.totalPoints,
          questions: (examData.questions || []).map((q: any) => ({
            id: q.id,
            prompt: q.prompt,
            options: q.options,
            correctKey: q.correctKey,
            explanation: q.explanation,
          })),
          reviewMode: examData.reviewMode,
          isNew: examData.isNew,
          author: examData.author
            ? {
                id: examData.author.slug || String(examData.author._id),
                name: examData.author.name,
                title: examData.author.title || "",
                bio: examData.author.bio || "",
                profileImage: examData.author.profileImage,
                socialLinks: examData.author.socialLinks,
                books: examData.author.books,
                quote: examData.author.quote,
              }
            : undefined,
          retakeSettings: examData.retakeSettings || {
            enabled: false,
            maxAttempts: 1,
            coolDownDays: 0,
          },
        };
        setExam(transformedExam);

        // Generate shuffled questions for display
        const shuffled: {
          [questionId: number]: {
            shuffledOptions: { [key: string]: string };
            keyMapping: { [key: string]: string };
            correctShuffledKey: string;
          };
        } = {};
        transformedExam.questions.forEach((question) => {
          shuffled[question.id] = shuffleQuestionOptions(question);
        });
        setShuffledQuestions(shuffled);

        // Fetch the latest completed attempt for this exam
        console.log("Fetching attempt status for:", { topicSlug, examSlug });
        const attemptRes = await fetch(
          `/api/attempts/status?topicSlug=${topicSlug}&examSlug=${examSlug}`
        );
        console.log("Attempt status response:", attemptRes.status);

        if (attemptRes.ok) {
          const attemptStatus = await attemptRes.json();
          console.log("Attempt status data:", attemptStatus);

          if (attemptStatus.status === "completed" && attemptStatus.attemptId) {
            // Fetch the full attempt data
            console.log(
              "Fetching full attempt data for ID:",
              attemptStatus.attemptId
            );
            const fullAttemptRes = await fetch(
              `/api/attempts/${attemptStatus.attemptId}`
            );
            console.log("Full attempt response:", fullAttemptRes.status);

            if (fullAttemptRes.ok) {
              const fullAttempt = await fullAttemptRes.json();
              console.log("Full attempt data:", fullAttempt);

              setAttemptData({
                score: fullAttempt.score,
                timeSpentInSeconds: Math.floor(
                  (new Date(fullAttempt.completedAt).getTime() -
                    new Date(fullAttempt.startedAt).getTime()) /
                    1000
                ),
                answers: fullAttempt.answers,
                completedAt: fullAttempt.completedAt,
                attemptNumber: fullAttempt.attemptNumber,
                grade: fullAttempt.grade,
                isBestScore: fullAttempt.isBestScore,
              });
            } else {
              console.error("Failed to fetch full attempt data");
              router.push(`/topic/${topicSlug}`);
              return;
            }
          } else {
            console.log(
              "No completed attempt found or no attemptId:",
              attemptStatus
            );
            router.push(`/topic/${topicSlug}`);
            return;
          }
        } else {
          console.error("Failed to fetch attempt status:", attemptRes.status);
          router.push(`/topic/${topicSlug}`);
          return;
        }
      } catch (error) {
        console.error("Failed to fetch result data:", error);
        router.push(`/topic/${topicSlug}`);
      } finally {
        setLoading(false);
      }
    };

    if (topicSlug && examSlug) {
      fetchResultData();
    }
  }, [topicSlug, examSlug, router]);

  const handleBackToExams = () => {
    router.push(`/topic/${topicSlug}`);
  };

  const handleRetakeExam = () => {
    router.push(`/exam/${topicSlug}/${examSlug}`);
  };

  const handleTopicSelect = (id: string) => {
    if (id === "leaderboard") {
      router.push("/leaderboard");
    } else {
      router.push(`/topic/${id}`);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <LoadingSpinner className='mb-4' />
          <p className='text-gray-600'>Loading results...</p>
        </div>
      </div>
    );
  }

  if (!exam || !attemptData) {
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
        hideSidebar={true}
        activeId={topicSlug}
        selectedExam={null}
        onTopicSelect={handleTopicSelect}
      >
        <ResultsScreen
          exam={exam}
          score={attemptData.score}
          timeSpentInSeconds={attemptData.timeSpentInSeconds}
          postExamAnswers={attemptData.answers}
          shuffledQuestions={shuffledQuestions}
          topicId={topicSlug}
          onBackToExams={handleBackToExams}
          onViewAuthor={setSelectedAuthor}
          onRetakeExam={handleRetakeExam}
          attempts={{
            [`${topicSlug}-${exam.id}`]: [
              {
                examId: exam.id,
                topicId: topicSlug,
                attemptNumber: attemptData.attemptNumber,
                score: attemptData.score,
                timeSpentInSeconds: attemptData.timeSpentInSeconds,
                completedAt: attemptData.completedAt,
                answers: attemptData.answers,
                grade: attemptData.grade,
                isBestScore: attemptData.isBestScore,
              },
            ],
          }}
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
