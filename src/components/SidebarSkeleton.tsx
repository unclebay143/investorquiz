"use client";

export default function SidebarSkeleton() {
  return (
    <aside className='lg:w-80 bg-white border-r border-gray-200 flex flex-col pt-[73px] lg:pt-0 fixed inset-y-0 left-0 z-30 lg:sticky lg:top-[73px] lg:h-[calc(100vh-73px)] transition-transform duration-300 ease-out lg:translate-x-0 translate-x-0'>
      {/* Header section */}
      <div className='p-4 border-b border-gray-200'>
        <div className='h-4 bg-gray-200 rounded w-16 mb-3 animate-pulse'></div>
        <div className='relative'>
          <div className='h-10 bg-gray-200 rounded-lg w-full animate-pulse'></div>
        </div>
      </div>

      {/* Navigation section */}
      <nav className='flex-1 overflow-y-auto p-4 space-y-1'>
        {/* Topic items skeleton */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className='w-full rounded-lg px-3 py-3 animate-pulse'>
            <div className='flex items-center justify-between'>
              <div className='h-4 bg-gray-200 rounded w-3/4'></div>
              <div className='flex gap-1'>
                {i === 1 && (
                  <div className='h-5 bg-gray-200 rounded-full w-12'></div>
                )}
              </div>
            </div>
            <div className='h-3 bg-gray-200 rounded w-full mt-1'></div>
            <div className='h-3 bg-gray-200 rounded w-2/3 mt-1'></div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
