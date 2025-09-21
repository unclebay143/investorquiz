import type { AuthorInput } from "@/schemas";
import { Document, Schema, model, models } from "mongoose";

type IAuthor = AuthorInput &
  Document & {
    createdAt: Date;
    updatedAt: Date;
  };

const AuthorSchema = new Schema<IAuthor>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    title: { type: String },
    bio: { type: String },
    profileImage: { type: String },
    socialLinks: {
      twitter: String,
      linkedin: String,
      website: String,
    },
    quote: { type: String },
  },
  { timestamps: true }
);

// Add additional indexes for better performance
AuthorSchema.index({ name: 1 });

export default models.Author || model<IAuthor>("Author", AuthorSchema);
export type { IAuthor };
