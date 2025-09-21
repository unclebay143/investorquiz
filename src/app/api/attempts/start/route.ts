import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectViaMongoose } from "@/lib/db";
import Attempt from "@/models/Attempt";
import Exam from "@/models/Exam";
import Topic from "@/models/Topic";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topicSlug, examSlug } = await req.json();
    if (!topicSlug || !examSlug) {
      return NextResponse.json(
        { error: "topicSlug and examSlug required" },
        { status: 400 }
      );
    }

    await connectViaMongoose();

    const topic = (await Topic.findOne({ slug: topicSlug })
      .select("_id")
      .lean()) as { _id: unknown } | null;
    if (!topic)
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });

    const exam = (await Exam.findOne({ slug: examSlug })
      .select("_id retakeSettings")
      .lean()) as { _id: unknown; retakeSettings?: any } | null;
    if (!exam)
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });

    // Check for existing in-progress attempt
    const existingInProgress = await Attempt.findOne({
      user: session.userId,
      exam: exam._id,
      inProgress: true,
    }).lean();

    if (existingInProgress) {
      return NextResponse.json(
        { error: "Attempt already in progress" },
        { status: 409 }
      );
    }

    // Check completed attempts and retake eligibility
    const completedAttempts = (await Attempt.find({
      user: session.userId,
      exam: exam._id,
      inProgress: false,
    })
      .select("attemptNumber completedAt")
      .sort({ attemptNumber: -1 })
      .lean()) as unknown as { attemptNumber: number; completedAt: Date }[];

    if (completedAttempts.length > 0) {
      const latestAttempt = completedAttempts[0];
      const retakeSettings = exam.retakeSettings || {};
      const maxAttempts = retakeSettings.maxAttempts || 1;
      const coolDownDays = retakeSettings.coolDownDays || 0;
      const retakesEnabled = retakeSettings.enabled || false;

      const attemptsRemaining = Math.max(
        0,
        maxAttempts - latestAttempt.attemptNumber
      );

      if (!retakesEnabled || attemptsRemaining <= 0) {
        return NextResponse.json(
          { error: "No retake attempts remaining" },
          { status: 403 }
        );
      }

      // Check cooldown
      if (coolDownDays > 0) {
        const lastCompleted = new Date(latestAttempt.completedAt);
        const cooldownEnd = new Date(
          lastCompleted.getTime() + coolDownDays * 24 * 60 * 60 * 1000
        );
        const now = new Date();

        if (now < cooldownEnd) {
          return NextResponse.json(
            {
              error: "Retake cooldown not expired",
              nextRetakeDate: cooldownEnd.toISOString(),
            },
            { status: 403 }
          );
        }
      }
    }

    // Determine next attempt number
    const attemptNumber =
      completedAttempts.length > 0 ? completedAttempts[0].attemptNumber + 1 : 1;

    const created = await Attempt.create({
      user: session.userId,
      exam: exam._id,
      topic: topic._id,
      attemptNumber,
      currentQuestion: 0,
      startedAt: new Date(),
      score: 0,
      answers: {},
      inProgress: true,
      grade: "F", // Default grade for in-progress attempts
      isBestScore: false,
    });

    return NextResponse.json(
      { id: String(created._id), attemptNumber },
      {
        status: 201,
        headers: {
          // Invalidate user's topic cache when new attempt is started
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "X-Cache-Invalidate": `user-${session.userId}-topic-*`,
        },
      }
    );
  } catch (e: unknown) {
    const message = (e as any)?.message || "Failed to start attempt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
