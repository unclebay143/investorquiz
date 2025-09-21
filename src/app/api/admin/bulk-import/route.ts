import { connectViaMongoose } from "@/lib/db";
import Author from "@/models/Author";
import Exam from "@/models/Exam";
import Topic from "@/models/Topic";
import { AuthorSchema, ExamSchema, TopicSchema } from "@/schemas";
import { NextResponse } from "next/server";
import { z } from "zod";

const BulkImportSchema = z.object({
  authors: z.array(AuthorSchema).optional(),
  topics: z.array(TopicSchema).optional(),
  exams: z.array(ExamSchema).optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = BulkImportSchema.parse(json);

    await connectViaMongoose();

    const results = {
      authors: { imported: 0, errors: [] },
      topics: { imported: 0, errors: [] },
      exams: { imported: 0, errors: [] },
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

    // Import Exams
    if (data.exams) {
      for (const exam of data.exams) {
        try {
          const update: any = { ...exam };

          // Resolve topic reference
          if (exam.topic) {
            const topic = await Topic.findOne({ slug: exam.topic })
              .select("_id")
              .lean();
            if (!topic) {
              results.exams.errors.push({
                exam: exam.title,
                error: `Topic not found: ${exam.topic}`,
              });
              continue;
            }
            update.topic = topic._id;
          }

          // Resolve author reference
          if (exam.author) {
            const author = await Author.findOne({ slug: exam.author })
              .select("_id")
              .lean();
            if (!author) {
              results.exams.errors.push({
                exam: exam.title,
                error: `Author not found: ${exam.author}`,
              });
              continue;
            }
            update.author = author._id;
          }

          await Exam.findOneAndUpdate(
            { slug: exam.slug },
            { $set: update },
            { upsert: true, new: true }
          );
          results.exams.imported++;
        } catch (error) {
          results.exams.errors.push({
            exam: exam.title,
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
        : (e as any)?.message || "Invalid payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
