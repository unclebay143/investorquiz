import type { ExamInput } from "@/schemas";
import { Document, model, models, Schema, Types } from "mongoose";

type IExam = ExamInput &
  Document & {
    createdAt: Date;
    updatedAt: Date;
  };

const ExamSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    topic: { type: Types.ObjectId, ref: "Topic", required: false, index: true },
    title: { type: String, required: true },
    description: { type: String },
    totalPoints: { type: Number, required: true },
    reviewMode: {
      type: String,
      enum: ["immediate", "post"],
      required: true,
      default: "post",
    },
    isNew: { type: Boolean, default: false },
    author: { type: Types.ObjectId, ref: "Author", index: true },
    retakeSettings: {
      enabled: { type: Boolean },
      maxAttempts: { type: Number },
      coolDownDays: { type: Number },
    },
    questions: [
      new Schema(
        {
          id: Number,
          prompt: String,
          options: {
            type: Map,
            of: String,
          },
          correctKey: String,
          explanation: String,
        },
        { _id: false }
      ),
    ],
  },
  { timestamps: true }
);

// Add additional indexes for better performance
ExamSchema.index({ title: 1 });
ExamSchema.index({ topic: 1, title: 1 }); // Compound index for topic + title queries

export default models.Exam || model<IExam>("Exam", ExamSchema);
export type { IExam };
