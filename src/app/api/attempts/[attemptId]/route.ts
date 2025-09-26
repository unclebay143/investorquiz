import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectViaMongoose } from "@/lib/db";
import { calculateGrade } from "@/lib/retakeUtils";
import Attempt from "@/models/Attempt";
import type { Question } from "@/types";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET removed: attempts are read via GET /api/quizzes/[quizId]?includeAttempts=true

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const session = (await getServerSession(authOptions)) as { userId?: string } | null;
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      answers,
      currentQuestion,
      score,
      grade,
      completedAt,
      inProgress,
      isBestScore,
      timeSpentInSeconds,
      shuffledQuestions,
    } = body;

    await connectViaMongoose();
    const { attemptId } = await params;

    const update: Record<string, unknown> = {};
    if (answers) {
      update.answers = answers;
    }
    if (shuffledQuestions) {
      // Merge shuffled questions instead of replacing
      const existingAttempt = await Attempt.findById(attemptId).lean();
      const existingShuffled = existingAttempt?.shuffledQuestions || {};
      const mergedShuffled = { ...existingShuffled, ...shuffledQuestions };
      update.shuffledQuestions = mergedShuffled;
    }
    if (typeof currentQuestion === "number")
      update.currentQuestion = currentQuestion;
    if (typeof inProgress === "boolean") update.inProgress = inProgress;
    if (typeof score === "number") update.score = score;
    if (typeof grade === "string") update.grade = grade;
    if (typeof isBestScore === "boolean") update.isBestScore = isBestScore;
    if (completedAt) update.completedAt = new Date(completedAt);
    if (typeof timeSpentInSeconds === "number")
      update.timeSpentInSeconds = timeSpentInSeconds;

    // If quiz is being completed (inProgress = false), validate and calculate score and grade
    if (typeof inProgress === "boolean" && !inProgress && answers) {
      const attempt = await Attempt.findById(attemptId)
        .populate({ path: "quiz", select: "_id questions" })
        .lean<{ quiz: { _id: unknown; questions: Array<Pick<Question, "id" | "correctKey">> } } | null>();
      if (attempt && attempt.quiz) {
        const quiz = attempt.quiz;

        // Validate that all questions are answered before completing the quiz
        const totalQuestions = quiz.questions.length;
        const answeredQuestions = Object.keys(answers).length;

        if (answeredQuestions < totalQuestions) {
          return NextResponse.json(
            {
              error: `Incomplete quiz submission. Only ${answeredQuestions} out of ${totalQuestions} questions answered.`,
            },
            { status: 400 }
          );
        }

        // Validate that all question IDs in answers exist in the quiz
        const quizQuestionIds = quiz.questions.map((q) => String(q.id));
        const answerQuestionIds = Object.keys(answers);

        const missingQuestions = quizQuestionIds.filter(
          (id: string) => !answerQuestionIds.includes(id)
        );
        const extraQuestions = answerQuestionIds.filter(
          (id: string) => !quizQuestionIds.includes(id)
        );

        if (missingQuestions.length > 0) {
          return NextResponse.json(
            {
              error: `Missing answers for questions: ${missingQuestions.join(
                ", "
              )}`,
            },
            { status: 400 }
          );
        }

        if (extraQuestions.length > 0) {
          return NextResponse.json(
            {
              error: `Invalid question IDs in answers: ${extraQuestions.join(
                ", "
              )}`,
            },
            { status: 400 }
          );
        }
        let calculatedScore = 0;

        // Calculate score based on correct answers
        quiz.questions.forEach((question) => {
          if (answers[String(question.id)] === question.correctKey) {
            calculatedScore += 1;
          }
        });

        // Calculate grade based on percentage
        const percentage = (calculatedScore / quiz.questions.length) * 100;
        const gradeInfo = calculateGrade(percentage);

        update.score = calculatedScore;
        update.grade = gradeInfo.grade;

        // Check if this is the best score for this user and quiz
        const userAttempts = await Attempt.find({
          user: session.userId,
          quiz: quiz._id,
          inProgress: false,
        }).lean();

        const bestScore =
          userAttempts.length > 0
            ? Math.max(...userAttempts.map((a: { score?: number }) => a.score || 0))
            : -1;

        update.isBestScore = calculatedScore > bestScore;
      }
    }

    const doc = await Attempt.findOneAndUpdate(
      {
        _id: attemptId,
        $or: [{ user: session.userId }, { user: String(session.userId) }],
      },
      { $set: update },
      { new: true }
    ).lean();

    if (!doc)
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });

    return NextResponse.json(
      { ok: true },
      {
        headers: {
          // Invalidate user's topic cache when attempt is updated
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "X-Cache-Invalidate": `user-${session.userId}-topic-*`,
        },
      }
    );
  } catch (e: unknown) {
    const message =
      typeof e === "object" && e && "message" in e
        ? String((e as { message?: unknown }).message || "Failed to update attempt")
        : "Failed to update attempt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
