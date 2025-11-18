import React from 'react';
export default function MessagesSkeleton({ variant = 'full' }) {
  if (variant === 'list') {
    return (
      <div className="min-h-screen text-white animate-pulse">
        <div className="fixed top-0 left-0 right-0 z-50" />
        <div className="mt-16 max-w-lg mx-auto p-4">
          {/* Search bar */}
          <div className="h-10 bg-gray-800 rounded mb-3" />
          {/* Contacts */}
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-900/50 border border-white/5">
                <div className="w-12 h-12 rounded-full bg-gray-700" />
                <div className="flex-1">
                  <div className="h-3 w-36 bg-gray-700 rounded mb-2" />
                  <div className="h-2 w-24 bg-gray-700/80 rounded" />
                </div>
                <div className="h-2 w-8 bg-gray-700/70 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'chat') {
    return (
      <div className="min-h-screen text-white animate-pulse">
        <div className="fixed top-0 left-0 right-0 z-50" />
        <div className="mt-16 p-0">
          {/* Chat header */}
          <div className="h-12 bg-gray-900/60 border-b border-white/10" />
          {/* Messages */}
          <div className="p-4 space-y-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[80%] p-3 rounded-2xl bg-gray-800">
                  <div className="h-3 w-40 bg-gray-700 rounded mb-2" />
                  <div className="h-3 w-24 bg-gray-700/80 rounded" />
                </div>
              </div>
            ))}
          </div>
          {/* Composer */}
          <div className="h-16 bg-gray-900/60 border-t border-white/10" />
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen text-white animate-pulse">
      <div className="fixed top-0 left-0 right-0 z-50" />
      <div className="mt-20 max-w-6xl mx-auto p-4">
        <div className="flex gap-4">
          {/* Sidebar list */}
          <div className="hidden md:block w-80 space-y-3">
            <div className="h-10 bg-gray-800 rounded" />
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded bg-gray-800">
                <div className="w-10 h-10 rounded-full bg-gray-700" />
                <div className="flex-1">
                  <div className="h-3 w-32 bg-gray-700 rounded mb-2" />
                  <div className="h-2 w-24 bg-gray-700/80 rounded" />
                </div>
              </div>
            ))}
          </div>
          {/* Chat area */}
          <div className="flex-1 rounded-2xl bg-gray-900/50 border border-white/5">
            <div className="h-12 border-b border-white/10 bg-gray-800/50 rounded-t-2xl" />
            <div className="p-4 space-y-3">
              {[...Array(7)].map((_, i) => (
                <div key={i} className={`flex ${i % 2 ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-sm p-3 rounded-lg bg-gray-800">
                    <div className="h-3 w-40 bg-gray-700 rounded mb-2" />
                    <div className="h-3 w-24 bg-gray-700/80 rounded" />
                  </div>
                </div>
              ))}
            </div>
            <div className="h-14 border-t border-white/10 bg-gray-800/50 rounded-b-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
