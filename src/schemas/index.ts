import { z } from "zod";

// Shared primitives
export const ObjectIdString = z
  .string()
  .min(1)
  .regex(/^[a-fA-F0-9]{24}$/, { message: "Expected 24-char hex ObjectId" })
  .or(z.string().min(1)); // allow slugs during seeding/dev

// Author
export const AuthorSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  title: z.string().optional(),
  bio: z.string().optional(),
  profileImage: z.string().url().optional(),
  socialLinks: z
    .object({
      twitter: z.string().url().optional(),
      linkedin: z.string().url().optional(),
      website: z.string().url().optional(),
    })
    .partial()
    .optional(),
  quote: z.string().optional(),
});
export type AuthorInput = z.infer<typeof AuthorSchema>;

// Topic
export const TopicSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  isNew: z.boolean().optional(),
});
export type TopicInput = z.infer<typeof TopicSchema>;

// Exam Question
export const ExamQuestionSchema = z.object({
  id: z.number().int().nonnegative(),
  prompt: z.string().min(1),
  options: z.object({
    A: z.string(),
    B: z.string(),
    C: z.string(),
    D: z.string(),
  }),
  correctKey: z.enum(["A", "B", "C", "D"]),
  explanation: z.string().optional(),
  topic: ObjectIdString.optional(),
  author: ObjectIdString.optional(),
  isNew: z.boolean().optional(),
});
export type ExamQuestionInput = z.infer<typeof ExamQuestionSchema>;

// Exam
export const ExamSchema = z.object({
  slug: z.string().min(1),
  topic: ObjectIdString.optional(),
  author: ObjectIdString.optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  totalPoints: z.number().int().positive(),
  reviewMode: z.enum(["immediate", "post"]),
  isNew: z.boolean().optional(),
  retakeSettings: z
    .object({
      enabled: z.boolean(),
      maxAttempts: z.number().int().positive(),
      coolDownDays: z.number(),
    })
    .partial()
    .optional(),
  questions: z.array(ExamQuestionSchema).min(1),
});
export type ExamInput = z.infer<typeof ExamSchema>;

// Attempt
export const AttemptSchema = z.object({
  user: ObjectIdString.optional(),
  exam: ObjectIdString.optional(),
  topic: ObjectIdString.optional(),
  attemptNumber: z.number().int().positive(),
  score: z.number().nonnegative(),
  timeSpentInSeconds: z.number().int().nonnegative(),
  completedAt: z.string().or(z.date()),
  // Record keys must be ZodString|ZodNumber|ZodSymbol. Use string keys (JSON-safe)
  // and cast to numbers where needed in code.
  answers: z.record(
    z.string(),
    z.enum(["A", "B", "C", "D"]).nullable().or(z.string().min(1))
  ),
  grade: z.string().min(1),
  isBestScore: z.boolean().optional(),
});
export type AttemptInput = z.infer<typeof AttemptSchema>;

export const UserSchema = z.object({
  username: z.string().min(1),
  avatarUrl: z.string().url().optional(),
  email: z.string().email(),
  authProvider: z.enum(["credentials", "google"]),
  passwordHash: z.string().optional(),
});
export type UserInput = z.infer<typeof UserSchema>;
