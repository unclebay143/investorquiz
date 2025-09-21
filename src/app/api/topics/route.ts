import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectViaMongoose } from "@/lib/db";
import Topic from "@/models/Topic";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectViaMongoose();

    // Get topics without exam counts for better performance
    const topics = await Topic.find({})
      .select("slug title description createdAt")
      .sort({ title: 1 })
      .lean();

    // Add cache headers for better performance
    return NextResponse.json(topics, {
      headers: {
        "Cache-Control": "public, max-age=300", // 5 minutes cache
      },
    });
  } catch (error: unknown) {
    const message = (error as any)?.message || "Failed to fetch topics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
