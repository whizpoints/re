import React from 'react';
import Link from 'next/link';
import { NavigationHeader } from '@/components/navigation-header';
import prisma from '@/lib/db';
import {
  BookOpen,
  ArrowRight,
  Eye,
  Calendar,
  Sparkles,
  QrCode,
  Layers,
  FileText,
  Search,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
  const documents = await prisma.document.findMany({
    where: { visibility: 'Public' },
    select: {
      id: true,
      title: true,
      slug: true,
      page_count: true,
      created_at: true,
      pages: true,
      views: true,
    },
    orderBy: { created_at: 'desc' },
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 relative flex flex-col overflow-x-hidden">
      {/* Universal Floating Glassmorphic Header */}
      <NavigationHeader showFullNav={true} />

      {/* Decorative Ambient Glassmorphic Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[5%] left-[-5%] w-[550px] h-[550px] rounded-full bg-blue-200/35 blur-[130px]" />
        <div className="absolute top-[35%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-200/30 blur-[140px]" />
        <div className="absolute bottom-[5%] left-[10%] w-[600px] h-[600px] rounded-full bg-sky-200/25 blur-[150px]" />
      </div>

      {/* Main Gallery Content */}
      <main className="flex-1 pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-700 text-xs font-mono font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Public Imposition Showcase</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Explore Digital Publications
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-slate-600 mt-2.5 leading-relaxed max-w-2xl mx-auto">
            Discover magazines, catalogs, A3 booklet spreads, and corporate documents rendered in 3200px retina clarity with dynamic page curl navigation.
          </p>

          <div className="mt-5 flex items-center justify-center gap-3">
            <Link
              href="/admin/upload?type=a3"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Publish Your Flipbook</span>
            </Link>
            <Link
              href="/#formats"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/80 hover:bg-white text-slate-700 font-bold text-xs border border-slate-200 transition-all shadow-2xs"
            >
              <span>Learn About Formats</span>
            </Link>
          </div>
        </div>

        {/* Compact, Sleek Glassmorphic Document Grid */}
        {documents.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
            {documents.map((doc) => {
              const coverUrl = doc.pages?.[0];
              const formattedDate = new Date(doc.created_at).toLocaleDateString();

              return (
                <div
                  key={doc.id}
                  className="group bg-white/85 backdrop-blur-xl border border-white/80 hover:border-blue-300 shadow-[0_8px_25px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 transition-all duration-300 flex flex-col justify-between"
                >
                  <Link href={`/${doc.slug}`} className="block">
                    {/* Compact Book Cover */}
                    <div className="aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 relative group-hover:shadow-md transition-all">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={doc.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 p-2">
                          <BookOpen className="w-8 h-8 mb-1" />
                          <span className="text-[10px] font-mono">{doc.page_count} Pages</span>
                        </div>
                      )}

                      {/* Floating Page Count Pill */}
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/70 backdrop-blur-md text-[9px] font-mono font-bold text-white shadow-xs">
                        {doc.page_count}p
                      </span>

                      {/* Views Badge */}
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-[9px] font-mono font-bold text-slate-800 border border-white/60 shadow-xs flex items-center gap-1">
                        <Eye className="w-2.5 h-2.5 text-blue-600" />
                        <span>{doc.views || 0}</span>
                      </span>
                    </div>

                    {/* Metadata & Title */}
                    <div className="pt-2 px-1">
                      <h3
                        className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors leading-tight"
                        title={doc.title}
                      >
                        {doc.title}
                      </h3>
                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mt-1">
                        <span>/{doc.slug}</span>
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  </Link>

                  {/* Read Flipbook Button */}
                  <Link
                    href={`/${doc.slug}`}
                    className="mt-2.5 w-full py-1.5 px-2 rounded-xl bg-slate-100/90 group-hover:bg-blue-600 text-slate-700 group-hover:text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <span>Read Flipbook</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/70 backdrop-blur-xl rounded-3xl border border-slate-200/80 p-8 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Public Flipbooks Yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
              Be the first to publish an interactive digital publication with automated A3/A4 imposition.
            </p>
            <Link
              href="/admin/upload?type=a3"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              <span>Upload Your Document</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

      </main>

      {/* Modern Light-Mode Footer with Official Contacts */}
      <footer className="border-t border-slate-200/80 bg-white/90 backdrop-blur-md relative z-10 pt-10 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-100">
            {/* Col 1 */}
            <div className="md:col-span-2 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <img
                  src="https://www.whizpoint.app/_next/image?url=%2Ficon.png&w=1920&q=75"
                  alt="Whizpoint"
                  className="h-7 w-auto object-contain"
                />
                <div className="flex flex-col">
                  <span className="font-extrabold text-slate-900 leading-none">Whizpoint Flipbook</span>
                  <span className="text-[10px] text-blue-600 font-semibold tracking-wider uppercase mt-0.5">
                    Studio &bull; e.whizpoint.app
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Industrial-grade client-side WebAssembly rasterization for A3 booklet spreads and single-page A4 publications with vector QR codes and Cloudflare R2 multi-region edge delivery.
              </p>
              <div className="text-xs text-slate-600 pt-1 space-y-1">
                <div>
                  Phone / WhatsApp:{' '}
                  <a href="https://wa.me/254754783683" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">
                    +254 754 783 683
                  </a>{' '}
                  <span className="text-slate-400">&bull;</span>{' '}
                  <a href="tel:+254718311345" className="text-slate-700 hover:text-blue-600">
                    +254 718 311 345
                  </a>
                </div>
                <div>
                  Email:{' '}
                  <a href="mailto:info@whizpoint.app" className="text-blue-600 hover:underline">info@whizpoint.app</a>
                  {' '}&bull;{' '}
                  <a href="mailto:admin@whizpoint.app" className="text-blue-600 hover:underline">admin@whizpoint.app</a>
                </div>
                <div>
                  Inquiries:{' '}
                  <a href="https://www.whizpoint.app/contact" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Whizpoint Contact Portal
                  </a>
                  {' '}&bull; Nairobi, Kenya
                </div>
              </div>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">Platform</h4>
              <ul className="space-y-1.5 text-xs text-slate-500">
                <li><Link href="/gallery" className="text-blue-600 font-semibold">Public Gallery</Link></li>
                <li><Link href="/#formats" className="hover:text-blue-600 transition-colors">A3 Booklet & A4</Link></li>
                <li><Link href="/#features" className="hover:text-blue-600 transition-colors">Features</Link></li>
                <li><Link href="/#faq" className="hover:text-blue-600 transition-colors">FAQ</Link></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">Legal & Compliance</h4>
              <ul className="space-y-1.5 text-xs text-slate-500">
                <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy (KDPA 2019)</Link></li>
                <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
                <li><a href="mailto:legal@whizpoint.app" className="hover:text-blue-600 transition-colors">DMCA Notice</a></li>
                <li><Link href="/auth/login" className="hover:text-blue-600 transition-colors">Publisher Sign In</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <p>&copy; {new Date().getFullYear()} Whizpoint Solutions. All rights reserved.</p>
            <p className="font-mono">Registered under Kenya Commercial Law &bull; KDPA 2019 Compliant</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
