import React from 'react';

export default function AdminProjectSkeleton(){
  return (
    <div className="min-h-screen text-white animate-pulse p-4 md:p-6">
      <div className="h-6 w-24 bg-gray-800 rounded mb-4" />
      <div className="rounded-2xl bg-dark-800/60 border border-dark-600 overflow-hidden">
        <div className="h-8 bg-gray-900 border-b border-dark-600" />
        <div className="h-80 bg-gray-800" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        {[...Array(4)].map((_,i)=>(<div key={i} className="h-40 bg-gray-900/50 border border-white/10 rounded-xl" />))}
      </div>
    </div>
  );
}
