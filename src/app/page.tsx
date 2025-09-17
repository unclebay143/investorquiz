"use client";

import AuthorModal from "@/components/AuthorModal";
import ExamCard from "@/components/ExamCard";
import QuestionInterface from "@/components/QuestionInterface";
import ResultsScreen from "@/components/ResultsScreen";
import Sidebar from "@/components/Sidebar";
import { MOCK_TOPICS } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Author, Question } from "@/types";
import { Menu, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string>(MOCK_TOPICS[0].id);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_TOPICS;
    return MOCK_TOPICS.filter((t) =>
      `${t.title} ${t.description}`.toLowerCase().includes(q)
    );
  }, [query]);

  const active = useMemo(
    () => MOCK_TOPICS.find((t) => t.id === activeId) ?? MOCK_TOPICS[0],
    [activeId]
  );

  const currentExam = useMemo(() => {
    if (!selectedExam) return null;
    return active.exams.find((exam) => exam.id === selectedExam);
  }, [selectedExam, active]);

  // Shuffle questions when exam starts
  const [shuffledQuestions, setShuffledQuestions] = useState<{
    [questionId: number]: {
      shuffledOptions: { [key: string]: string };
      keyMapping: { [key: string]: string };
      correctShuffledKey: string;
    };
  }>({});

  // Shuffle options for a question
  const shuffleQuestionOptions = (question: Question) => {
    const options = question.options;
    const optionKeys = Object.keys(options);
    const shuffledKeys = [...optionKeys].sort(() => Math.random() - 0.5);

    const shuffledOptions: { [key: string]: string } = {};
    const keyMapping: { [key: string]: string } = {};

    // Keep labels A, B, C, D but shuffle the content
    const orderedLabels = ["A", "B", "C", "D"];
    shuffledKeys.forEach((originalKey, index) => {
      const newLabel = orderedLabels[index];
      shuffledOptions[newLabel] = options[originalKey as keyof typeof options];
      keyMapping[newLabel] = originalKey;
    });

    // Find which label (A, B, C, D) contains the correct answer
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

  useEffect(() => {
    if (currentExam) {
      const shuffled: {
        [questionId: number]: {
          shuffledOptions: { [key: string]: string };
          keyMapping: { [key: string]: string };
          correctShuffledKey: string;
        };
      } = {};
      currentExam.questions.forEach((question) => {
        shuffled[question.id] = shuffleQuestionOptions(question);
      });
      setShuffledQuestions(shuffled);
    }
  }, [currentExam]);

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

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (examStartTime && selectedExam && !showSummary) {
      interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - examStartTime) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [examStartTime, selectedExam, showSummary]);

  const handleAnswerSelect = (shuffledKey: string) => {
    if (showResult || !currentExam) return;
    const question = currentExam.questions[currentQuestion];
    const shuffled = shuffledQuestions[question.id];
    if (shuffled) {
      const originalKey = shuffled.keyMapping[shuffledKey];
      setSelectedAnswer(originalKey);
    }
  };

  const handleSubmit = () => {
    if (!selectedAnswer || !currentExam) return;
    const pointsPerQuestion =
      currentExam.totalPoints / currentExam.questions.length;

    if (currentExam.reviewMode === "immediate") {
      setShowResult(true);
      if (
        selectedAnswer === currentExam.questions[currentQuestion].correctKey
      ) {
        setScore((prev) => prev + pointsPerQuestion);
      }
    } else {
      // post-exam review: store answer, move to next immediately, scoring deferred until summary
      const qId = currentExam.questions[currentQuestion].id;
      setPostExamAnswers((prev) => ({ ...prev, [qId]: selectedAnswer }));
      if (currentQuestion < currentExam.questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
      } else {
        // compute score and show summary
        let total = 0;
        const finalAnswers = { ...postExamAnswers, [qId]: selectedAnswer };
        for (const q of currentExam.questions) {
          if (finalAnswers[q.id] === q.correctKey) total += pointsPerQuestion;
        }
        setScore(total);
        setShowSummary(true);
      }
    }
  };

  const handleNext = () => {
    if (!currentExam) return;
    if (currentExam.reviewMode === "immediate") {
      if (currentQuestion < currentExam.questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setShowSummary(true);
      }
    }
  };

  const handleStartExam = (examId: string) => {
    setSelectedExam(examId);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowSummary(false);
    setPostExamAnswers({});
    setScore(0);
    setTimeSpent(0);
    setExamStartTime(Date.now());
  };

  const handleBackToExams = () => {
    setSelectedExam(null);
    setShowSummary(false);
    setSelectedAnswer(null);
    setPostExamAnswers({});
    setCurrentQuestion(0);
    setScore(0);
    setTimeSpent(0);
    setExamStartTime(null);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm'>
        <div className='px-4 sm:px-4 py-4 flex items-center gap-4'>
          <button
            className={cn(
              "lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors",
              selectedExam &&
                "opacity-50 cursor-not-allowed hover:bg-transparent"
            )}
            aria-label='Toggle menu'
            onClick={() => !selectedExam && setOpen((v) => !v)}
            disabled={!!selectedExam}
          >
            {open ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
          </button>
          <div className='font-bold text-xl text-gray-900'>
            Investment Exams
          </div>
          <div className='ml-auto' />
        </div>
      </header>

      <div className='flex h-[calc(100vh-73px)]'>
        {/* Mobile overlay */}
        {open && (
          <div
            className='fixed inset-0 bg-black bg-opacity-10 z-20 lg:hidden'
            onClick={() => setOpen(false)}
          />
        )}

        {/* Sidebar */}
        <Sidebar
          topics={filtered}
          activeId={activeId}
          query={query}
          selectedExam={selectedExam}
          onTopicSelect={setActiveId}
          onQueryChange={setQuery}
          onClose={() => setOpen(false)}
        />

        {/* Main */}
        <main className='flex-1 overflow-y-auto bg-gray-50 lg:ml-0'>
          <div className='p-4 sm:p-6 lg:p-8'>
            {!selectedExam ? (
              <>
                <div className='mb-8'>
                  <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                    {active.title}
                  </h1>
                  <p className='text-gray-600 text-lg'>{active.description}</p>
                </div>

                <section className='grid gap-3'>
                  {active.exams.length > 0 ? (
                    active.exams.map((exam) => (
                      <ExamCard
                        key={exam.id}
                        exam={exam}
                        selectedExam={selectedExam}
                        onStartExam={handleStartExam}
                        onViewAuthor={setSelectedAuthor}
                      />
                    ))
                  ) : (
                    <div className='text-center py-12'>
                      <div className='w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center'>
                        <div className='w-8 h-8 bg-gray-300 rounded-lg'></div>
                      </div>
                      <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                        No exams available
                      </h3>
                      <p className='text-gray-500'>
                        Content will be added soon.
                      </p>
                    </div>
                  )}
                </section>
              </>
            ) : currentExam ? (
              showSummary ? (
                <ResultsScreen
                  exam={currentExam}
                  score={score}
                  timeSpent={timeSpent}
                  postExamAnswers={postExamAnswers}
                  onBackToExams={handleBackToExams}
                  onViewAuthor={setSelectedAuthor}
                />
              ) : (
                <QuestionInterface
                  exam={currentExam}
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
              )
            ) : null}
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
