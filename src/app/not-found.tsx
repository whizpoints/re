'use client';

import React from 'react';
import Link from 'next/link';
import { NavigationHeader } from '@/components/navigation-header';
import { Footer } from '@/components/footer';
import {
  BookOpen,
  ArrowLeft,
  FileQuestion,
  Sparkles,
  Phone,
  MessageCircle,
  Mail,
  ExternalLink,
  Layers,
  Clock,
  Compass,
} from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 relative flex flex-col overflow-x-hidden">
      {/* Universal Floating Glassmorphic Header */}
      <NavigationHeader showFullNav={true} />

      {/* Decorative Ambient Glassmorphic Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[8%] left-[-8%] w-[550px] h-[550px] rounded-full bg-blue-200/35 blur-[140px]" />
        <div className="absolute top-[35%] right-[-10%] w-[520px] h-[520px] rounded-full bg-indigo-200/30 blur-[150px]" />
        <div className="absolute bottom-[10%] left-[15%] w-[600px] h-[600px] rounded-full bg-sky-200/25 blur-[160px]" />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 pt-24 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full relative z-10 flex flex-col justify-center">
        {/* Central Frosted Glassmorphic Card */}
        <div className="bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-3xl p-6 sm:p-10 md:p-12 text-center transition-all">
          
          {/* Top Status Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-700 text-xs font-mono font-bold uppercase tracking-wider mb-5 shadow-2xs">
            <FileQuestion className="w-4 h-4 text-blue-600" />
            <span>HTTP 404 &bull; Document or Publication Unavailable</span>
          </div>

          {/* Big Modern 404 Number with Aura */}
          <div className="relative my-2 select-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-24 bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-sky-400/20 blur-2xl rounded-full" />
            </div>
            <h1 className="relative text-7xl sm:text-8xl md:text-9xl font-black bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent tracking-tight leading-none">
              404
            </h1>
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 mb-3">
            Publication or Page Not Found
          </h2>

          {/* Context-Aware Reassuring Message */}
          <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto mb-8">
            The publication address you requested does not exist, was updated by the author, or its temporary cloud hosting lifecycle has concluded. If you scanned a QR code from a printed booklet or standee, the online preview may have ended.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <Link
              href="/gallery"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 hover:shadow-lg transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Public Gallery</span>
            </Link>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Homepage</span>
            </Link>
          </div>

          {/* Context Diagnostics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-left mt-10 pt-8 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Printed QR Code Scan?</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Free eulogy and event publications have standard cloud hosting windows. When expired, access transitions to archival status.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <Compass className="w-3.5 h-3.5 text-indigo-600" />
                <span>Typo in the URL?</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Check the spelling of the publication slug in your browser address bar or browse through our public document directory.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>Publish Your Own?</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Transform any PDF into an interactive A3 booklet or A4 flipbook with high-res vector QR codes in seconds.
              </p>
            </div>
          </div>

          {/* Author Re-Hosting & Restoration Card */}
          <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-sky-50/70 border border-blue-200/70 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                    Are You the Author or Event Organizer?
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                  Need to re-activate this publication, restore an expired QR code, or secure permanent cloud hosting with custom domains? Whizpoint Operations can restore your document immediately.
                </p>
              </div>

              {/* Action Contact Chips */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <a
                  href="https://wa.me/254754783683?text=Hi%20Whizpoint%2C%20I%20need%20assistance%20restoring%20an%20expired%20or%20missing%20flipbook%20link."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp: +254 754 783 683</span>
                </a>

                <a
                  href="tel:+254718311345"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs transition-all"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Call Support</span>
                </a>

                <a
                  href="mailto:support@whizpoint.app?subject=Flipbook%20Restoration%20Inquiry"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs transition-all"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-600" />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Universal Whizpoint Light-Mode Footer */}
      <Footer />
    </div>
  );
}
