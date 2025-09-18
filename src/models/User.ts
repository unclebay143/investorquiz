import type { UserInput } from "@/schemas";
import { Document, Schema, model, models } from "mongoose";

type IUser = UserInput &
  Document & {
    passwordHash?: string;
    createdAt: Date;
    updatedAt: Date;
  };

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, index: true },
    avatarUrl: { type: String },
    email: { type: String, unique: true, sparse: true, index: true },
    authProvider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    passwordHash: { type: String },
  },
  { timestamps: true }
);

export default models.User || model<IUser>("User", UserSchema);
export type { IUser };
