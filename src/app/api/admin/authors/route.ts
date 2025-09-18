import { connectViaMongoose } from "@/lib/db";
import Author from "@/models/Author";
import { AuthorSchema } from "@/schemas";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = AuthorSchema.parse(json);
    await connectViaMongoose();
    const doc = (await Author.findOneAndUpdate(
      { slug: data.slug },
      { $set: data },
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
