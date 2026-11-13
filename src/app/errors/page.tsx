import React from 'react';
import Link from 'next/link';
import { NavigationHeader } from '@/components/navigation-header';
import { Footer } from '@/components/footer';
import { ShieldAlert, ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';

const errorCodes = [
  { code: '400', title: 'Bad Request', status: 'Client Error' },
  { code: '401', title: 'Unauthorized', status: 'Auth Required' },
  { code: '403', title: 'Forbidden', status: 'Access Prohibited' },
  { code: '404', title: 'Not Found', status: 'Publication Missing' },
  { code: '408', title: 'Request Timeout', status: 'Imposition Timeout' },
  { code: '429', title: 'Too Many Requests', status: 'Rate Limited' },
  { code: '500', title: 'Internal Server Error', status: 'Engine Fault' },
  { code: '501', title: 'Not Implemented', status: 'Unsupported' },
  { code: '502', title: 'Bad Gateway', status: 'Upstream Error' },
  { code: '503', title: 'Service Unavailable', status: 'Maintenance' },
  { code: '504', title: 'Gateway Timeout', status: 'Edge Timeout' },
  { code: '505', title: 'HTTP Version', status: 'Protocol Error' },
];

export default function ErrorsDirectory() {
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

      {/* Main Content */}
      <main className="flex-1 pt-24 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-700 text-xs font-mono font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Diagnostics & Status Preview</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            System Error Status Pages
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Standardized HTTP status handlers for edge publication delivery and client-side rasterization.
          </p>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {errorCodes.map((item) => (
            <Link
              key={item.code}
              href={`/errors/${item.code}`}
              className="group bg-white/85 backdrop-blur-xl border border-white/80 hover:border-blue-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg hover:-translate-y-0.5 rounded-2xl p-4 sm:p-5 transition-all flex flex-col justify-between text-left"
            >
              <div>
                <span className="text-2xl sm:text-3xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">
                  {item.code}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                  {item.title}
                </h3>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mt-0.5">
                  {item.status}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                <span>View Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </main>

      {/* Universal Whizpoint Light-Mode Footer */}
      <Footer />
    </div>
  );
}
