import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectViaMongoose } from "@/lib/db";
import Attempt from "@/models/Attempt";
import Exam from "@/models/Exam";
import Topic from "@/models/Topic";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const topicSlug = searchParams.get("topicSlug");
    const examSlug = searchParams.get("examSlug");

    if (!topicSlug || !examSlug) {
      return NextResponse.json(
        { error: "topicSlug and examSlug required" },
        { status: 400 }
      );
    }

    await connectViaMongoose();

    console.log("Attempt status API - Looking for:", {
      topicSlug,
      examSlug,
      userId: session.userId,
    });

    // Find topic and exam
    const topic = (await Topic.findOne({ slug: topicSlug })
      .select("_id")
      .lean()) as { _id: unknown } | null;
    console.log("Found topic:", topic);
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const exam = (await Exam.findOne({ slug: examSlug })
      .select("_id retakeSettings")
      .lean()) as { _id: unknown; retakeSettings?: any } | null;
    console.log("Found exam:", exam);
    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Check for in-progress attempt
    const inProgressAttempt = (await Attempt.findOne({
      $or: [{ user: session.userId }, { user: String(session.userId) }],
      exam: exam._id,
      inProgress: true,
    })
      .select("_id attemptNumber startedAt")
      .lean()) as {
      _id: unknown;
      attemptNumber: number;
      startedAt: Date;
    } | null;

    if (inProgressAttempt) {
      return NextResponse.json({
        status: "in-progress",
        attemptId: String(inProgressAttempt._id),
        attemptNumber: inProgressAttempt.attemptNumber,
      });
    }

    // Check completed attempts
    console.log("Looking for completed attempts with:", {
      user: session.userId,
      exam: exam._id,
      inProgress: false,
    });

    const completedAttempts = (await Attempt.find({
      $or: [{ user: session.userId }, { user: String(session.userId) }],
      exam: exam._id,
      inProgress: false,
    })
      .select("_id attemptNumber completedAt")
      .sort({ attemptNumber: -1 })
      .lean()) as unknown as {
      _id: unknown;
      attemptNumber: number;
      completedAt: Date;
    }[];

    console.log("Found completed attempts:", completedAttempts);

    if (completedAttempts.length === 0) {
      console.log("No completed attempts found");
      return NextResponse.json({
        status: "none",
        canRetake: false,
        attemptsRemaining: 0,
      });
    }

    const latestAttempt = completedAttempts[0];
    const retakeSettings = exam.retakeSettings || {};
    const maxAttempts = retakeSettings.maxAttempts || 1;
    const coolDownDays = retakeSettings.coolDownDays || 0;
    const retakesEnabled = retakeSettings.enabled || false;

    // Check if can retake
    const attemptsRemaining = Math.max(
      0,
      maxAttempts - latestAttempt.attemptNumber
    );
    const canRetake = retakesEnabled && attemptsRemaining > 0;

    // Check cooldown
    let nextRetakeDate = null;
    if (canRetake && coolDownDays > 0) {
      const lastCompleted = new Date(latestAttempt.completedAt);
      const cooldownEnd = new Date(
        lastCompleted.getTime() + coolDownDays * 24 * 60 * 60 * 1000
      );
      const now = new Date();

      if (now < cooldownEnd) {
        nextRetakeDate = cooldownEnd.toISOString();
        return NextResponse.json({
          status: "completed",
          attemptId: String(latestAttempt._id),
          attemptNumber: latestAttempt.attemptNumber,
          canRetake: false,
          attemptsRemaining,
          nextRetakeDate,
        });
      }
    }

    return NextResponse.json({
      status: "completed",
      attemptId: String(latestAttempt._id),
      attemptNumber: latestAttempt.attemptNumber,
      canRetake,
      attemptsRemaining,
      nextRetakeDate,
    });
  } catch (e: unknown) {
    const message = (e as any)?.message || "Failed to check attempt status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
