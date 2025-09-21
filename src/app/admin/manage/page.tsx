"use client";

import { useState } from "react";

type Tab = "authors" | "topics" | "exams";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className='border rounded p-4 space-y-3'>
      <h2 className='font-semibold'>{title}</h2>
      {children}
    </section>
  );
}

export default function AdminManagePage() {
  const [activeTab, setActiveTab] = useState<Tab>("authors");
  // Author form state
  const [author, setAuthor] = useState({
    slug: "",
    name: "",
    title: "",
    bio: "",
    profileImage: "",
    twitter: "",
    linkedin: "",
    website: "",
  });
  const [topic, setTopic] = useState({
    slug: "",
    title: "",
    description: "",
    isNewTopic: false,
  });
  const [exam, setExam] = useState({
    slug: "",
    topic: "",
    author: "",
    title: "",
    description: "",
    totalPoints: 10,
    reviewMode: "post" as "post" | "immediate",
  });
  const [question, setQuestion] = useState({
    id: 1,
    prompt: "",
    A: "",
    B: "",
    C: "",
    D: "",
    correctKey: "A" as "A" | "B" | "C" | "D",
    explanation: "",
  });
  const [examQuestions, setExamQuestions] = useState<any[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async (path: string, payload: any) => {
    setMsg(null);
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) setMsg(JSON.stringify(json, null, 2));
    else setMsg("Saved ✅");
  };

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-6'>
      <h1 className='text-2xl font-semibold'>Admin: Manage Content</h1>

      {/* Tab Navigation */}
      <div className='flex border-b'>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "authors"
              ? "border-b-2 border-gray-900 text-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("authors")}
        >
          Authors
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "topics"
              ? "border-b-2 border-gray-900 text-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("topics")}
        >
          Topics
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "exams"
              ? "border-b-2 border-gray-900 text-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("exams")}
        >
          Exams
        </button>
      </div>

      {msg && (
        <pre className='bg-gray-50 border rounded p-3 text-sm'>{msg}</pre>
      )}

      {activeTab === "authors" && (
        <Section title='Create Author'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Slug *
              </label>
              <input
                className='w-full border rounded px-2 py-1'
                placeholder='author-slug'
                value={author.slug}
                onChange={(e) => setAuthor({ ...author, slug: e.target.value })}
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Name *
              </label>
              <input
                className='w-full border rounded px-2 py-1'
                placeholder='Author Name'
                value={author.name}
                onChange={(e) => setAuthor({ ...author, name: e.target.value })}
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Title
              </label>
              <input
                className='w-full border rounded px-2 py-1'
                placeholder='e.g. Investment Expert'
                value={author.title}
                onChange={(e) =>
                  setAuthor({ ...author, title: e.target.value })
                }
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Profile Image URL
              </label>
              <input
                className='w-full border rounded px-2 py-1'
                placeholder='https://example.com/image.jpg'
                value={author.profileImage}
                onChange={(e) =>
                  setAuthor({ ...author, profileImage: e.target.value })
                }
              />
            </div>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Bio
              </label>
              <textarea
                className='w-full border rounded px-2 py-1'
                placeholder='Author biography...'
                rows={3}
                value={author.bio}
                onChange={(e) => setAuthor({ ...author, bio: e.target.value })}
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Twitter URL
              </label>
              <input
                className='w-full border rounded px-2 py-1'
                placeholder='https://twitter.com/username'
                value={author.twitter}
                onChange={(e) =>
                  setAuthor({ ...author, twitter: e.target.value })
                }
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                LinkedIn URL
              </label>
              <input
                className='w-full border rounded px-2 py-1'
                placeholder='https://linkedin.com/in/username'
                value={author.linkedin}
                onChange={(e) =>
                  setAuthor({ ...author, linkedin: e.target.value })
                }
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Website URL
              </label>
              <input
                className='w-full border rounded px-2 py-1'
                placeholder='https://example.com'
                value={author.website}
                onChange={(e) =>
                  setAuthor({ ...author, website: e.target.value })
                }
              />
            </div>
          </div>
          <button
            className='px-3 py-2 rounded bg-gray-900 text-white'
            onClick={() =>
              submit("/api/admin/authors", {
                slug: author.slug,
                name: author.name,
                title: author.title || undefined,
                bio: author.bio || undefined,
                profileImage: author.profileImage || undefined,
                socialLinks: {
                  twitter: author.twitter || undefined,
                  linkedin: author.linkedin || undefined,
                  website: author.website || undefined,
                },
              })
            }
          >
            Save Author
          </button>
        </Section>
      )}

      {activeTab === "topics" && (
        <Section title='Create Topic'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Slug *
              </label>
              <input
                className='w-full border rounded px-2 py-1'
                placeholder='topic-slug'
                value={topic.slug}
                onChange={(e) => setTopic({ ...topic, slug: e.target.value })}
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Title *
              </label>
              <input
                className='w-full border rounded px-2 py-1'
                placeholder='Topic Title'
                value={topic.title}
                onChange={(e) => setTopic({ ...topic, title: e.target.value })}
              />
            </div>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Description
              </label>
              <textarea
                className='w-full border rounded px-2 py-1'
                placeholder='Topic description...'
                rows={3}
                value={topic.description}
                onChange={(e) =>
                  setTopic({ ...topic, description: e.target.value })
                }
              />
            </div>
            <div>
              <label className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={topic.isNewTopic}
                  onChange={(e) =>
                    setTopic({ ...topic, isNewTopic: e.target.checked })
                  }
                />
                <span className='text-sm font-medium text-gray-700'>
                  Mark as New
                </span>
              </label>
            </div>
          </div>
          <button
            className='px-3 py-2 rounded bg-gray-900 text-white'
            onClick={() =>
              submit("/api/admin/topics", {
                slug: topic.slug,
                title: topic.title,
                description: topic.description || undefined,
                isNewTopic: topic.isNewTopic,
              })
            }
          >
            Save Topic
          </button>
        </Section>
      )}

      {activeTab === "exams" && (
        <Section title='Create Exam'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Slug *
              </label>
              <input
                className='w-full border rounded px-2 py-1'
                placeholder='exam-slug'
                value={exam.slug}
                onChange={(e) => setExam({ ...exam, slug: e.target.value })}
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Topic Slug *
              </label>
              <input
                className='w-full border rounded px-2 py-1'
                placeholder='topic-slug'
                value={exam.topic}
                onChange={(e) => setExam({ ...exam, topic: e.target.value })}
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Author Slug *
              </label>
              <input
                className='w-full border rounded px-2 py-1'
                placeholder='author-slug'
                value={exam.author}
                onChange={(e) => setExam({ ...exam, author: e.target.value })}
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Title *
              </label>
              <input
                className='w-full border rounded px-2 py-1'
                placeholder='Exam Title'
                value={exam.title}
                onChange={(e) => setExam({ ...exam, title: e.target.value })}
              />
            </div>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Description
              </label>
              <textarea
                className='w-full border rounded px-2 py-1'
                placeholder='Exam description...'
                rows={3}
                value={exam.description}
                onChange={(e) =>
                  setExam({ ...exam, description: e.target.value })
                }
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Total Points *
              </label>
              <input
                className='w-full border rounded px-2 py-1'
                placeholder='10'
                type='number'
                value={exam.totalPoints}
                onChange={(e) =>
                  setExam({ ...exam, totalPoints: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Review Mode *
              </label>
              <select
                className='w-full border rounded px-2 py-1'
                value={exam.reviewMode}
                onChange={(e) =>
                  setExam({ ...exam, reviewMode: e.target.value as any })
                }
              >
                <option value='post'>Post Exam</option>
                <option value='immediate'>Immediate</option>
              </select>
            </div>
          </div>

          <div className='border rounded p-4 space-y-4 mt-4'>
            <h3 className='font-medium text-gray-900'>Add Question</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Question Prompt *
                </label>
                <textarea
                  className='w-full border rounded px-2 py-1'
                  placeholder='What is the question?'
                  rows={2}
                  value={question.prompt}
                  onChange={(e) =>
                    setQuestion({ ...question, prompt: e.target.value })
                  }
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Correct Answer *
                </label>
                <select
                  className='w-full border rounded px-2 py-1'
                  value={question.correctKey}
                  onChange={(e) =>
                    setQuestion({
                      ...question,
                      correctKey: e.target.value as any,
                    })
                  }
                >
                  <option value='A'>A</option>
                  <option value='B'>B</option>
                  <option value='C'>C</option>
                  <option value='D'>D</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Option A *
                </label>
                <input
                  className='w-full border rounded px-2 py-1'
                  placeholder='First option'
                  value={question.A}
                  onChange={(e) =>
                    setQuestion({ ...question, A: e.target.value })
                  }
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Option B *
                </label>
                <input
                  className='w-full border rounded px-2 py-1'
                  placeholder='Second option'
                  value={question.B}
                  onChange={(e) =>
                    setQuestion({ ...question, B: e.target.value })
                  }
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Option C *
                </label>
                <input
                  className='w-full border rounded px-2 py-1'
                  placeholder='Third option'
                  value={question.C}
                  onChange={(e) =>
                    setQuestion({ ...question, C: e.target.value })
                  }
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Option D *
                </label>
                <input
                  className='w-full border rounded px-2 py-1'
                  placeholder='Fourth option'
                  value={question.D}
                  onChange={(e) =>
                    setQuestion({ ...question, D: e.target.value })
                  }
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Explanation
                </label>
                <textarea
                  className='w-full border rounded px-2 py-1'
                  placeholder='Why is this the correct answer?'
                  rows={2}
                  value={question.explanation}
                  onChange={(e) =>
                    setQuestion({ ...question, explanation: e.target.value })
                  }
                />
              </div>
            </div>
            <button
              className='px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={
                !question.prompt.trim() ||
                !question.A.trim() ||
                !question.B.trim() ||
                !question.C.trim() ||
                !question.D.trim()
              }
              onClick={() => {
                setExamQuestions([
                  ...examQuestions,
                  {
                    id: examQuestions.length + 1,
                    prompt: question.prompt,
                    options: {
                      A: question.A,
                      B: question.B,
                      C: question.C,
                      D: question.D,
                    },
                    correctKey: question.correctKey,
                    explanation: question.explanation || undefined,
                  },
                ]);
                setQuestion({
                  id: examQuestions.length + 2,
                  prompt: "",
                  A: "",
                  B: "",
                  C: "",
                  D: "",
                  correctKey: "A",
                  explanation: "",
                });
              }}
            >
              Add question
            </button>

            {examQuestions.length > 0 && (
              <div className='mt-4 space-y-3'>
                <h4 className='font-medium text-gray-900'>
                  Added Questions ({examQuestions.length})
                </h4>
                {examQuestions.map((q, index) => (
                  <div key={index} className='border rounded p-3 bg-gray-50'>
                    <div className='flex justify-between items-start mb-2'>
                      <span className='text-sm font-medium text-gray-700'>
                        Question {q.id}
                      </span>
                      <button
                        className='text-red-600 hover:text-red-800 text-sm'
                        onClick={() => {
                          setExamQuestions(
                            examQuestions.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    <p className='text-sm text-gray-900 mb-2'>{q.prompt}</p>
                    <div className='grid grid-cols-2 gap-2 text-xs'>
                      <div
                        className={`p-2 rounded ${
                          q.correctKey === "A"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100"
                        }`}
                      >
                        A: {q.options.A}
                      </div>
                      <div
                        className={`p-2 rounded ${
                          q.correctKey === "B"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100"
                        }`}
                      >
                        B: {q.options.B}
                      </div>
                      <div
                        className={`p-2 rounded ${
                          q.correctKey === "C"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100"
                        }`}
                      >
                        C: {q.options.C}
                      </div>
                      <div
                        className={`p-2 rounded ${
                          q.correctKey === "D"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100"
                        }`}
                      >
                        D: {q.options.D}
                      </div>
                    </div>
                    {q.explanation && (
                      <p className='text-xs text-gray-600 mt-2 italic'>
                        {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            className='mt-3 px-3 py-2 rounded bg-gray-900 text-white'
            onClick={() =>
              submit("/api/admin/exams", { ...exam, questions: examQuestions })
            }
          >
            Save Exam
          </button>
        </Section>
      )}
    </div>
  );
}
