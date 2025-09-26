import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectViaMongoose } from "@/lib/db";
import Attempt from "@/models/Attempt";
import Author from "@/models/Author";
import Quiz from "@/models/Quiz";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectViaMongoose();
    const { searchParams } = new URL(req.url);
    const includeAnswers = searchParams.get("includeAnswers") === "true";
    const includeAttempts = searchParams.get("includeAttempts") === "true";
    const { quizId } = await params;
    const quiz = (await Quiz.findOne({ slug: quizId })
      .populate({
        path: "author",
        select: "name title bio profileImage slug socialLinks books quote", // All author fields
        model: Author,
      })
      .lean()) as any;

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Conditionally strip answers for take-quiz
    const sanitizedQuiz = includeAnswers
      ? quiz
      : ({
          ...quiz,
          questions: Array.isArray(quiz.questions)
            ? quiz.questions.map((q: any) => {
                const { correctKey, explanation, ...rest } = q || {};
                return rest;
              })
            : [],
        } as any);

    // Attach attempts only when requested
    if (includeAttempts && session?.userId && quiz?._id) {
      // In-progress attempt (include partial state)
      const inProgress = await Attempt.findOne({
        $or: [{ user: session.userId }, { user: String(session.userId) }],
        quiz: quiz._id,
        inProgress: true,
      })
        .select(
          "_id attemptNumber startedAt timeSpentInSeconds answers shuffledQuestions currentQuestion"
        )
        .lean();
      const completedAttempts = await Attempt.find({
        $or: [{ user: session.userId }, { user: String(session.userId) }],
        quiz: quiz._id,
        inProgress: false,
      })
        .select(
          "_id attemptNumber startedAt completedAt score grade isBestScore timeSpentInSeconds answers shuffledQuestions currentQuestion"
        )
        .sort({ completedAt: -1 })
        .lean();

      const completed = completedAttempts.map((a: any) => ({
        attemptId: String(a._id),
        attemptNumber: a.attemptNumber,
        startedAt: a.startedAt,
        completedAt: a.completedAt,
        score: a.score,
        grade: a.grade,
        isBestScore: !!a.isBestScore,
        timeSpentInSeconds: a.timeSpentInSeconds ?? 0,
        answers: a.answers || {},
        shuffledQuestions: a.shuffledQuestions || {},
        currentQuestion: typeof a.currentQuestion === "number" ? a.currentQuestion : undefined,
      }));

      const attempts = [
        ...(inProgress
          ? [
              {
                attemptId: String(inProgress._id),
                attemptNumber: inProgress.attemptNumber,
                startedAt: inProgress.startedAt,
                completedAt: inProgress.startedAt,
                score: 0,
                grade: "",
                isBestScore: false,
                timeSpentInSeconds: inProgress.timeSpentInSeconds ?? 0,
                answers: (inProgress as any).answers || {},
                shuffledQuestions: (inProgress as any).shuffledQuestions || {},
                currentQuestion:
                  typeof (inProgress as any).currentQuestion === "number"
                    ? (inProgress as any).currentQuestion
                    : undefined,
                inProgress: true,
              },
            ]
          : []),
        ...completed,
      ];

      return NextResponse.json({
        ...sanitizedQuiz,
        attempts,
      });
    }

    return NextResponse.json(sanitizedQuiz);
  } catch (error: unknown) {
    const message = (error as any)?.message || "Failed to fetch quiz";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
