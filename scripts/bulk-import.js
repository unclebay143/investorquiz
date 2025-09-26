#!/usr/bin/env node

/**
 * Bulk Import Script for Topics and Questions
 *
 * Usage:
 * node scripts/bulk-import.js
 *
 * This script will read from the data.json file and import topics, authors, and quizzes
 */

const fs = require("fs");
const path = require("path");

// Configuration
const DATA_FILE = path.join(__dirname, "data.json");
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function makeRequest(endpoint, data) {
  const response = await fetch(`${API_BASE_URL}/api/admin/${endpoint}`, {
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
}

async function importAuthors(authors) {
  log("\n📝 Importing Authors...", "cyan");

  for (const author of authors) {
    try {
      const result = await makeRequest("authors", author);
      log(`✅ Author "${author.name}" imported successfully`, "green");
    } catch (error) {
      log(
        `❌ Failed to import author "${author.name}": ${error.message}`,
        "red"
      );
    }
  }
}

async function importTopics(topics) {
  log("\n📚 Importing Topics...", "cyan");

  for (const topic of topics) {
    try {
      const result = await makeRequest("topics", topic);
      log(`✅ Topic "${topic.title}" imported successfully`, "green");
    } catch (error) {
      log(
        `❌ Failed to import topic "${topic.title}": ${error.message}`,
        "red"
      );
    }
  }
}

async function importQuizzes(quizzes) {
  log("\n📋 Importing Quizzes...", "cyan");

  for (const quiz of quizzes) {
    try {
      const result = await makeRequest("quizzes", quiz);
      log(`✅ Quiz "${quiz.title}" imported successfully`, "green");
    } catch (error) {
      log(`❌ Failed to import quiz "${quiz.title}": ${error.message}`, "red");
    }
  }
}

async function main() {
  try {
    log("🚀 Starting Bulk Import Process...", "bright");

    // Check if data file exists
    if (!fs.existsSync(DATA_FILE)) {
      log(`❌ Data file not found: ${DATA_FILE}`, "red");
      log(
        "Please create a data.json file with your topics and questions.",
        "yellow"
      );
      process.exit(1);
    }

    // Read and parse data file
    const rawData = fs.readFileSync(DATA_FILE, "utf8");
    const data = JSON.parse(rawData);

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

    // Import in order: authors first, then topics, then quizzes
    await importAuthors(data.authors);
    await importTopics(data.topics);
    await importQuizzes(data.quizzes);

    log("\n🎉 Bulk import completed!", "green");
  } catch (error) {
    log(`❌ Fatal error: ${error.message}`, "red");
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main, importAuthors, importTopics, importQuizzes };
