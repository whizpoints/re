'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { NavigationHeader } from '@/components/navigation-header';
import { Footer } from '@/components/footer';
import { AlertTriangle, RefreshCw, ArrowLeft, BookOpen, MessageCircle, Phone } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[CLIENT RUNTIME ERROR]:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 relative flex flex-col overflow-x-hidden">
      {/* Universal Floating Glassmorphic Header */}
      <NavigationHeader showFullNav={true} />

      {/* Decorative Ambient Glassmorphic Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[8%] left-[-8%] w-[550px] h-[550px] rounded-full bg-rose-200/25 blur-[140px]" />
        <div className="absolute top-[35%] right-[-10%] w-[520px] h-[520px] rounded-full bg-amber-200/20 blur-[150px]" />
        <div className="absolute bottom-[10%] left-[15%] w-[600px] h-[600px] rounded-full bg-blue-200/20 blur-[160px]" />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 pt-24 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full relative z-10 flex flex-col justify-center">
        {/* Central Frosted Glassmorphic Card */}
        <div className="bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-3xl p-6 sm:p-10 md:p-12 text-center transition-all">
          {/* Top Status Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-mono font-bold uppercase tracking-wider mb-5 shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Runtime Exception &bull; Action Interrupted</span>
          </div>

          {/* Big Status Number */}
          <div className="relative my-2 select-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-24 bg-gradient-to-r from-rose-400/15 via-orange-400/15 to-amber-400/15 blur-2xl rounded-full" />
            </div>
            <h1 className="relative text-7xl sm:text-8xl md:text-9xl font-black bg-gradient-to-br from-rose-600 via-rose-500 to-amber-600 bg-clip-text text-transparent tracking-tight leading-none">
              500
            </h1>
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3 mb-3">
            Something Went Wrong
          </h2>

          {/* Error Description */}
          <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed max-w-lg mx-auto mb-6">
            An unexpected error occurred while processing this request. You can try refreshing the action or navigate back to the gallery.
          </p>

          {/* Error Trace Snippet */}
          {error.message && (
            <div className="mb-8 p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/70 text-left font-mono text-[11px] text-rose-800 break-all max-w-xl mx-auto">
              <span className="font-bold text-rose-900 block mb-1">Error Signature:</span>
              {error.message}
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 hover:shadow-lg transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>

            <Link
              href="/gallery"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Gallery</span>
            </Link>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Home</span>
            </Link>
          </div>

          {/* Quick Support Bar */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>Encountering persistent issues?</span>
            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/254754783683"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-bold hover:underline"
              >
                WhatsApp Support
              </a>
              <span>&bull;</span>
              <a href="mailto:support@whizpoint.app" className="hover:text-blue-600">
                support@whizpoint.app
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Universal Whizpoint Light-Mode Footer */}
      <Footer />
    </div>
  );
}
