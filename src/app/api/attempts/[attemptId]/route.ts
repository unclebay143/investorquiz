import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectViaMongoose } from "@/lib/db";
import Attempt from "@/models/Attempt";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectViaMongoose();
    const { attemptId } = await params;

    const attempt = await Attempt.findOne({
      _id: attemptId,
      $or: [{ user: session.userId }, { user: String(session.userId) }],
    })
      .populate("exam", "slug title totalPoints reviewMode questions")
      .populate("topic", "slug title")
      .lean();

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    return NextResponse.json(attempt);
  } catch (e: unknown) {
    const message = (e as any)?.message || "Failed to fetch attempt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const session = (await getServerSession(authOptions)) as any;
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
    } = body;

    await connectViaMongoose();
    const { attemptId } = await params;

    const update: any = {};
    if (answers) update.answers = answers;
    if (typeof currentQuestion === "number")
      update.currentQuestion = currentQuestion;
    if (typeof inProgress === "boolean") update.inProgress = inProgress;
    if (typeof score === "number") update.score = score;
    if (typeof grade === "string") update.grade = grade;
    if (typeof isBestScore === "boolean") update.isBestScore = isBestScore;
    if (completedAt) update.completedAt = new Date(completedAt);

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
    const message = (e as any)?.message || "Failed to update attempt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
