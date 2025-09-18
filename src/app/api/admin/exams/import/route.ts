import { connectViaMongoose } from "@/lib/db";
import Author from "@/models/Author";
import Exam from "@/models/Exam";
import Topic from "@/models/Topic";
import { ExamSchema } from "@/schemas";
import { NextResponse } from "next/server";
import { z } from "zod";

const PayloadSchema = z.object({ exams: z.array(ExamSchema) });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { exams } = PayloadSchema.parse(body);

    await connectViaMongoose();

    let created = 0;
    let updated = 0;
    const errors: Array<{ slug?: string; error: string }> = [];

    for (const exam of exams) {
      try {
        // Ensure topic/author documents exist if provided as slugs
        const update: any = { ...exam };
        if (exam.topic) {
          const topicDoc = (await Topic.findOneAndUpdate(
            { slug: exam.topic },
            { $setOnInsert: { slug: exam.topic, title: exam.topic } },
            { upsert: true, new: true }
          )
            .select("_id")
            .lean()) as { _id: unknown } | null;
          update.topic = topicDoc?._id;
        }
        if (exam.author) {
          const authorDoc = (await Author.findOneAndUpdate(
            { slug: exam.author },
            { $setOnInsert: { slug: exam.author, name: exam.author } },
            { upsert: true, new: true }
          )
            .select("_id")
            .lean()) as { _id: unknown } | null;
          update.author = authorDoc?._id;
        }

        const res = await Exam.findOneAndUpdate(
          { slug: exam.slug },
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
        errors.push({ slug: exam.slug, error: e.message || "Unknown error" });
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
