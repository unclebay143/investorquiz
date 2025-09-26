import type { AttemptInput } from "@/schemas";
import { Document, model, models, Schema, Types } from "mongoose";

type IAttempt = AttemptInput &
  Document & {
    user?: Types.ObjectId | string;
    quiz?: Types.ObjectId | string;
    topic?: Types.ObjectId | string;
    inProgress?: boolean;
    currentQuestion?: number;
    startedAt?: Date;
    shuffledQuestions?: Map<
      string,
      {
        shuffledOptions: { [key: string]: string };
        keyMapping: { [key: string]: string };
        correctShuffledKey: string;
      }
    >;
    createdAt: Date;
    updatedAt: Date;
  };

const AttemptSchema = new Schema<IAttempt>(
  {
    user: { type: Types.ObjectId, ref: "User", index: true, required: false },
    quiz: { type: Types.ObjectId, ref: "Quiz", index: true, required: false },
    topic: { type: Types.ObjectId, ref: "Topic", index: true, required: false },
    inProgress: { type: Boolean, default: true, index: true },
    currentQuestion: { type: Number, default: 0 },
    startedAt: { type: Date, required: true },
    attemptNumber: { type: Number, required: true },
    score: { type: Number, required: true },
    completedAt: { type: Date },
    answers: { type: Map, of: String, default: {} },
    shuffledQuestions: { type: Map, of: Object, default: {} },
    grade: { type: String, required: true },
    isBestScore: { type: Boolean, default: false },
    timeSpentInSeconds: { type: Number, required: false },
  },
  { timestamps: true }
);

// Clear any cached model to ensure fresh schema
delete models.Attempt;
export default model<IAttempt>("Attempt", AttemptSchema);
export type { IAttempt };
