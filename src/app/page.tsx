"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  // const { data: topics, isLoading: loading } = useTopics();

  useEffect(() => {
      router.push("/topic/investment-fundamentals");
  }, [router]);

  // if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <LoadingSpinner className='mb-4' />
          <p className='text-gray-600'>Setting up quiz...</p>
        </div>
      </div>
    );
  // }

  // return (
  //   <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
  //     <div className='text-center'>
  //       <h1 className='text-2xl font-bold text-gray-900 mb-4'>
  //         No Topics Available
  //       </h1>
  //       <p className='text-gray-600'>Please check back later.</p>
  //     </div>
  //   </div>
  // );
}
