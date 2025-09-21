"use client";

import AuthorModal from "@/components/AuthorModal";
import ExamLoadingScreen from "@/components/ExamLoadingScreen";
import Layout from "@/components/Layout";
import QuestionInterface from "@/components/QuestionInterface";
import {
  useAttemptStatus,
  useStartAttempt,
  useSubmitAttempt,
} from "@/hooks/useAttempts";
import { useExams } from "@/hooks/useExams";
import { shuffleQuestionOptions } from "@/lib/utils";
import { Author } from "@/types";
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

  const [examInitialized, setExamInitialized] = useState(false);
  const examInitializedRef = useRef(false);

  // Use TanStack Query for data
  const { data: examsData, isLoading: loading } = useExams(topicSlug);
  const { data: attemptStatus } = useAttemptStatus(examSlug);
  const startAttemptMutation = useStartAttempt();
  const submitAttemptMutation = useSubmitAttempt();

  // Find current exam from exams data
  const exam = examsData?.exams?.find((e: any) => e.slug === examSlug) || null;

  // Initialize exam when data is loaded
  useEffect(() => {
    if (!exam || examInitializedRef.current) return;

    examInitializedRef.current = true;

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

    // Initialize exam state
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setPostExamAnswers({});
    setScore(0);
    setTimeSpent(0);
    setExamStartTime(Date.now());
    setExamCompleted(false);
    setExamInitialized(true);
  }, [exam]);

  // Handle attempt status
  useEffect(() => {
    if (!attemptStatus || !session?.user) return;

    if (attemptStatus.status === "in-progress") {
      // Resume existing attempt
      resumeAttempt(attemptStatus._id);
    } else {
      // Start new attempt
      startAttemptMutation.mutate(examSlug, {
        onSuccess: (data) => {
          setAttemptId(data.attemptId);
          setAttemptNumber(data.attemptNumber);
        },
        onError: (error) => {
          console.error("Failed to start attempt:", error);
          router.push(`/topic/${topicSlug}`);
        },
      });
    }
  }, [
    attemptStatus,
    session,
    examSlug,
    startAttemptMutation,
    router,
    topicSlug,
  ]);

  // Handle authentication
  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      console.log("No session, redirecting to home");
      router.push("/");
      return;
    }
  }, [session, status, router]);

  const resumeAttempt = async (attemptId: string) => {
    try {
      const response = await fetch(`/api/attempts/${attemptId}`);
      if (response.ok) {
        const attemptData = await response.json();
        setAttemptId(attemptData._id);
        setAttemptNumber(attemptData.attemptNumber);
        setPostExamAnswers(attemptData.answers || {});
        setTimeSpent(attemptData.timeSpentInSeconds || 0);

        // Find the last answered question
        const answeredQuestions = Object.keys(attemptData.answers || {});
        if (answeredQuestions.length > 0) {
          const lastQuestionId = Math.max(...answeredQuestions.map(Number));
          const questionIndex =
            exam?.questions.findIndex((q) => q.id === lastQuestionId) || 0;
          setCurrentQuestion(questionIndex + 1);
        }

        setExamStartTime(
          Date.now() - (attemptData.timeSpentInSeconds || 0) * 1000
        );
        setExamInitialized(true);
      } else {
        console.error("Failed to resume attempt");
        router.push(`/topic/${topicSlug}`);
      }
    } catch (error) {
      console.error("Error resuming attempt:", error);
      router.push(`/topic/${topicSlug}`);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    if (selectedAnswer && exam) {
      const currentQ = exam.questions[currentQuestion];
      const shuffledQ = shuffledQuestions[currentQ.id];
      const originalAnswer = shuffledQ.keyMapping[selectedAnswer];

      setPostExamAnswers((prev) => ({
        ...prev,
        [currentQ.id]: originalAnswer,
      }));

      if (originalAnswer === currentQ.correctKey) {
        setScore((prev) => prev + 1);
      }

      if (currentQuestion < exam.questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        // Exam completed
        setExamCompleted(true);
        setShowResult(true);
        handleSubmitExam();
      }
    }
  };

  const handleSubmitExam = async () => {
    if (!attemptId || !exam) return;

    const timeSpent = Math.floor(
      (Date.now() - (examStartTime || Date.now())) / 1000
    );
    setTimeSpent(timeSpent);

    try {
      await submitAttemptMutation.mutateAsync({
        attemptId,
        answers: postExamAnswers,
        timeSpentInSeconds: timeSpent,
      });

      // Navigate to results
      router.push(`/result/${topicSlug}/${examSlug}`);
    } catch (error) {
      console.error("Failed to submit exam:", error);
    }
  };

  const handleAuthorClick = (author: Author) => {
    setSelectedAuthor(author);
  };

  if (loading || !examInitialized) {
    return (
      <Layout hideSidebar={true}>
        <ExamLoadingScreen />
      </Layout>
    );
  }

  if (!exam) {
    return (
      <Layout hideSidebar={true}>
        <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>
              Exam Not Found
            </h1>
            <p className='text-gray-600 mb-4'>
              The exam you're looking for doesn't exist.
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
    <Layout hideSidebar={true}>
      <div className='min-h-screen bg-gray-50'>
        <QuestionInterface
          exam={exam}
          currentQuestion={currentQuestion}
          selectedAnswer={selectedAnswer}
          showResult={showResult}
          postExamAnswers={postExamAnswers}
          score={score}
          timeSpentInSeconds={timeSpentInSeconds}
          shuffledQuestions={shuffledQuestions}
          examCompleted={examCompleted}
          attemptNumber={attemptNumber}
          onAnswerSelect={handleAnswerSelect}
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
