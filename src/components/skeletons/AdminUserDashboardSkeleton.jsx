import React from 'react';

export default function AdminUserDashboardSkeleton() {
  return (
    <div className="min-h-screen text-white p-0">
      {/* Top bar */}
      <div className="shrink-0 p-4 flex items-center gap-4 backdrop-blur-sm bg-dark-900/70 border-b border-dark-700/50">
        <div className="h-7 w-20 bg-dark-900/60 rounded animate-pulse" />
        <div className="h-6 w-36 bg-dark-900/50 rounded animate-pulse ml-auto" />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-2 md:px-6 pb-10 pt-4 space-y-6">
        {/* Profile header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 animate-pulse">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-16 h-16 rounded-full bg-dark-900/70" />
            <div className="space-y-2 w-full max-w-sm">
              <div className="h-6 w-40 bg-dark-900/60 rounded" />
              <div className="h-4 w-64 bg-dark-900/50 rounded" />
            </div>
          </div>
        </div>

        {/* Main content rows */}
        <div className="flex flex-col md:flex-row w-full gap-4">
          {/* Left column */}
          <div className="w-full md:w-1/2 flex flex-row gap-4 px-0 md:px-5">
            <div className="flex flex-col gap-4 flex-1">
              {/* Projects card */}
              <div className="rounded-2xl bg-dark-900/50 p-4 shadow-lg animate-pulse">
                <div className="h-4 w-28 bg-dark-900/70 rounded" />
                <div className="h-8 w-24 bg-dark-900/60 rounded mt-3" />
                <div className="mt-3 space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 w-full bg-dark-900/50 rounded" />
                  ))}
                </div>
              </div>
              {/* Languages card with bar chart */}
              <div className="rounded-2xl bg-dark-900/50 p-4 shadow-lg animate-pulse">
                <div className="h-4 w-32 bg-dark-900/60 rounded mb-3" />
                <div className="h-28 w-full bg-dark-900/50 rounded" />
                <div className="mt-3 space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-3 w-40 bg-dark-900/50 rounded" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="w-full md:w-1/2 flex flex-col gap-4 px-0 md:px-5">
            {/* Posts overview */}
            <div className="rounded-2xl bg-dark-900/50 p-4 shadow-lg animate-pulse">
              <div className="h-4 w-36 bg-dark-900/60 rounded mb-3" />
              <div className="grid grid-cols-3 gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 bg-dark-900/50 rounded" />
                ))}
              </div>
              <div className="h-7 w-64 bg-dark-900/50 rounded mt-4" />
            </div>
            {/* Friends summary */}
            <div className="rounded-2xl bg-dark-900/50 p-4 shadow-lg animate-pulse">
              <div className="h-4 w-40 bg-dark-900/60 rounded mb-3" />
              <div className="flex items-center gap-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-dark-900/50" />
                ))}
              </div>
              <div className="h-4 w-56 bg-dark-900/50 rounded mt-3" />
            </div>
          </div>

          {/* Right-most small column for language pie */}
          <div className="w-full md:w-1/3 pr-0 md:pr-4">
            <div className="rounded-2xl bg-dark-900/50 p-4 shadow-lg animate-pulse">
              <div className="h-4 w-32 bg-dark-900/60 rounded mb-2" />
              <div className="h-40 w-full bg-dark-900/50 rounded" />
              <div className="mt-3 space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-3 w-44 bg-dark-900/50 rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
