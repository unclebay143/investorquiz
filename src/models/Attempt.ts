import type { AttemptInput } from "@/schemas";
import { Document, model, models, Schema, Types } from "mongoose";

type IAttempt = AttemptInput &
  Document & {
    user?: Types.ObjectId | string;
    exam?: Types.ObjectId | string;
    topic?: Types.ObjectId | string;
    createdAt: Date;
    updatedAt: Date;
  };

const AttemptSchema = new Schema<IAttempt>(
  {
    user: { type: Types.ObjectId, ref: "User", index: true, required: false },
    exam: { type: Types.ObjectId, ref: "Exam", index: true, required: false },
    topic: { type: Types.ObjectId, ref: "Topic", index: true, required: false },
    attemptNumber: { type: Number, required: true },
    score: { type: Number, required: true },
    timeSpentInSeconds: { type: Number, required: true },
    completedAt: { type: Date, default: Date.now },
    answers: { type: Map, of: String, default: {} },
    grade: { type: String, required: true },
    isBestScore: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Attempt || model<IAttempt>("Attempt", AttemptSchema);
export type { IAttempt };
