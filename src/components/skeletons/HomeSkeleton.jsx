import React from 'react';

export default function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-[#2d323a]/10 text-white animate-pulse">
      <div className='fixed top-0 left-0 right-0 z-50'>
        {/* Navbar is fixed separately; leave space */}
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8 mt-20">
        {/* Top Panel: User Detail skeleton */}
        <div className="bg-[#1e1f22]/50 rounded-3xl p-5 md:p-8 shadow-xl border border-white/5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gray-800" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-gray-800 rounded" />
                <div className="h-4 w-64 bg-gray-800/80 rounded" />
                <div className="h-3 w-40 bg-gray-700 rounded" />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-28 bg-gray-800 rounded" />
              <div className="h-10 w-32 bg-gray-800 rounded" />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_,i)=>(<div key={i} className="h-20 bg-gray-800 rounded-2xl" />))}
          </div>
        </div>

        {/* Project grid skeleton */}
        <div className="bg-[#1e1f22]/50 rounded-3xl p-5 md:p-8 shadow-xl border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 bg-emerald-500 rounded-full" />
            <div className="h-5 w-40 bg-gray-800 rounded" />
          </div>
          <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'>
            {[...Array(8)].map((_,i)=>(
              <div key={i} className="rounded-2xl bg-[#2a2c31] border border-white/5 p-4 space-y-3">
                <div className="h-4 w-5/6 bg-gray-800 rounded" />
                <div className="h-3 w-2/3 bg-gray-700 rounded" />
                <div className="h-24 bg-gray-800/70 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
