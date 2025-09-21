"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const go = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        const res = await fetch("/api/topics", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (res.ok) {
          const topics = await res.json();
          if (Array.isArray(topics) && topics.length > 0) {
            router.push(`/topic/${topics[0].slug}`);
            return;
          }
        }
        // No topics yet: stay here (could render a CTA instead)
        setLoading(false);
      } catch {
        // Network error/timeout: stay here
        setLoading(false);
      } finally {
        clearTimeout(timeout);
      }
    };
    go();
  }, [router]);

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <LoadingSpinner className='mb-4' />
          <p className='text-gray-600'>Looking for topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold text-gray-900 mb-4'>
          No Topics Available
        </h1>
        <p className='text-gray-600'>Please check back later.</p>
      </div>
    </div>
  );
}
