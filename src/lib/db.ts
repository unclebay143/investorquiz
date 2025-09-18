import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  // We won't throw at import time to avoid breaking Next build previews without env
  // Consumers should handle connection errors gracefully.
  // eslint-disable-next-line no-console
  console.warn(
    "MONGODB_URI not set - database connections will fail until configured."
  );
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

let cached = globalThis.mongooseCache;
if (!cached) cached = globalThis.mongooseCache = { conn: null, promise: null };

export async function connectViaMongoose() {
  if (cached!.conn) return cached!.conn;
  if (!cached!.promise) {
    if (!MONGODB_URI) throw new Error("MONGODB_URI not set");
    cached!.promise = mongoose.connect(MONGODB_URI);
  }
  cached!.conn = await cached!.promise;
  return cached!.conn;
}
