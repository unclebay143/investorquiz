"use client";

import AuthorModal from "@/components/AuthorModal";
import Header from "@/components/Header";
import QuestionInterface from "@/components/QuestionInterface";
import ResultsScreen from "@/components/ResultsScreen";
import Sidebar from "@/components/Sidebar";
import { MOCK_TOPICS } from "@/data/mockData";
import { Author, Question } from "@/types";
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
  const [showSummary, setShowSummary] = useState(false);
  const [score, setScore] = useState(0);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [examStartTime, setExamStartTime] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<{
    [questionId: number]: {
      shuffledOptions: { [key: string]: string };
      keyMapping: { [key: string]: string };
      correctShuffledKey: string;
    };
  }>({});

  const topic = MOCK_TOPICS.find((t) => t.id === topicId);
  const exam = topic?.exams.find((e) => e.id === examId);

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
      setShowSummary(data.showSummary || false);
      setScore(data.score || 0);
      setTimeSpent(data.timeSpent || 0);
      setExamStartTime(data.examStartTime || null);
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
        showSummary,
        score,
        timeSpent,
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
    showSummary,
    score,
    timeSpent,
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
    if (examStartTime && exam && !showSummary) {
      interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - examStartTime) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [examStartTime, exam, showSummary]);

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
    if (!selectedAnswer || !exam) return;
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
        setShowSummary(true);
      }
    }
  };

  const handleNext = () => {
    if (!exam) return;
    if (exam.reviewMode === "immediate") {
      if (currentQuestion < exam.questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setShowSummary(true);
      }
    }
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
      timeSpent,
      postExamAnswers,
    };
    localStorage.setItem(resultKey, JSON.stringify(resultData));

    // Clear session data
    const sessionKey = `exam-${topicId}-${examId}`;
    localStorage.removeItem(sessionKey);

    router.push(`/topic/${topicId}`);
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

  const filtered = MOCK_TOPICS.filter((t) =>
    `${t.title} ${t.description}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  );

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header isOpen={open} onToggleMenu={() => setOpen((v) => !v)} />

      <div className='flex h-[calc(100vh-73px)]'>
        {/* Sidebar */}
        <Sidebar
          topics={filtered}
          activeId={topicId}
          query={query}
          selectedExam={examId}
          isOpen={open}
          onTopicSelect={(id) => router.push(`/topic/${id}`)}
          onQueryChange={setQuery}
          onClose={() => setOpen(false)}
        />

        {/* Main Content */}
        <main className='flex-1 overflow-y-auto bg-gray-50'>
          <div className='p-4 sm:p-6 lg:p-8'>
            {showSummary ? (
              <ResultsScreen
                exam={exam}
                score={score}
                timeSpent={timeSpent}
                postExamAnswers={postExamAnswers}
                onBackToExams={handleBackToExams}
                onViewAuthor={setSelectedAuthor}
              />
            ) : (
              <QuestionInterface
                exam={exam}
                currentQuestion={currentQuestion}
                selectedAnswer={selectedAnswer}
                showResult={showResult}
                score={score}
                timeSpent={timeSpent}
                shuffledQuestions={shuffledQuestions}
                onAnswerSelect={handleAnswerSelect}
                onSubmit={handleSubmit}
                onNext={handleNext}
              />
            )}
          </div>
        </main>
      </div>

      {/* Author Profile Modal */}
      <AuthorModal
        author={selectedAuthor}
        onClose={() => setSelectedAuthor(null)}
      />
    </div>
  );
}
