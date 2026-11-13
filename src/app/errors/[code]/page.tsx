import React from 'react';
import Link from 'next/link';
import { NavigationHeader } from '@/components/navigation-header';
import { Footer } from '@/components/footer';
import { ArrowLeft, BookOpen, AlertCircle, ShieldAlert, Sparkles, MessageCircle, Phone, Mail } from 'lucide-react';

const errorMessages: Record<string, { title: string; desc: string; badge: string; accent: string }> = {
  '400': {
    title: 'Bad Request',
    desc: 'The server could not understand your request due to malformed syntax or invalid parameters.',
    badge: 'Client Protocol Error',
    accent: 'text-amber-600',
  },
  '401': {
    title: 'Authentication Required',
    desc: 'You must be authenticated with valid publisher credentials to access this protected studio workspace.',
    badge: 'Session Required',
    accent: 'text-rose-600',
  },
  '403': {
    title: 'Access Prohibited',
    desc: "You don't have the required administrative clearance to access this publication resource.",
    badge: 'Access Denied',
    accent: 'text-rose-600',
  },
  '404': {
    title: 'Publication Not Found',
    desc: 'The requested interactive flipbook, page, or publication address could not be located on the edge network.',
    badge: 'Resource Missing',
    accent: 'text-blue-600',
  },
  '408': {
    title: 'Request Timed Out',
    desc: 'The client-side imposition or server connection timed out while processing your document spread.',
    badge: 'Timeout Exceeded',
    accent: 'text-orange-600',
  },
  '429': {
    title: 'Rate Limit Reached',
    desc: 'Too many requests were dispatched to our rasterization engine. Please pause momentarily before retrying.',
    badge: 'Rate Limit Throttled',
    accent: 'text-yellow-600',
  },
  '500': {
    title: 'Internal Engine Error',
    desc: 'An unexpected processing anomaly occurred within the publishing engine. Our engineering team has been notified.',
    badge: 'Engine Fault',
    accent: 'text-red-600',
  },
  '501': {
    title: 'Action Not Implemented',
    desc: 'The requested publication operation is not yet supported by the active edge runtime.',
    badge: 'Feature Pending',
    accent: 'text-fuchsia-600',
  },
  '502': {
    title: 'Bad Gateway upstream',
    desc: 'The edge delivery proxy received an invalid upstream response from the multi-region storage cluster.',
    badge: 'Upstream Error',
    accent: 'text-purple-600',
  },
  '503': {
    title: 'Service Maintenance',
    desc: 'The publishing studio is temporarily undergoing automated database optimization or maintenance.',
    badge: 'Service Standby',
    accent: 'text-blue-600',
  },
  '504': {
    title: 'Gateway Timeout',
    desc: 'The Cloudflare edge tunnel or multi-region worker did not respond within the allocated execution window.',
    badge: 'Gateway Timeout',
    accent: 'text-indigo-600',
  },
  '505': {
    title: 'HTTP Version Unsupported',
    desc: 'The publishing gateway requires HTTP/2 or HTTP/3 transport encryption.',
    badge: 'Protocol Incompatible',
    accent: 'text-slate-600',
  },
};

export default async function ErrorSimulationPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const errorData = errorMessages[code] || {
    title: 'System Exception',
    desc: 'An unexpected operational code was reported by the publication engine.',
    badge: 'System Notice',
    accent: 'text-slate-600',
  };

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
      <main className="flex-1 pt-24 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full relative z-10 flex flex-col justify-center">
        {/* Central Frosted Glassmorphic Card */}
        <div className="bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-3xl p-6 sm:p-10 md:p-12 text-center transition-all">
          {/* Top Status Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold uppercase tracking-wider mb-5 shadow-2xs">
            <AlertCircle className="w-4 h-4 text-slate-600" />
            <span>HTTP {code} &bull; {errorData.badge}</span>
          </div>

          {/* Big Error Code Number */}
          <div className="relative my-2 select-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-24 bg-gradient-to-r from-blue-400/15 via-indigo-400/15 to-sky-400/15 blur-2xl rounded-full" />
            </div>
            <h1 className={`relative text-7xl sm:text-8xl md:text-9xl font-black ${errorData.accent} tracking-tight leading-none`}>
              {code}
            </h1>
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3 mb-3">
            {errorData.title}
          </h2>

          {/* Error Description */}
          <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed max-w-lg mx-auto mb-8">
            {errorData.desc}
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <Link
              href="/gallery"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 hover:shadow-lg transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Gallery</span>
            </Link>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Homepage</span>
            </Link>
          </div>

          {/* Support Bar */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <Link href="/errors" className="hover:text-blue-600 font-medium">
              &larr; View all HTTP diagnostics
            </Link>
            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/254754783683"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-bold hover:underline"
              >
                WhatsApp: +254 754 783 683
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
