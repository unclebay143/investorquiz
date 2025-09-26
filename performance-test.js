// Using built-in fetch (Node.js 18+)

const BASE_URL = "http://localhost:3000";

async function measureTime(name, fn) {
  const start = Date.now();
  try {
    const result = await fn();
    const end = Date.now();
    const duration = end - start;
    console.log(`✅ ${name}: ${duration}ms`);
    return { success: true, duration, result };
  } catch (error) {
    const end = Date.now();
    const duration = end - start;
    console.log(`❌ ${name}: ${duration}ms - Error: ${error.message}`);
    return { success: false, duration, error };
  }
}

async function testTopicsAPI() {
  return await measureTime("Topics API", async () => {
    const response = await fetch(`${BASE_URL}/api/topics`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  });
}

async function testQuizzesAPI(topicSlug) {
  return await measureTime(`Quizzes API (${topicSlug})`, async () => {
    const response = await fetch(`${BASE_URL}/api/topics/${topicSlug}/quizzes`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  });
}

async function testQuizAPI(quizSlug) {
  return await measureTime(`Single Quiz API (${quizSlug})`, async () => {
    const response = await fetch(`${BASE_URL}/apiquizzes/${quizSlug}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  });
}

async function runPerformanceTest() {
  console.log("🚀 Starting Performance Test...\n");

  const results = {
    topics: [],
    quizzes: [],
    singleQuiz: [],
  };

  // Run multiple tests to get average performance
  const testRuns = 3;

  for (let i = 0; i < testRuns; i++) {
    console.log(`\n--- Test Run ${i + 1}/${testRuns} ---`);

    // Test topics API
    const topicsResult = await testTopicsAPI();
    if (topicsResult.success) {
      results.topics.push(topicsResult.duration);

      const topics = topicsResult.result;
      console.log(`📊 Found ${topics.length} topics`);

      // Test quizzes API for first topic
      if (topics.length > 0) {
        const quizResult = await testQuizzesAPI(topics[0].slug);
        if (quizResult.success) {
          results.quizzes.push(quizResult.duration);

          if (quizResult.result.length > 0) {
            // Test single quiz API for first quiz
            const firstQuiz = quizResult.result[0];
            const quizResult = await testQuizAPI(firstQuiz.slug);
            if (quizResult.success) {
              results.singleQuiz.push(quizResult.duration);
            }
          }
        }
      }
    }

    // Wait a bit between runs
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Calculate averages
  console.log("\n📈 Performance Summary:");
  console.log(
    `Topics API: ${Math.round(
      results.topics.reduce((a, b) => a + b, 0) / results.topics.length
    )}ms (avg)`
  );
  console.log(
    `Quizzes API: ${Math.round(
      results.quizzes.reduce((a, b) => a + b, 0) / results.quizzes.length
    )}ms (avg)`
  );
  console.log(
    `Single Quiz API: ${Math.round(
      results.singleQuiz.reduce((a, b) => a + b, 0) / results.singleQuiz.length
    )}ms (avg)`
  );

  console.log("\n🏁 Performance test completed!");
}

// Run the test
runPerformanceTest().catch(console.error);
