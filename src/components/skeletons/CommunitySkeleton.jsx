import React from 'react';

export default function CommunitySkeleton(){
  return (
    <div className="min-h-screen text-white animate-pulse">
      <div className="fixed top-0 left-0 w-full z-50" />
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-6 mt-16">
        <div className="h-8 w-64 bg-gray-800 rounded mb-6" />
        {/* Posts */}
        <div className="space-y-4">
          {[...Array(5)].map((_,i)=> (
            <div key={i} className="glass rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-800" />
                <div className="h-4 w-40 bg-gray-800 rounded" />
              </div>
              <div className="h-3 w-11/12 bg-gray-800/80 rounded mb-2" />
              <div className="h-3 w-9/12 bg-gray-800/60 rounded mb-3" />
              <div className="h-40 bg-gray-900/40 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
