import React from 'react';

export default function AdminUserListSkeleton() {
  // Skeletons that closely mirror AdminUserList layout (mobile-first)
  return (
    <div className="min-h-screen text-white p-4 md:p-6">
      {/* Mobile navbar (fixed) */}
  <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-dark-900/70 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <div className="h-5 w-20 bg-dark-900 rounded" />
        <div className="flex items-center gap-2">
          <div className="h-7 w-12 bg-dark-900 rounded" />
          <div className="h-8 w-8 bg-dark-900 rounded-full" />
        </div>
      </div>
      {/* Spacer for fixed navbar on mobile */}
      <div className="md:hidden h-14" />

      <div className="animate-pulse">
        {/* Header + actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="space-y-2">
            <div className="h-7 w-40 bg-dark-900/70 rounded" />
            <div className="h-4 w-56 bg-dark-900/60 rounded" />
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="h-9 w-28 bg-dark-900/70 rounded" />
            <div className="h-9 w-28 bg-dark-900/60 rounded" />
            <div className="h-10 w-10 bg-dark-900/70 rounded-full" />
          </div>
        </div>

        {/* Stats grid: 2x2 on mobile, 4 across on md+ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 w-full place-items-center">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="sm:w-20vh w-[20vh] h-24 rounded-2xl bg-dark-900/50" />
          ))}
        </div>

        {/* Filters row */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <div className="h-10 w-full bg-dark-900/70 rounded-lg" />
            </div>
            <div className="h-10 w-32 bg-dark-900/70 rounded-lg" />
          </div>
          <div className="h-4 w-28 bg-dark-900/70 rounded self-start lg:self-auto" />
        </div>

        {/* Table skeleton */}
        <div className="rounded-2xl overflow-hidden bg-dark-900/30">
          {/* header */}
          <div className="bg-dark-900/70">
            <div className="grid grid-cols-7 gap-2 px-4 py-3 text-[11px]">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-3 bg-dark-900 rounded" />
              ))}
            </div>
          </div>
          {/* rows */}
          <div>
            {[...Array(8)].map((_, r) => (
              <div key={r} className="grid grid-cols-7 gap-2 px-4 py-3">
                {/* User ID */}
                <div className="h-4 bg-dark-900/70 rounded" />
                {/* Avatar */}
                <div className="h-8 w-8 bg-dark-900/70 rounded-full" />
                {/* Username */}
                <div className="h-4 bg-dark-900/70 rounded" />
                {/* Email */}
                <div className="h-4 bg-dark-900/70 rounded" />
                {/* Password hash */}
                <div className="h-4 bg-dark-900/70 rounded" />
                {/* Last login */}
                <div className="h-4 bg-dark-900/70 rounded" />
                {/* Actions */}
                <div className="flex items-center gap-2">
                  <div className="h-6 w-14 bg-dark-900/70 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
