#!/usr/bin/env node

/**
 * Simple CLI tool to import topics and questions
 *
 * Usage:
 * node scripts/import-data.js your-data.json
 *
 * Or provide data directly:
 * node scripts/import-data.js
 */

const fs = require("fs");
const path = require("path");

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function bulkImport(data) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/bulk-import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${JSON.stringify(error)}`);
    }

    return response.json();
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

async function main() {
  try {
    log("🚀 Starting Data Import...", "bright");

    let data;

    // Check if a file was provided as argument
    if (process.argv[2]) {
      const filePath = path.resolve(process.argv[2]);

      if (!fs.existsSync(filePath)) {
        log(`❌ File not found: ${filePath}`, "red");
        process.exit(1);
      }

      const rawData = fs.readFileSync(filePath, "utf8");
      data = JSON.parse(rawData);
      log(`📁 Loaded data from: ${filePath}`, "blue");
    } else {
      // Use template data for demonstration
      log("📝 No file provided, using sample data...", "yellow");
      data = {
        authors: [
          {
            slug: "sample-author",
            name: "Sample Author",
            title: "Investment Expert",
            bio: "A sample author for testing purposes.",
            quote: "Sample quote about investing.",
          },
        ],
        topics: [
          {
            slug: "sample-topic",
            title: "Sample Topic",
            description: "A sample topic for testing purposes.",
            isNewTopic: true,
          },
        ],
        quizzes: [
          {
            slug: "sample-quiz",
            topic: "sample-topic",
            author: "sample-author",
            title: "Sample Quiz",
            description: "A sample quiz for testing purposes.",
            totalPoints: 100,
            reviewMode: "post",
            questions: [
              {
                id: 1,
                prompt: "What is 2 + 2?",
                options: {
                  A: "3",
                  B: "4",
                  C: "5",
                  D: "6",
                },
                correctKey: "B",
                explanation: "2 + 2 equals 4.",
              },
            ],
          },
        ],
      };
    }

    // Validate data structure
    if (!data.authors || !data.topics || !data.quizzes) {
      log(
        "❌ Invalid data structure. Expected: { authors: [], topics: [], quizzes: [] }",
        "red"
      );
      process.exit(1);
    }

    log(
      `📊 Found ${data.authors.length} authors, ${data.topics.length} topics, ${data.quizzes.length} quizzes`,
      "blue"
    );

    // Perform bulk import
    const result = await bulkImport(data);

    log("\n📋 Import Results:", "cyan");
    log(`✅ Authors: ${result.results.authors.imported} imported`, "green");
    if (result.results.authors.errors.length > 0) {
      log(`❌ Authors errors: ${result.results.authors.errors.length}`, "red");
      result.results.authors.errors.forEach((err) => {
        log(`   - ${err.author}: ${err.error}`, "red");
      });
    }

    log(`✅ Topics: ${result.results.topics.imported} imported`, "green");
    if (result.results.topics.errors.length > 0) {
      log(`❌ Topics errors: ${result.results.topics.errors.length}`, "red");
      result.results.topics.errors.forEach((err) => {
        log(`   - ${err.topic}: ${err.error}`, "red");
      });
    }

    log(`✅ Quizzes: ${result.results.quizzes.imported} imported`, "green");
    if (result.results.quizzes.errors.length > 0) {
      log(`❌ Quizzes errors: ${result.results.quizzes.errors.length}`, "red");
      result.results.quizzes.errors.forEach((err) => {
        log(`   - ${err.quiz}: ${err.error}`, "red");
      });
    }

    log("\n🎉 Import completed!", "green");
  } catch (error) {
    log(`❌ Fatal error: ${error.message}`, "red");
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main, bulkImport };
