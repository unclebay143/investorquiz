"use client";

import AuthorModal from "@/components/AuthorModal";
import Layout from "@/components/Layout";
import QuestionInterface from "@/components/QuestionInterface";
import { MOCK_TOPICS } from "@/data/mockData";
import { saveExamAttempt } from "@/lib/retakeUtils";
import { Author, ExamAttempts, Question } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.topicId as string;
  const examId = params.examId as string;

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
  const [attempts, setAttempts] = useState<ExamAttempts>({});
  const [examCompleted, setExamCompleted] = useState(false);

  const topic = MOCK_TOPICS.find((t) => t.id === topicId);
  const exam = topic?.exams.find((e) => e.id === examId);

  // Load attempts from localStorage
  useEffect(() => {
    const savedAttempts = localStorage.getItem("exam-attempts");
    if (savedAttempts) {
      setAttempts(JSON.parse(savedAttempts));
    }
  }, []);

  // Load session data from localStorage
  useEffect(() => {
    const sessionKey = `exam-${topicId}-${examId}`;
    const sessionData = localStorage.getItem(sessionKey);

    if (sessionData) {
      const data = JSON.parse(sessionData);
      setCurrentQuestion(data.currentQuestion || 0);
      setSelectedAnswer(data.selectedAnswer || null);
      setShowResult(data.showResult || false);
      setPostExamAnswers(data.postExamAnswers || {});
      // showSummary no longer needed - we navigate to result page
      setScore(data.score || 0);
      setTimeSpent(data.timeSpentInSeconds || 0);
      setExamStartTime(data.examStartTime || Date.now());
      setShuffledQuestions(data.shuffledQuestions || {});
    } else if (exam) {
      // Start new exam
      setExamStartTime(Date.now());
      setTimeSpent(0);

      // Shuffle questions
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
    }
  }, [topicId, examId, exam]);

  // Save session data to localStorage
  useEffect(() => {
    if (exam) {
      const sessionKey = `exam-${topicId}-${examId}`;
      const sessionData = {
        currentQuestion,
        selectedAnswer,
        showResult,
        postExamAnswers,
        // showSummary removed
        score,
        timeSpentInSeconds,
        examStartTime,
        shuffledQuestions,
      };
      localStorage.setItem(sessionKey, JSON.stringify(sessionData));
    }
  }, [
    currentQuestion,
    selectedAnswer,
    showResult,
    postExamAnswers,
    // showSummary removed
    score,
    timeSpentInSeconds,
    examStartTime,
    shuffledQuestions,
    topicId,
    examId,
    exam,
  ]);

  // Shuffle options for a question
  const shuffleQuestionOptions = (question: Question) => {
    const options = question.options;
    const optionKeys = Object.keys(options);
    const shuffledKeys = [...optionKeys].sort(() => Math.random() - 0.5);

    const shuffledOptions: { [key: string]: string } = {};
    const keyMapping: { [key: string]: string } = {};

    const orderedLabels = ["A", "B", "C", "D"];
    shuffledKeys.forEach((originalKey, index) => {
      const newLabel = orderedLabels[index];
      shuffledOptions[newLabel] = options[originalKey as keyof typeof options];
      keyMapping[newLabel] = originalKey;
    });

    const correctShuffledKey =
      Object.keys(shuffledOptions).find(
        (key) =>
          shuffledOptions[key] ===
          options[question.correctKey as keyof typeof options]
      ) || question.correctKey;

    return {
      shuffledOptions,
      keyMapping,
      correctShuffledKey,
    };
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (examStartTime && exam) {
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
    const question = exam.questions[currentQuestion];
    const shuffled = shuffledQuestions[question.id];

    if (shuffled && shuffled.keyMapping) {
      // Use shuffled key mapping
      const originalKey = shuffled.keyMapping[key];
      setSelectedAnswer(originalKey);
    } else {
      // Use key directly (fallback case)
      setSelectedAnswer(key);
    }
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
      if (selectedAnswer === exam.questions[currentQuestion].correctKey) {
        setScore((prev) => prev + pointsPerQuestion);
      }
    } else {
      const qId = exam.questions[currentQuestion].id;
      setPostExamAnswers((prev) => ({ ...prev, [qId]: selectedAnswer }));
      if (currentQuestion < exam.questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
      } else {
        let total = 0;
        const finalAnswers = { ...postExamAnswers, [qId]: selectedAnswer };
        for (const q of exam.questions) {
          if (finalAnswers[q.id] === q.correctKey) total += pointsPerQuestion;
        }
        setScore(total);
        // Ensure the final answers are persisted in state before completing
        setPostExamAnswers(finalAnswers);
        console.log("handleSubmit - calling handleCompleteExam in setTimeout");
        // Navigate to result page instead of showing inline
        setTimeout(() => {
          handleCompleteExam(finalAnswers);
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

    // Mark exam as completed
    const completedExams = JSON.parse(
      localStorage.getItem("completedExams") || "[]"
    );
    const examKey = `${topicId}-${examId}`;
    if (!completedExams.includes(examKey)) {
      completedExams.push(examKey);
      localStorage.setItem("completedExams", JSON.stringify(completedExams));
    }

    // Save attempt to history - get fresh attempts from localStorage
    const currentAttempts = JSON.parse(
      localStorage.getItem("exam-attempts") || "{}"
    );
    const existingAttempts = currentAttempts[examKey] || [];

    // Check if we already have an attempt with the same score and time (within 2 minutes)
    const now = new Date();
    const alreadyExists = existingAttempts.some((attempt: any) => {
      const attemptTime = new Date(attempt.completedAt);
      const timeDiff = Math.abs(now.getTime() - attemptTime.getTime());
      return (
        attempt.score === score &&
        attempt.timeSpentInSeconds === timeSpentInSeconds &&
        timeDiff < 120000
      ); // 2 minutes
    });

    if (!alreadyExists) {
      console.log(
        "Saving new attempt - score:",
        score,
        "timeSpentInSeconds:",
        timeSpentInSeconds
      );
      const updatedAttempts = saveExamAttempt(
        exam,
        topicId,
        score,
        timeSpentInSeconds,
        answersOverride || postExamAnswers,
        currentAttempts
      );
      setAttempts(updatedAttempts);
      localStorage.setItem("exam-attempts", JSON.stringify(updatedAttempts));
    } else {
      console.log("Attempt already exists - skipping save");
    }

    // Save result data
    const resultKey = `result-${topicId}-${examId}`;
    const resultData = {
      score,
      timeSpentInSeconds,
      postExamAnswers: answersOverride || postExamAnswers,
      shuffledQuestions,
    };
    localStorage.setItem(resultKey, JSON.stringify(resultData));

    // Clear session data
    const sessionKey = `exam-${topicId}-${examId}`;
    localStorage.removeItem(sessionKey);

    // Navigate to result page
    router.push(`/result/${topicId}/${examId}`);
  };

  const handleBackToExams = () => {
    // Mark exam as completed
    const completedExams = JSON.parse(
      localStorage.getItem("completedExams") || "[]"
    );
    const examKey = `${topicId}-${examId}`;
    if (!completedExams.includes(examKey)) {
      completedExams.push(examKey);
      localStorage.setItem("completedExams", JSON.stringify(completedExams));
    }

    // Save result data
    const resultKey = `result-${topicId}-${examId}`;
    const resultData = {
      score,
      timeSpentInSeconds,
      postExamAnswers,
      shuffledQuestions,
    };
    localStorage.setItem(resultKey, JSON.stringify(resultData));

    // Clear session data
    const sessionKey = `exam-${topicId}-${examId}`;
    localStorage.removeItem(sessionKey);

    router.push(`/topic/${topicId}`);
  };

  const handleTopicSelect = (id: string) => {
    if (id === "leaderboard") {
      router.push("/leaderboard");
    } else {
      router.push(`/topic/${id}`);
    }
  };

  if (!topic || !exam) {
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
        activeId={topicId}
        selectedExam={examId}
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
