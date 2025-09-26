import { connectViaMongoose } from "@/lib/db";
import Author from "@/models/Author";
import Quiz from "@/models/Quiz";
import Topic from "@/models/Topic";
import { AuthorSchema, QuizSchema, TopicSchema } from "@/schemas";
import { NextResponse } from "next/server";
import { z } from "zod";

const BulkImportSchema = z.object({
  authors: z.array(AuthorSchema).optional(),
  topics: z.array(TopicSchema).optional(),
  quizzes: z.array(QuizSchema).optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = BulkImportSchema.parse(json);

    await connectViaMongoose();

    type ImportResultError = { error: string } & (
      | { author: string }
      | { topic: string }
      | { quiz: string }
    );

    const results: {
      authors: { imported: number; errors: ImportResultError[] };
      topics: { imported: number; errors: ImportResultError[] };
      quizzes: { imported: number; errors: ImportResultError[] };
    } = {
      authors: { imported: 0, errors: [] },
      topics: { imported: 0, errors: [] },
      quizzes: { imported: 0, errors: [] },
    };

    // Import Authors
    if (data.authors) {
      for (const author of data.authors) {
        try {
          await Author.findOneAndUpdate(
            { slug: author.slug },
            { $set: author },
            { upsert: true, new: true }
          );
          results.authors.imported++;
        } catch (error) {
          results.authors.errors.push({
            author: author.name,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    }

    // Import Topics
    if (data.topics) {
      for (const topic of data.topics) {
        try {
          await Topic.findOneAndUpdate(
            { slug: topic.slug },
            { $set: topic },
            { upsert: true, new: true }
          );
          results.topics.imported++;
        } catch (error) {
          results.topics.errors.push({
            topic: topic.title,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    }

    // Import Quizzes
    if (data.quizzes) {
      for (const quiz of data.quizzes) {
        try {
          const update: Record<string, unknown> = { ...quiz };

          // Resolve topic reference
          if (quiz.topic) {
            const topic = await Topic.findOne({ slug: quiz.topic })
              .select("_id")
              .lean<{ _id: string }>();
            if (!topic) {
              results.quizzes.errors.push({
                quiz: quiz.title,
                error: `Topic not found: ${quiz.topic}`,
              });
              continue;
            }
            update.topic = topic._id;
          }

          // Resolve author reference
          if (quiz.author) {
            const author = await Author.findOne({ slug: quiz.author })
              .select("_id")
              .lean<{ _id: string }>();
            if (!author) {
              results.quizzes.errors.push({
                quiz: quiz.title,
                error: `Author not found: ${quiz.author}`,
              });
              continue;
            }
            update.author = author._id;
          }

          await Quiz.findOneAndUpdate(
            { slug: quiz.slug },
            { $set: update },
            { upsert: true, new: true }
          );
          results.quizzes.imported++;
        } catch (error) {
          results.quizzes.errors.push({
            quiz: quiz.title,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Bulk import completed",
        results,
      },
      { status: 200 }
    );
  } catch (e: unknown) {
    const message =
      e instanceof z.ZodError
        ? e.issues
        : (typeof e === "object" && e && "message" in e)
        ? String((e as { message?: unknown }).message || "Invalid payload")
        : "Invalid payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
