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

async function testExamsAPI(topicSlug) {
  return await measureTime(`Exams API (${topicSlug})`, async () => {
    const response = await fetch(`${BASE_URL}/api/topics/${topicSlug}/exams`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  });
}

async function testExamAPI(examSlug) {
  return await measureTime(`Single Exam API (${examSlug})`, async () => {
    const response = await fetch(`${BASE_URL}/api/exams/${examSlug}`);
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
    exams: [],
    singleExam: [],
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

      // Test exams API for first topic
      if (topics.length > 0) {
        const examsResult = await testExamsAPI(topics[0].slug);
        if (examsResult.success) {
          results.exams.push(examsResult.duration);

          if (examsResult.result.length > 0) {
            // Test single exam API for first exam
            const firstExam = examsResult.result[0];
            const examResult = await testExamAPI(firstExam.slug);
            if (examResult.success) {
              results.singleExam.push(examResult.duration);
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
    `Exams API: ${Math.round(
      results.exams.reduce((a, b) => a + b, 0) / results.exams.length
    )}ms (avg)`
  );
  console.log(
    `Single Exam API: ${Math.round(
      results.singleExam.reduce((a, b) => a + b, 0) / results.singleExam.length
    )}ms (avg)`
  );

  console.log("\n🏁 Performance test completed!");
}

// Run the test
runPerformanceTest().catch(console.error);
