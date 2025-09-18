import { connectViaMongoose } from "@/lib/db";
import User from "@/models/User";
import { UserSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const SignupSchema = UserSchema.pick({
  email: true,
  username: true,
}).extend({
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, username } = SignupSchema.parse(body);
    await connectViaMongoose();

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const doc = await User.create({
      email,
      username,
      passwordHash,
      authProvider: "credentials",
    });
    return NextResponse.json({ id: String(doc._id) }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Invalid request" },
      { status: 400 }
    );
  }
}
