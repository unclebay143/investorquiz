import { connectViaMongoose } from "@/lib/db";
import Topic from "@/models/Topic";
import { NextResponse } from "next/server";

export async function GET() {
  try {

    await connectViaMongoose();

    // Get topics without quiz counts for better performance
    const topics = await Topic.find({})
      .select("slug title description createdAt")
      .sort({ title: 1 })
      .lean();

    // Add cache headers for better performance
    return NextResponse.json(topics, {
      headers: {
        // Allow public access to topics (no PII)
        "Cache-Control": "public, max-age=60, s-maxage=0",
        Vary: "Cookie",
      },
    });
  } catch (error: unknown) {
    const message = (error as any)?.message || "Failed to fetch topics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
