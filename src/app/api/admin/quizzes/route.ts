import { connectViaMongoose } from "@/lib/db";
import Author from "@/models/Author";
import Quiz from "@/models/Quiz";
import Topic from "@/models/Topic";
import { QuizSchema } from "@/schemas";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = QuizSchema.parse(json);
    await connectViaMongoose();

    const update: any = { ...data };
    if (data.topic) {
      const t = (await Topic.findOne({ slug: data.topic })
        .select("_id")
        .lean()) as { _id: unknown } | null;
      if (!t)
        return NextResponse.json({ error: "Topic not found" }, { status: 400 });
      update.topic = t._id;
    }
    if (data.author) {
      const a = (await Author.findOne({ slug: data.author })
        .select("_id")
        .lean()) as { _id: unknown } | null;
      if (!a)
        return NextResponse.json(
          { error: "Author not found" },
          { status: 400 }
        );
      update.author = a._id;
    }

    const doc = (await Quiz.findOneAndUpdate(
      { slug: data.slug },
      { $set: update },
      { upsert: true, new: true }
    ).lean()) as { _id: unknown } | null;
    return NextResponse.json({ id: String(doc!._id) }, { status: 201 });
  } catch (e: unknown) {
    const message =
      e instanceof z.ZodError
        ? e.issues
        : (e as any)?.message || "Invalid payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
