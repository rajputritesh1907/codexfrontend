import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const NoPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full text-white overflow-hidden">
      {/* Top navigation */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Decorative orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-fuchsia-500/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/20 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-[15%] w-12 h-12 rounded-full bg-indigo-400/40 blur-md animate-bounce" />
        <div className="absolute bottom-1/4 left-[12%] w-16 h-16 rounded-full bg-fuchsia-400/40 blur-md animate-bounce" style={{ animationDelay: '200ms' }} />
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 pt-28 md:pt-32 pb-16 text-center">
        <div className="relative inline-block">
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 opacity-30 blur-3xl rounded-full" />
          <h1 className="text-[110px] md:text-[160px] leading-none font-black tracking-tight bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
            404
          </h1>
        </div>

        <h2 className="mt-4 text-2xl md:text-3xl font-semibold">Page not found</h2>
        <p className="mt-3 text-sm md:text-base text-dark-200 max-w-2xl mx-auto">
          The page you’re looking for drifted into the void. It might have been moved, renamed, or never existed.
        </p>

        {/* Action buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            className="px-5 py-2.5 rounded-lg bg-dark-700/70 hover:bg-dark-600/70 border border-white/10 text-sm"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
          <Link
            to="/"
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold"
          >
            Go to Home
          </Link>
          <Link
            to="/community"
            className="px-5 py-2.5 rounded-lg bg-fuchsia-600/90 hover:bg-fuchsia-500 text-white text-sm font-semibold"
          >
            Explore Community
          </Link>
        </div>

        {/* Helpful links */}
        <div className="mt-6 text-xs text-dark-300">
          Or jump to <Link to="/messages" className="text-indigo-300 hover:text-indigo-200 underline underline-offset-2">Messages</Link> or{' '}
          <Link to="/profile" className="text-indigo-300 hover:text-indigo-200 underline underline-offset-2">Profile</Link>.
        </div>

        {/* Card with tips */}
        <div className="mt-10 glass border border-white/10 rounded-2xl p-5 text-left">
          <div className="text-sm font-semibold text-indigo-300">Why you’re seeing this</div>
          <ul className="mt-2 text-sm text-dark-200 list-disc pl-5 space-y-1">
            <li>Double-check the URL for typos.</li>
            <li>The page might have been moved or is temporarily unavailable.</li>
            <li>Use the navigation above to find your way.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NoPage;