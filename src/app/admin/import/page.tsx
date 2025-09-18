"use client";

import { useState } from "react";

export default function AdminImportPage() {
  const [value, setValue] = useState(
    JSON.stringify(
      {
        exams: [
          {
            slug: "example-exam",
            topic: "example-topic",
            author: "example-author",
            title: "Example Exam",
            description: "Example description",
            totalPoints: 10,
            reviewMode: "post",
            retakeSettings: { enabled: false, maxAttempts: 1, coolDownDays: 0 },
            isNew: false,
            questions: [
              {
                id: 1,
                prompt: "What is the answer?",
                options: {
                  A: "Option A",
                  B: "Option B",
                  C: "Option C",
                  D: "Option D",
                },
                correctKey: "A",
                explanation: "This is the correct answer because...",
              },
            ],
          },
        ],
      },
      null,
      2
    )
  );
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const payload = JSON.parse(value);
      const res = await fetch("/api/admin/exams/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Import failed");
      setResult(JSON.stringify(json, null, 2));
    } catch (err: any) {
      setResult(err.message || "Invalid JSON");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-3xl mx-auto p-6 space-y-4'>
      <h1 className='text-2xl font-semibold'>Admin: Import Exams (JSON)</h1>
      <div className='flex items-center gap-2'>
        <button
          type='button'
          className='px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 text-sm'
          onClick={() => {
            try {
              const obj = JSON.parse(value);
              const blank = {
                slug: "",
                topic: "",
                author: "",
                title: "",
                description: "",
                totalPoints: 10,
                reviewMode: "post",
                retakeSettings: {
                  enabled: false,
                  maxAttempts: 1,
                  coolDownDays: 0,
                },
                isNew: false,
                questions: [
                  {
                    id: (obj.exams?.[0]?.questions?.length || 0) + 1,
                    prompt: "",
                    options: { A: "", B: "", C: "", D: "" },
                    correctKey: "A",
                    explanation: "",
                  },
                ],
              };
              obj.exams = Array.isArray(obj.exams) ? obj.exams : [];
              obj.exams.push(blank);
              setValue(JSON.stringify(obj, null, 2));
            } catch {
              // ignore format issues
            }
          }}
        >
          Add blank exam
        </button>
        <button
          type='button'
          className='px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 text-sm'
          onClick={() => {
            try {
              // Remove trailing commas and fix common JSON issues
              let cleaned = value
                .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
                .replace(/(\w+):/g, '"$1":') // Add quotes to unquoted keys
                .replace(/"(\w+)":/g, '"$1":'); // Ensure keys are quoted
              const obj = JSON.parse(cleaned);
              setValue(JSON.stringify(obj, null, 2));
            } catch (e: unknown) {
              const message = e instanceof Error ? e.message : String(e);
              setResult(`JSON Error: ${message}`);
            }
          }}
        >
          Clean & Format JSON
        </button>
      </div>
      <form onSubmit={onSubmit} className='space-y-3'>
        <textarea
          className='w-full h-[80vh] border rounded p-3 font-mono text-sm'
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          type='submit'
          className='px-4 py-2 rounded bg-gray-900 text-white disabled:opacity-50'
          disabled={loading}
        >
          {loading ? "Importing..." : "Import"}
        </button>
      </form>
      {result && (
        <pre className='bg-gray-50 border rounded p-3 text-sm overflow-auto'>
          {result}
        </pre>
      )}
    </div>
  );
}
