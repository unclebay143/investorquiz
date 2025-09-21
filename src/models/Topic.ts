import type { TopicInput } from "@/schemas";
import { Document, Schema, model, models } from "mongoose";

type ITopic = TopicInput &
  Document & {
    createdAt: Date;
    updatedAt: Date;
  };

const TopicSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    isNewTopic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Add additional indexes for better performance
TopicSchema.index({ title: 1 });

export default models.Topic || model<ITopic>("Topic", TopicSchema);
export type { ITopic };
