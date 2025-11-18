import React from 'react';

export default function EditorSkeleton(){
  return (
    <div className="min-h-screen text-white animate-pulse p-3 md:p-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 rounded-xl bg-gray-900/50 border border-white/10 p-3 space-y-3">
          <div className="h-8 bg-gray-800 rounded" />
          <div className="h-[320px] md:h-[520px] bg-gray-800 rounded" />
        </div>
        <div className="md:w-[40%] lg:w-[36%] rounded-xl bg-gray-900/50 border border-white/10 p-3">
          <div className="h-8 bg-gray-800 rounded mb-3" />
          <div className="h-[300px] md:h-[440px] bg-gray-800 rounded" />
        </div>
      </div>
    </div>
  );
}
