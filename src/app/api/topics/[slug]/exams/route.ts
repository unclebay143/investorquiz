import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectViaMongoose } from "@/lib/db";
import Attempt from "@/models/Attempt";
import Author from "@/models/Author";
import Exam from "@/models/Exam";
import Topic from "@/models/Topic";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectViaMongoose();
    const { slug } = await params;

    // Find topic by slug first
    const topic = (await Topic.findOne({ slug }).select("_id").lean()) as {
      _id: unknown;
    } | null;

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const exams = await Exam.find({ topic: topic._id })
      .populate({
        path: "author",
        select: "name title bio profileImage slug socialLinks books quote", // All author fields
        model: Author,
      })
      .select(
        "slug title description totalPoints reviewMode isNew retakeSettings questions"
      )
      .sort({ createdAt: 1 })
      .lean();

    // Fetch attempt statuses for all exams
    const attemptStatuses: Record<string, any> = {};

    if (exams.length > 0) {
      const examIds = exams.map((exam) => exam._id);

      // Get all attempts for this user and these exams
      const attempts = await Attempt.find({
        $or: [{ user: session.userId }, { user: String(session.userId) }],
        exam: { $in: examIds },
      })
        .select("exam inProgress attemptNumber completedAt score")
        .sort({ attemptNumber: -1 })
        .lean();

      // Process attempts to determine status for each exam
      for (const exam of exams) {
        const examAttempts = attempts.filter(
          (attempt) => String(attempt.exam) === String(exam._id)
        );

        if (examAttempts.length === 0) {
          attemptStatuses[exam.slug] = {
            status: "none",
            canRetake: false,
            attemptsRemaining: 0,
          };
          continue;
        }

        const inProgressAttempt = examAttempts.find(
          (attempt) => attempt.inProgress
        );
        if (inProgressAttempt) {
          attemptStatuses[exam.slug] = {
            status: "in-progress",
            attemptId: String(inProgressAttempt._id),
            attemptNumber: inProgressAttempt.attemptNumber,
            startedAt: inProgressAttempt.startedAt,
          };
          continue;
        }

        // Check completed attempts
        const completedAttempts = examAttempts.filter(
          (attempt) => !attempt.inProgress
        );
        if (completedAttempts.length > 0) {
          const latestAttempt = completedAttempts[0];
          const retakeSettings = exam.retakeSettings || {
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

          attemptStatuses[exam.slug] = {
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

    return NextResponse.json(
      {
        exams,
        attemptStatuses,
      },
      {
        headers: {
          // Cache for 30 seconds per user - short enough to feel real-time
          // but long enough to avoid excessive database queries
          "Cache-Control": `private, max-age=30, s-maxage=0`,
          // Add user-specific cache key to prevent cross-user cache pollution
          "X-Cache-Key": `user-${session.userId}-topic-${slug}`,
        },
      }
    );
  } catch (error: unknown) {
    const message = (error as any)?.message || "Failed to fetch exams";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
