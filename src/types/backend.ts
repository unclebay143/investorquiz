// Prefer a single source of truth: re-export types inferred from Zod schemas
// to avoid drift between runtime validation and TS types.
import type {
  AttemptInput,
  AuthorInput,
  ExamInput,
  ExamQuestionInput,
  TopicInput,
  UserInput,
} from "@/schemas";

export type {
  AttemptInput,
  AuthorInput,
  ExamInput,
  ExamQuestionInput,
  TopicInput,
  UserInput,
};

// Optional helpers for model/doc typing
export type DbId = string;
export type DbTimestamps = {
  createdAt?: string | Date;
  updatedAt?: string | Date;
};
