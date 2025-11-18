import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-800" />
          <div>
            <div className="h-6 w-36 bg-gray-800 rounded mb-2" />
            <div className="h-4 w-28 bg-gray-700 rounded" />
          </div>
        </div>
  {/* <div className="h-9 w-24 bg-gray-800 rounded-2xl" /> */}
      </div>

      {/* Main cards skeleton */}
      <div className="flex flex-col md:flex-row w-full gap-6">
        <div className="w-full md:w-1/2 flex flex-col gap-6 px-0 md:px-5">
          <div className="flex flex-col md:flex-col gap-6 flex-1">
            <div className="flex-1 bg-gray-800 rounded-2xl h-44" />
            <div className="flex-1 bg-gray-800 rounded-2xl h-44" />
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col gap-6 px-0 md:px-5">
          <div className="bg-gray-800 rounded-2xl h-44" />
          <div className="bg-gray-800 rounded-2xl h-44" />
        </div>
        <div className="w-full md:w-1/3 pr-4">
          <div className="bg-gray-800 rounded-2xl h-44" />
        </div>
      </div>

      {/* Friends/extra section skeleton */}
       
    </div>
  );
}
