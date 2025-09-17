"use client";

import { MOCK_TOPICS } from "@/data/mockData";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the first topic
    if (MOCK_TOPICS.length > 0) {
      router.push(`/topic/${MOCK_TOPICS[0].id}`);
    }
  }, [router]);

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold text-gray-900 mb-2'>Loading...</h1>
        <p className='text-gray-600'>Redirecting to topics...</p>
      </div>
    </div>
  );
}
