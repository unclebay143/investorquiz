"use client";

import AuthorModal from "@/components/AuthorModal";
import ExamLoadingScreen from "@/components/ExamLoadingScreen";
import Layout from "@/components/Layout";
import QuestionInterface from "@/components/QuestionInterface";
import { shuffleQuestionOptions } from "@/lib/utils";
import { Author, Exam } from "@/types";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const topicSlug = params.topicSlug as string;
  const examSlug = params.examSlug as string;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [postExamAnswers, setPostExamAnswers] = useState<{
    [questionId: number]: string;
  }>({});
  const [score, setScore] = useState(0);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [timeSpentInSeconds, setTimeSpent] = useState(0);
  const [examStartTime, setExamStartTime] = useState<number | null>(null);
  const [shuffledQuestions, setShuffledQuestions] = useState<{
    [questionId: number]: {
      shuffledOptions: { [key: string]: string };
      keyMapping: { [key: string]: string };
      correctShuffledKey: string;
    };
  }>({});
  const [examCompleted, setExamCompleted] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [attemptNumber, setAttemptNumber] = useState(1);

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [examInitialized, setExamInitialized] = useState(false);
  const examInitializedRef = useRef(false);

  // Fetch exam and check attempt status
  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        setExamInitialized(false);
        const res = await fetch(`/api/exams/${examSlug}`);
        if (res.ok) {
          const data = await res.json();
          const transformed: Exam = {
            id: data.slug,
            title: data.title,
            description: data.description || "",
            totalPoints: data.totalPoints,
            questions: (data.questions || []).map((q: any) => ({
              id: q.id,
              prompt: q.prompt,
              options: q.options,
              correctKey: q.correctKey,
              explanation: q.explanation,
            })),
            reviewMode: data.reviewMode,
            isNew: data.isNew,
            author: data.author
              ? {
                  id: data.author.slug || String(data.author._id),
                  name: data.author.name,
                  title: data.author.title || "",
                  bio: data.author.bio || "",
                  profileImage: data.author.profileImage,
                  socialLinks: data.author.socialLinks,
                  books: data.author.books,
                  quote: data.author.quote,
                }
              : undefined,
            retakeSettings: data.retakeSettings || {
              enabled: false,
              maxAttempts: 1,
              coolDownDays: 0,
            },
          };

          // Generate shuffled questions BEFORE setting exam data to prevent flash
          const shuffled: {
            [questionId: number]: {
              shuffledOptions: { [key: string]: string };
              keyMapping: { [key: string]: string };
              correctShuffledKey: string;
            };
          } = {};
          transformed.questions.forEach((question) => {
            shuffled[question.id] = shuffleQuestionOptions(question);
          });

          // Check attempt status for authenticated users
          let isResuming = false;
          if (status === "loading") {
            // Wait for session to load
            return;
          } else if (status === "authenticated" && session?.user) {
            try {
              console.log("Checking attempt status for:", {
                topicSlug,
                examSlug,
              });
              const statusRes = await fetch(
                `/api/attempts/status?topicSlug=${topicSlug}&examSlug=${examSlug}`
              );
              console.log("Attempt status response:", statusRes.status);

              if (statusRes.ok) {
                const attemptStatus = await statusRes.json();
                console.log("Attempt status data:", attemptStatus);

                if (attemptStatus.status === "in-progress") {
                  // Resume existing attempt
                  isResuming = true;
                  await resumeAttempt(attemptStatus.attemptId);
                } else {
                  // No in-progress attempt, start a new one
                  console.log("No in-progress attempt, starting new attempt");
                  try {
                    const startRes = await fetch("/api/attempts/start", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        topicSlug,
                        examSlug,
                      }),
                    });

                    if (startRes.ok) {
                      const startData = await startRes.json();
                      setAttemptId(startData.attemptId);
                      setAttemptNumber(startData.attemptNumber);
                      console.log("Started new attempt:", startData);
                    } else {
                      console.error("Failed to start attempt");
                      router.push(`/topic/${topicSlug}`);
                      return;
                    }
                  } catch (error) {
                    console.error("Failed to start attempt:", error);
                    router.push(`/topic/${topicSlug}`);
                    return;
                  }
                }
              } else {
                // No attempt status, redirect back to topic page
                console.log(
                  "Failed to get attempt status, redirecting to topic page"
                );
                router.push(`/topic/${topicSlug}`);
                return;
              }
            } catch (error) {
              console.error("Failed to check attempt status:", error);
              router.push(`/topic/${topicSlug}`);
              return;
            }
          } else {
            // Non-authenticated users, redirect back to topic page
            router.push(`/topic/${topicSlug}`);
            return;
          }

          // Initialize exam state for new attempts only
          if (!isResuming) {
            setExamStartTime(Date.now());
            setTimeSpent(0);
          }
          // Set both exam and shuffled questions together to prevent flash
          setExam(transformed);
          setShuffledQuestions(shuffled);

          // Mark exam as initialized
          setExamInitialized(true);
          examInitializedRef.current = true;
        }
      } finally {
        setLoading(false);
      }
    };

    // Only fetch exam if we haven't already loaded it and session is ready
    if (status !== "loading" && !examInitializedRef.current) {
      fetchExam();
    }

    // Cleanup function to reset ref when exam changes
    return () => {
      examInitializedRef.current = false;
    };
  }, [topicSlug, examSlug, status]); // Removed session from dependencies to prevent tab switch reloads

  // Resume existing attempt
  const resumeAttempt = async (attemptId: string) => {
    try {
      const res = await fetch(`/api/attempts/${attemptId}`);
      if (res.ok) {
        const attemptData = await res.json();
        setAttemptId(attemptId);
        setAttemptNumber(attemptData.attemptNumber);
        setCurrentQuestion(attemptData.currentQuestion || 0);
        setPostExamAnswers(attemptData.answers || {});
        setScore(attemptData.score || 0);

        // Set examStartTime to the original start time from server
        if (attemptData.startedAt) {
          const startTime = new Date(attemptData.startedAt).getTime();
          setExamStartTime(startTime);
        }
      }
    } catch (error) {
      console.error("Failed to resume attempt:", error);
    }
  };

  // Update server attempt on progress (for authenticated users)
  useEffect(() => {
    if (session?.user && attemptId && exam) {
      updateAttempt({
        currentQuestion,
        answers: postExamAnswers,
      });
    }
  }, [currentQuestion, postExamAnswers, attemptId, exam]); // Removed session from dependencies

  // Update server attempt
  const updateAttempt = async (updates: any) => {
    if (!attemptId || !session?.user) return;
    try {
      await fetch(`/api/attempts/${attemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error("Failed to update attempt:", error);
    }
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (examStartTime && exam) {
      console.log(
        "Timer effect - examStartTime:",
        new Date(examStartTime),
        "current timeSpent:",
        timeSpentInSeconds
      );

      // Calculate elapsed time from examStartTime and set it
      const currentTime = Math.floor((Date.now() - examStartTime) / 1000);
      console.log("Timer effect - Setting time to:", currentTime);
      setTimeSpent(currentTime);

      // Start the interval
      interval = setInterval(() => {
        const currentTime = Math.floor((Date.now() - examStartTime) / 1000);
        setTimeSpent(currentTime);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [examStartTime, exam]);

  const handleAnswerSelect = (key: string) => {
    if (showResult || !exam) return;
    // Store the shuffled key directly - we'll map to original key when storing answers
    setSelectedAnswer(key);
  };

  const handleSubmit = () => {
    if (!selectedAnswer || !exam || examCompleted) return;
    console.log(
      "handleSubmit called - currentQuestion:",
      currentQuestion,
      "examCompleted:",
      examCompleted
    );
    const pointsPerQuestion = exam.totalPoints / exam.questions.length;

    if (exam.reviewMode === "immediate") {
      setShowResult(true);
      // Map shuffled key to original key for score calculation
      const qId = exam.questions[currentQuestion].id;
      const shuffled = shuffledQuestions[qId];
      const originalKey =
        shuffled?.keyMapping[selectedAnswer] || selectedAnswer;

      if (originalKey === exam.questions[currentQuestion].correctKey) {
        setScore((prev) => prev + pointsPerQuestion);
      }
    } else {
      const qId = exam.questions[currentQuestion].id;
      const shuffled = shuffledQuestions[qId];

      // Map the selected answer to the original key using keyMapping
      const originalKey =
        shuffled?.keyMapping[selectedAnswer] || selectedAnswer;
      const newAnswers = { ...postExamAnswers, [qId]: originalKey };
      setPostExamAnswers(newAnswers);

      // Calculate score for this question using the original key
      const currentQuestionData = exam.questions[currentQuestion];
      if (originalKey === currentQuestionData.correctKey) {
        setScore((prev) => prev + pointsPerQuestion);
      }

      // Update server attempt with progress
      updateAttempt({
        answers: newAnswers,
        currentQuestion: currentQuestion + 1,
        timeSpentInSeconds,
      });

      if (currentQuestion < exam.questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
      } else {
        let total = 0;
        for (const q of exam.questions) {
          // newAnswers[q.id] is already the original key since we store original keys
          if (newAnswers[q.id] === q.correctKey) total += pointsPerQuestion;
        }
        setScore(total);
        console.log("handleSubmit - calling handleCompleteExam in setTimeout");
        // Navigate to result page instead of showing inline
        setTimeout(() => {
          handleCompleteExam(newAnswers);
        }, 50);
      }
    }
  };

  const handleNext = () => {
    if (!exam || examCompleted) return;
    console.log(
      "handleNext called - currentQuestion:",
      currentQuestion,
      "examCompleted:",
      examCompleted
    );
    if (exam.reviewMode === "immediate") {
      if (currentQuestion < exam.questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        console.log("handleNext - calling handleCompleteExam");
        // Navigate to result page instead of showing inline
        handleCompleteExam(postExamAnswers);
      }
    }
  };

  const handleCompleteExam = (answersOverride?: {
    [questionId: number]: string;
  }) => {
    if (!exam || examCompleted) return;

    console.log("handleCompleteExam called - saving attempt");
    setExamCompleted(true);

    const finalAnswers = answersOverride || postExamAnswers;

    // Calculate final score based on answers
    let finalScore = 0;
    const pointsPerQuestion = exam.totalPoints / exam.questions.length;

    exam.questions.forEach((question) => {
      const userAnswer = finalAnswers[question.id];
      // userAnswer is already the original key since we store original keys
      if (userAnswer === question.correctKey) {
        finalScore += pointsPerQuestion;
      }
    });

    // Update the score state
    setScore(finalScore);

    const grade =
      finalScore >= exam.totalPoints * 0.8
        ? "A"
        : finalScore >= exam.totalPoints * 0.6
        ? "B"
        : finalScore >= exam.totalPoints * 0.4
        ? "C"
        : finalScore >= exam.totalPoints * 0.2
        ? "D"
        : "F";

    // Update server attempt with completion
    if (session?.user && attemptId) {
      updateAttempt({
        score: finalScore,
        grade,
        completedAt: new Date().toISOString(),
        inProgress: false,
        answers: finalAnswers,
      });
    }

    // Navigate to result page
    router.push(`/result/${topicSlug}/${examSlug}`);
  };

  const handleBackToExams = () => {
    router.push(`/topic/${topicSlug}`);
  };

  const handleTopicSelect = (id: string) => {
    if (id === "leaderboard") {
      router.push("/leaderboard");
    } else {
      router.push(`/topic/${id}`);
    }
  };

  if (loading || !examInitialized) {
    return <ExamLoadingScreen examTitle={exam?.title || "Loading exam"} />;
  }

  if (!exam) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            Exam Not Found
          </h1>
          <p className='text-gray-600 mb-4'>
            The exam you're looking for doesn't exist.
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
        selectedExam={examSlug}
        onTopicSelect={handleTopicSelect}
      >
        <QuestionInterface
          exam={exam}
          currentQuestion={currentQuestion}
          selectedAnswer={selectedAnswer}
          showResult={showResult}
          score={score}
          timeSpentInSeconds={timeSpentInSeconds}
          shuffledQuestions={shuffledQuestions}
          onAnswerSelect={handleAnswerSelect}
          onSubmit={handleSubmit}
          onNext={handleNext}
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
