const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/investment-questions";

async function createIndexes() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;

    console.log("\n📊 Creating indexes...");

    // Create indexes for better performance
    await db.collection("topics").createIndex({ slug: 1 }, { unique: true });
    await db.collection("topics").createIndex({ title: 1 });
    console.log("✅ Topics indexes created");

    await db.collection("quizzes").createIndex({ slug: 1 }, { unique: true });
    await db.collection("quizzes").createIndex({ topic: 1 });
    await db.collection("quizzes").createIndex({ title: 1 });
    await db.collection("quizzes").createIndex({ topic: 1, title: 1 });
    console.log("✅ Quizzes indexes created");

    await db.collection("authors").createIndex({ slug: 1 }, { unique: true });
    await db.collection("authors").createIndex({ name: 1 });
    console.log("✅ Authors indexes created");

    await db.collection("attempts").createIndex({ user: 1 });
    await db.collection("attempts").createIndex({ quiz: 1 });
    await db.collection("attempts").createIndex({ inProgress: 1 });
    await db
      .collection("attempts")
      .createIndex({ user: 1, quiz: 1, inProgress: 1 });
    console.log("✅ Attempts indexes created");

    console.log("\n🎉 All indexes created successfully!");

    // Show index information
    console.log("\n📋 Index Summary:");
    const collections = ["topics", "quizzes", "authors", "attempts"];
    for (const collection of collections) {
      const indexes = await db.collection(collection).listIndexes().toArray();
      console.log(`\n${collection}:`);
      indexes.forEach((index) => {
        console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
      });
    }
  } catch (error) {
    console.error("❌ Error creating indexes:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

createIndexes();
