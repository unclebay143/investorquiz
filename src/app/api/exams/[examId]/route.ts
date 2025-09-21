import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectViaMongoose } from "@/lib/db";
import Author from "@/models/Author";
import Exam from "@/models/Exam";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectViaMongoose();
    const { examId } = await params;
    const exam = await Exam.findOne({ slug: examId })
      .populate({
        path: "author",
        select: "name title bio profileImage slug socialLinks books quote", // All author fields
        model: Author,
      })
      .lean();

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json(exam);
  } catch (error: unknown) {
    const message = (error as any)?.message || "Failed to fetch exam";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
