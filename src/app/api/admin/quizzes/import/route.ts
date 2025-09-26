import { connectViaMongoose } from "@/lib/db";
import Author from "@/models/Author";
import Quiz from "@/models/Quiz";
import Topic from "@/models/Topic";
import { QuizSchema } from "@/schemas";
import { NextResponse } from "next/server";
import { z } from "zod";

const PayloadSchema = z.object({ quizzes: z.array(QuizSchema) });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { quizzes } = PayloadSchema.parse(body);

    await connectViaMongoose();

    let created = 0;
    let updated = 0;
    const errors: Array<{ slug?: string; error: string }> = [];

    for (const quiz of quizzes) {
      try {
        // Ensure topic/author documents exist if provided as slugs
        const update: any = { ...quiz };
        if (quiz.topic) {
          const topicDoc = (await Topic.findOneAndUpdate(
            { slug: quiz.topic },
            { $setOnInsert: { slug: quiz.topic, title: quiz.topic } },
            { upsert: true, new: true }
          )
            .select("_id")
            .lean()) as { _id: unknown } | null;
          update.topic = topicDoc?._id;
        }
        if (quiz.author) {
          const authorDoc = (await Author.findOneAndUpdate(
            { slug: quiz.author },
            { $setOnInsert: { slug: quiz.author, name: quiz.author } },
            { upsert: true, new: true }
          )
            .select("_id")
            .lean()) as { _id: unknown } | null;
          update.author = authorDoc?._id;
        }

        const res = await Quiz.findOneAndUpdate(
          { slug: quiz.slug },
          { $set: update },
          { upsert: true, new: true }
        ).lean();
        if (res) {
          // heuristic: if it existed before, it was an update; we can't easily tell without extra query
          updated += 1;
        } else {
          created += 1;
        }
      } catch (e: any) {
        errors.push({ slug: quiz.slug, error: e.message || "Unknown error" });
      }
    }

    return NextResponse.json({ created, updated, errors });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Invalid payload" },
      { status: 400 }
    );
  }
}
