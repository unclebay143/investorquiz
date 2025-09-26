import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectViaMongoose } from "@/lib/db";
import Attempt from "@/models/Attempt";
import Author from "@/models/Author";
import Quiz from "@/models/Quiz";
import Topic from "@/models/Topic";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = (await getServerSession(authOptions)) as { userId?: string } | null;

    await connectViaMongoose();
    const { slug } = await params;

    // Find topic by slug first
    const topic = (await Topic.findOne({ slug }).select("_id").lean()) as {
      _id: unknown;
    } | null;

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const quizzes = await Quiz.find({ topic: topic._id })
      .populate({
        path: "author",
        select: "name title bio profileImage slug socialLinks books quote", // All author fields
        model: Author,
      })
      .select(
        "slug title description totalPoints reviewMode retakeSettings questions"
      )
      .sort({ createdAt: 1 })
      .lean();

    // Remove answer-related fields from questions before responding
    const sanitizedQuizzes = quizzes.map((quiz: any) => ({
      ...quiz,
      questions: Array.isArray(quiz.questions)
        ? quiz.questions.map((q: any) => {
            const { correctKey, explanation, ...rest } = q || {};
            return rest;
          })
        : [],
    }));

    // Fetch attempt statuses for all quizzes (only when authenticated)
    const attemptStatuses: Record<string, unknown> = {};

    if (quizzes.length > 0 && session?.userId) {
      const quizIds = quizzes.map((quiz) => quiz._id);

      // Get all attempts for this user and these quizzes
      const attempts = await Attempt.find({
        $or: [{ user: session.userId }, { user: String(session.userId) }],
        quiz: { $in: quizIds },
      })
        .select("quiz inProgress attemptNumber completedAt score")
        .sort({ attemptNumber: -1 })
        .lean();

      // Process attempts to determine status for each quiz
      for (const quiz of quizzes) {
        const quizAttempts = attempts.filter(
          (attempt) => String(attempt.quiz) === String(quiz._id)
        );

        if (quizAttempts.length === 0) {
          attemptStatuses[quiz.slug] = {
            status: "none",
            canRetake: false,
            attemptsRemaining: 0,
          };
          continue;
        }

        const inProgressAttempt = quizAttempts.find(
          (attempt) => attempt.inProgress
        );
        if (inProgressAttempt) {
          attemptStatuses[quiz.slug] = {
            status: "in-progress",
            attemptId: String(inProgressAttempt._id),
            attemptNumber: inProgressAttempt.attemptNumber,
            startedAt: inProgressAttempt.startedAt,
          };
          continue;
        }

        // Check completed attempts
        const completedAttempts = quizAttempts.filter(
          (attempt) => !attempt.inProgress
        );
        if (completedAttempts.length > 0) {
          const latestAttempt = completedAttempts[0];
          const retakeSettings = quiz.retakeSettings || {
            enabled: false,
            maxAttempts: 1,
            coolDownDays: 0,
          };

          let canRetake = false;
          let attemptsRemaining = 0;

          if (retakeSettings.enabled) {
            const maxAttempts = retakeSettings.maxAttempts || 1;
            const coolDownDays = retakeSettings.coolDownDays || 0;

            attemptsRemaining = Math.max(
              0,
              maxAttempts - completedAttempts.length
            );

            if (attemptsRemaining > 0) {
              if (coolDownDays > 0) {
                const lastCompletedAt = new Date(latestAttempt.completedAt);
                const now = new Date();
                const daysSinceLastAttempt =
                  (now.getTime() - lastCompletedAt.getTime()) /
                  (1000 * 60 * 60 * 24);
                canRetake = daysSinceLastAttempt >= coolDownDays;
              } else {
                canRetake = true;
              }
            }
          }

          attemptStatuses[quiz.slug] = {
            status: "completed",
            attemptId: String(latestAttempt._id),
            attemptNumber: latestAttempt.attemptNumber,
            score: latestAttempt.score,
            canRetake,
            attemptsRemaining,
          };
        }
      }
    }

    const headers: Record<string, string> = {
      // Prevent cross-user caching issues by disabling CDN caching
      "Cache-Control": session?.userId
        ? `private, no-store`
        : `public, max-age=30, s-maxage=0`,
      Vary: "Cookie",
    };
    if (session?.userId) {
      headers["X-Cache-Key"] = `user-${session.userId}-topic-${slug}`;
    }

    return NextResponse.json({ quizzes: sanitizedQuizzes, attemptStatuses }, { headers });
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error && "message" in error
        ? String((error as { message?: unknown }).message || "Failed to fetch quizzes")
        : "Failed to fetch quizzes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
