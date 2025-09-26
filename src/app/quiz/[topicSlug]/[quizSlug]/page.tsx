"use client";

import AuthorModal from "@/components/AuthorModal";
import Layout from "@/components/Layout";
import QuestionInterface from "@/components/QuestionInterface";
import QuizLoadingScreen from "@/components/QuizLoadingScreen";
import { useStartAttempt, useSubmitAttempt } from "@/hooks/useAttempts";
import { useQuiz } from "@/hooks/useQuiz";
import { shuffleQuestionOptions } from "@/lib/utils";
import { Author } from "@/types";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const topicSlug = params.topicSlug as string;
  const quizSlug = params.quizSlug as string;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [postQuizAnswers, setPostQuizAnswers] = useState<{
    [questionId: number]: string;
  }>({});
  const [score, setScore] = useState(0);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [timeSpentInSeconds, setTimeSpent] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const timeSpentRef = useRef(0);
  const [shuffledQuestions, setShuffledQuestions] = useState<{
    [questionId: number]: {
      shuffledOptions: { [key: string]: string };
      keyMapping: { [key: string]: string };
      correctShuffledKey: string;
    };
  }>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [quizInitialized, setQuizInitialized] = useState(false);
  const quizInitializedRef = useRef(false);
  const startRequestedRef = useRef(false);

  // Use TanStack Query for data
  const { data: quizData, isLoading: loading } = useQuiz(quizSlug, {
    includeAttempts: true,
  });
  const startAttemptMutation = useStartAttempt();
  const submitAttemptMutation = useSubmitAttempt();

  // Map to Quiz type
  const quiz = quizData
    ? {
        ...quizData,
        id: quizData.slug, // Use slug as id for compatibility
        description: quizData.description || "", // Ensure description is not undefined
        author: quizData.author
          ? {
              ...quizData.author,
              id: quizData.author._id, // Map _id to id for compatibility
              title: quizData.author.title || "", // Ensure title is not undefined
              bio: quizData.author.bio || "", // Ensure bio is not undefined
            }
          : undefined,
      }
    : null;

  // Initialize quiz when data is loaded
  useEffect(() => {
    if (!quiz || quizInitializedRef.current) return;

    quizInitializedRef.current = true;
  

    // Generate shuffled questions
    const shuffled: {
      [questionId: number]: {
        shuffledOptions: { [key: string]: string };
        keyMapping: { [key: string]: string };
        correctShuffledKey: string;
      };
    } = {};
    quiz.questions.forEach((question) => {
      shuffled[question.id] = shuffleQuestionOptions(question);
    });
    setShuffledQuestions(shuffled);

    // Do NOT initialize timer here; set it explicitly when starting new attempt or resuming
    
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setPostQuizAnswers({});
    setScore(0);
    setQuizCompleted(false);
  }, [quiz]);

  // Handle attempt using embedded attempts from single-quiz API
  useEffect(() => {
    if (!session?.user || quizInitialized) return;
    // Wait until quizData is loaded so we can detect in-progress attempt
    if (!quizData) return;

    const inProgress = (quizData as any)?.attempts?.find(
      (a: any) => a.inProgress
    );

    if (inProgress) {
      // Hydrate from embedded in-progress attempt
      setAttemptId(inProgress.attemptId);
      setAttemptNumber(inProgress.attemptNumber);
      setPostQuizAnswers(inProgress.answers || {});
      const startedAtMs = inProgress.startedAt
        ? new Date(inProgress.startedAt).getTime()
        : Date.now();
      setQuizStartTime(startedAtMs);
      const elapsedSinceStart = Math.max(
        0,
        Math.floor((Date.now() - startedAtMs) / 1000)
      );
      setTimeSpent(elapsedSinceStart);
      if (
        typeof inProgress.currentQuestion === "number" &&
        inProgress.currentQuestion >= 0
      ) {
        setCurrentQuestion(inProgress.currentQuestion);
      }
      // Merge saved shuffled question for current question if present
      if (inProgress.shuffledQuestions) {
        setShuffledQuestions((prev) => ({
          ...prev,
          ...inProgress.shuffledQuestions,
        }));
      }
      setQuizInitialized(true);
      return;
    }

    // No in-progress attempt, start a new one (guard against loops)
    if (startRequestedRef.current) return;
    startRequestedRef.current = true;
    startAttemptMutation.mutate(
      { topicSlug, quizSlug },
      {
        onSuccess: (data) => {
          setAttemptId(data.id || data.attemptId);
          setAttemptNumber(data.attemptNumber);
          setTimeSpent(0);
          setQuizStartTime(Date.now());
          setQuizInitialized(true);
          // allow future starts only after navigation
        },
        onError: (error) => {
          console.error("Failed to start attempt:", error);
          alert(`Failed to start quiz: ${error.message}`);
          router.push(`/topic/${topicSlug}`);
          startRequestedRef.current = false;
        },
      }
    );
  }, [session, quizInitialized, quizData, startAttemptMutation, topicSlug, quizSlug, router]);

  // Handle authentication
  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      console.info("No session, redirecting to home");
      router.push("/");
      return;
    }
  }, [session, status, router]);

  // Timer effect - update time spent every second
  useEffect(() => {
    if (!quizStartTime || quizCompleted) return;

   

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - quizStartTime) / 1000);
      timeSpentRef.current = elapsed;
      setTimeSpent(elapsed);
   
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [quizStartTime, quizCompleted]);

  // Removed network resume fetch; we hydrate from embedded attempt above

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmit = async () => {
    if (selectedAnswer && quiz) {
      const currentQ = quiz.questions[currentQuestion];

      if (!currentQ) {
        console.error("No current question found");
        return;
      }

      const shuffledQ = shuffledQuestions[currentQ.id];

      if (!shuffledQ) {
        console.error("No shuffled question found for ID:", currentQ.id);
        return;
      }

      const originalAnswer = shuffledQ.keyMapping[selectedAnswer];

      setPostQuizAnswers((prev) => ({
        ...prev,
        [currentQ.id]: originalAnswer,
      }));

      if (originalAnswer === currentQ.correctKey) {
        setScore((prev) => prev + 1);
      }

      // Update answers state first
      const updatedAnswers = {
        ...postQuizAnswers,
        [currentQ.id]: originalAnswer,
      };

      // For immediate review mode, show result. For post mode, go to next question
      if (quiz.reviewMode === "immediate") {
        setShowResult(true);
        // Save progress for immediate review mode too
        saveProgress(updatedAnswers, currentQuestion);
      } else {
        // Post review mode - go directly to next question
        if (currentQuestion < quiz.questions.length - 1) {
          const nextQuestion = currentQuestion + 1;
          setCurrentQuestion(nextQuestion);
          setSelectedAnswer(null);
          setShowResult(false);
          // Save progress after moving to next question
          saveProgress(updatedAnswers, nextQuestion);
        } else {
          // Quiz completed - save the final answer first, then submit
          try {
            await saveProgress(updatedAnswers, currentQuestion);
            setQuizCompleted(true);
            // Use updatedAnswers instead of postQuizAnswers to ensure we have the latest answer
            handleSubmitQuizWithAnswers(updatedAnswers);
          } catch (error) {
            console.error("Failed to save final progress:", error);
            // Still try to submit even if progress save fails
            setQuizCompleted(true);
            handleSubmitQuizWithAnswers(updatedAnswers);
          }
        }
      }
    }
  };

  const handleNext = async () => {
    if (!quiz) return;

    if (currentQuestion < quiz.questions.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      setSelectedAnswer(null);
      setShowResult(false);
      // Save progress when moving to next question
      saveProgress(postQuizAnswers, nextQuestion);
    } else {
      // Quiz completed - save the final answer first, then submit
      try {
        await saveProgress(postQuizAnswers, currentQuestion);
        setQuizCompleted(true);
        handleSubmitQuizWithAnswers(postQuizAnswers);
      } catch (error) {
        console.error("Failed to save final progress:", error);
        // Still try to submit even if progress save fails
        setQuizCompleted(true);
        handleSubmitQuizWithAnswers(postQuizAnswers);
      }
    }
  };

  const saveProgress = async (
    answers: { [questionId: number]: string },
    currentQ: number,
    retryCount = 0
  ) => {
    // Try to get attemptId from multiple sources
    let currentAttemptId = attemptId;

    if (!currentAttemptId) {
      // Try to get from mutation data first
      if (
        startAttemptMutation.data?.id ||
        startAttemptMutation.data?.attemptId
      ) {
        currentAttemptId =
          startAttemptMutation.data.id || startAttemptMutation.data.attemptId;
        setAttemptId(currentAttemptId);
      }
      // Try to get from attemptStatus as fallback
      // no-op: attemptStatus removed, rely on local/mutation only
    }

    if (!currentAttemptId) {
      // Only retry if the mutation is still pending (not failed)
      if (retryCount < 3 && startAttemptMutation.isPending) {
        setTimeout(() => {
          saveProgress(answers, currentQ, retryCount + 1);
        }, 1000); // Wait 1 second before retry
      }
      return;
    }

    try {
      const timeSpent = Math.floor(
        (Date.now() - (quizStartTime || Date.now())) / 1000
      );
  

      // Get the current question's shuffle data to save
      const currentQuestion = quiz?.questions[currentQ];
      const currentShuffle = currentQuestion
        ? shuffledQuestions[currentQuestion.id]
        : null;

      // Create shuffled questions object with only the current question's shuffle
      const shuffledQuestionsToSave = currentQuestion && currentShuffle
        ? {
            [currentQuestion.id]: currentShuffle,
          }
        : {};

      await fetch(`/api/attempts/${currentAttemptId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers,
          currentQuestion: currentQ,
          timeSpentInSeconds: timeSpent,
          inProgress: true,
          shuffledQuestions: shuffledQuestionsToSave,
        }),
      });
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  };

  const handleSubmitQuizWithAnswers = async (answers: {
    [questionId: number]: string;
  }) => {
    if (!attemptId || !quiz) {
      console.error("Missing attemptId or quiz", { attemptId, quiz: !!quiz });
      return;
    }

    setIsSubmitting(true);
    const timeSpent = Math.floor(
      (Date.now() - (quizStartTime || Date.now())) / 1000
    );
    setTimeSpent(timeSpent);
 

    try {
      await submitAttemptMutation.mutateAsync({
        attemptId,
        answers: answers,
        timeSpentInSeconds: timeSpent,
      });

      // Navigate to results
      router.push(`/result/${topicSlug}/${quizSlug}`);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      // Show user-friendly error message
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit quiz";
      alert(`Submission failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthorClick = (author: Author) => {
    setSelectedAuthor(author);
  };

  const handleSidebarTopicSelect = (id: string) => {
    router.push(`/topic/${id}`);
  };

  if (loading || !quizInitialized || startAttemptMutation.isPending) {
    return (
      <Layout activeId={topicSlug} onTopicSelect={() => {}} defaultCollapsed={true}>
        <QuizLoadingScreen />
      </Layout>
    );
  }

  if (!quiz) {
    return (
      <Layout activeId={topicSlug} onTopicSelect={() => {}} defaultCollapsed={true}>
        <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                Quiz Not Found
            </h1>
            <p className='text-gray-600 mb-4'>
              The quiz you&apos;re looking for doesn&apos;t exist.
            </p>
            <button
              onClick={() => router.push(`/topic/${topicSlug}`)}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      activeId={topicSlug}
      onTopicSelect={handleSidebarTopicSelect}
      defaultCollapsed={true}
    >
      <div className='min-h-screen bg-gray-50'>
        <QuestionInterface
          quiz={quiz}
          currentQuestion={currentQuestion}
          selectedAnswer={selectedAnswer}
          showResult={showResult}
          postQuizAnswers={postQuizAnswers}
          score={score}
          timeSpentInSeconds={timeSpentInSeconds}
          shuffledQuestions={shuffledQuestions}
          quizCompleted={quizCompleted}
          attemptNumber={attemptNumber}
          isSubmitting={isSubmitting}
          onAnswerSelect={handleAnswerSelect}
          onSubmit={handleSubmit}
          onNext={handleNext}
          onAuthorClick={handleAuthorClick}
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
