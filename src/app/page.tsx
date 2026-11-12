'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { NavigationHeader } from '@/components/navigation-header';
import {
  BookOpen,
  FileText,
  QrCode,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Layers,
  Smartphone,
  Share2,
  Zap,
  Eye,
  RefreshCw,
  Sliders,
  Printer
} from 'lucide-react';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFormatTab, setActiveFormatTab] = useState<'a3' | 'a4'>('a3');
  const [previewPage, setPreviewPage] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const faqs = [
    {
      q: 'How does A3 Booklet Spreads splitting work?',
      a: 'When you upload an A3 landscape booklet PDF (typically 2 pages per sheet arranged in printer imposition), our client-side engine automatically renders the sheet at 3200px resolution, divides it down the center into left and right A4 pages, and re-orders the pages into proper sequential reading sequence (Page 1, 2, 3... N). You no longer need manual imposition software!'
    },
    {
      q: 'Can I upload standard single-page A4 documents directly?',
      a: 'Yes! We have a dedicated Standard A4 mode. When you upload a normal multi-page A4 PDF (such as a company profile, resume, proposal, or single-page flyer), it extracts each page directly 1:1 without splitting or altering your layout.'
    },
    {
      q: 'What happens when I update a document using the Update button?',
      a: 'When you click "Update", your replacement PDF is automatically analyzed. If it is an A3 booklet spread, it splits and sequences into the full set of A4 pages; if it is an A4 document, it extracts 1:1. The existing public link and your printed QR codes stay 100% active and instantly display the updated content.'
    },
    {
      q: 'Do I need to install any heavy software or C++ build tools?',
      a: 'None at all. All PDF processing happens natively right inside your modern web browser using ultra-fast WebAssembly. There are zero bulky dependencies or server delays.'
    },
    {
      q: 'How do the dynamic QR codes and auto-expiry work?',
      a: 'Every document automatically generates a high-definition vector QR code with your custom logo placed at its center. You can also configure automated expiration (5 days, 1 month, 1 year, or a custom calendar date) so sensitive or temporary event publications expire automatically.'
    },
    {
      q: 'Can readers view documents on smartphones and tablets?',
      a: 'Absolutely. The reader is engineered with an adaptive, touch-friendly vertical flow and smooth thumbnail navigation that loads in under 300 milliseconds on any mobile or desktop device.'
    }
  ];

  return (
    <div className="min-h-screen font-sans bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden relative">
      {/* Background Ambient Glows (Light Mode Glassmorphism) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-200/40 blur-[130px]" />
        <div className="absolute top-[25%] right-[-10%] w-[550px] h-[550px] rounded-full bg-indigo-200/35 blur-[140px]" />
        <div className="absolute top-[60%] left-[10%] w-[500px] h-[500px] rounded-full bg-sky-200/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[15%] w-[650px] h-[650px] rounded-full bg-blue-100/40 blur-[150px]" />
      </div>

      {/* Universal Glassmorphic Header */}
      <NavigationHeader showFullNav={true} />

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 px-6 z-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Left Column: Hero Copy */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md bg-white/80 border border-blue-200 text-blue-700 text-xs sm:text-sm font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Dual Mode: A3 Booklet Imposition & Standard A4 Direct
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]">
              Turn Print PDFs Into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600">
                Living Interactive Flipbooks
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Whether you have <strong>A3 booklet spreads</strong> that need automated cutting and reordering, or <strong>standard A4 documents</strong> that must display 1:1 with zero cropping, Whizpoint renders them in crisp 3200px retina clarity with dynamic QR codes and instant sharing.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link 
                href="/admin/upload?type=a3" 
                className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-all shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 group"
              >
                <BookOpen className="w-4 h-4" />
                <span>Upload A3 Booklet</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href="/admin/upload?type=a4" 
                className="w-full sm:w-auto px-7 py-3.5 backdrop-blur-md bg-white/80 hover:bg-white text-slate-800 font-semibold rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Upload A4 Document</span>
              </Link>

              <Link 
                href="/gallery" 
                className="w-full sm:w-auto px-5 py-3.5 text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors"
              >
                Explore Gallery
              </Link>
            </div>

            {/* Key Assurance Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs sm:text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Auto-splits 4 A3 sheets into 8 A4 pages</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Direct 1:1 A4 with zero splitting</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Free instant QR code generator</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Glassmorphic Flipbook Preview */}
          <div className="flex-1 w-full max-w-xl">
            <div className="backdrop-blur-2xl bg-white/75 border border-white/90 rounded-3xl p-6 shadow-[0_20px_50px_rgba(30,58,138,0.08)] relative">
              
              {/* Interactive Format Toggle Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl">
                  <button
                    onClick={() => { setActiveFormatTab('a3'); setPreviewPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeFormatTab === 'a3' 
                        ? 'bg-white text-blue-700 shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>A3 Booklet (Spreads)</span>
                  </button>
                  <button
                    onClick={() => { setActiveFormatTab('a4'); setPreviewPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeFormatTab === 'a4' 
                        ? 'bg-white text-blue-700 shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Standard A4 (1:1)</span>
                  </button>
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  {activeFormatTab === 'a3' ? 'Auto-Imposed • 8 Pages' : 'Direct • 1:1 Flow'}
                </span>
              </div>

              {/* Simulated Flipbook Reader Window */}
              <div className="relative aspect-[4/3] rounded-2xl bg-slate-900 overflow-hidden shadow-inner flex flex-col justify-between p-4 group">
                {/* Reader Top Bar */}
                <div className="flex items-center justify-between text-slate-300 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                    <span className="ml-2 font-mono text-[11px] text-slate-400">
                      {activeFormatTab === 'a3' ? 'whizpoint.app/summer-booklet.pdf' : 'whizpoint.app/annual-report.pdf'}
                    </span>
                  </div>
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono">
                    Page {previewPage} of {activeFormatTab === 'a3' ? '8' : '4'}
                  </span>
                </div>

                {/* Simulated Document Page Display */}
                <div className="flex-1 flex items-center justify-center my-2 relative">
                  {activeFormatTab === 'a3' ? (
                    /* A3 Booklet simulated spread split */
                    <div className="w-full max-w-sm h-full max-h-[170px] bg-white rounded-md shadow-2xl flex border border-slate-300 overflow-hidden">
                      <div className="flex-1 bg-gradient-to-r from-slate-100 to-white border-r border-slate-200 p-3 flex flex-col justify-between">
                        <div>
                          <div className="w-8 h-1.5 bg-blue-600 rounded mb-1"></div>
                          <div className="text-[10px] font-bold text-slate-800">
                            {previewPage === 1 ? 'Back Cover' : `Page ${previewPage * 2 - 1}`}
                          </div>
                          <div className="space-y-1 mt-2">
                            <div className="w-full h-1 bg-slate-200 rounded"></div>
                            <div className="w-4/5 h-1 bg-slate-200 rounded"></div>
                            <div className="w-3/4 h-1 bg-slate-200 rounded"></div>
                          </div>
                        </div>
                        <div className="text-[8px] text-slate-400 font-mono">Left Sheet Half</div>
                      </div>

                      <div className="flex-1 bg-white p-3 flex flex-col justify-between">
                        <div>
                          <div className="w-8 h-1.5 bg-indigo-600 rounded mb-1"></div>
                          <div className="text-[10px] font-bold text-slate-800">
                            {previewPage === 1 ? 'Front Cover' : `Page ${previewPage * 2}`}
                          </div>
                          <div className="space-y-1 mt-2">
                            <div className="w-full h-1 bg-slate-200 rounded"></div>
                            <div className="w-5/6 h-1 bg-slate-200 rounded"></div>
                            <div className="w-2/3 h-1 bg-slate-200 rounded"></div>
                          </div>
                        </div>
                        <div className="text-[8px] text-blue-600 font-mono text-right">Right Sheet Half</div>
                      </div>
                    </div>
                  ) : (
                    /* Standard A4 simulated direct portrait page */
                    <div className="w-36 h-full max-h-[180px] bg-white rounded-md shadow-2xl p-3 flex flex-col justify-between border border-slate-300">
                      <div>
                        <div className="w-10 h-2 bg-blue-600 rounded mb-1.5"></div>
                        <div className="text-[10px] font-bold text-slate-900">Direct A4 Page {previewPage}</div>
                        <div className="space-y-1 mt-2">
                          <div className="w-full h-1 bg-slate-200 rounded"></div>
                          <div className="w-full h-1 bg-slate-200 rounded"></div>
                          <div className="w-3/4 h-1 bg-slate-200 rounded"></div>
                          <div className="w-5/6 h-1 bg-slate-200 rounded"></div>
                        </div>
                      </div>
                      <div className="text-[8px] text-slate-400 font-mono text-center">Standard 1:1 Aspect</div>
                    </div>
                  )}
                </div>

                {/* Simulated Interactive Controls */}
                <div className="flex items-center justify-between text-slate-400 text-xs pt-1">
                  <button
                    onClick={() => setPreviewPage(p => Math.max(1, p - 1))}
                    disabled={previewPage <= 1}
                    className="hover:text-white px-2 py-1 rounded bg-slate-800/80 disabled:opacity-40"
                  >
                    &larr; Prev
                  </button>

                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map(num => (
                      <button
                        key={num}
                        onClick={() => setPreviewPage(num)}
                        className={`w-2 h-2 rounded-full transition-all ${previewPage === num ? 'w-5 bg-blue-500' : 'bg-slate-700'}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setPreviewPage(p => Math.min(4, p + 1))}
                    disabled={previewPage >= 4}
                    className="hover:text-white px-2 py-1 rounded bg-slate-800/80 disabled:opacity-40"
                  >
                    Next &rarr;
                  </button>
                </div>
              </div>

              {/* Floating QR Code Badge Showcase */}
              <div className="mt-4 p-3.5 bg-white/90 rounded-2xl border border-slate-200 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Dynamic Branded QR Code</div>
                    <div className="text-[11px] text-slate-500">Scan to read on mobile or download print vector</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200/50">
                  Ready
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Stats Ribbon (Glassmorphism) */}
      <section className="py-6 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Processing Speed', value: '0.2s', sub: 'Native Browser WASM' },
            { label: 'Retina Resolution', value: '3200px', sub: 'Lossless Vector Zoom' },
            { label: 'Dual Engines', value: 'A3 & A4', sub: 'Imposition or Direct' },
            { label: 'Client Privacy', value: '100%', sub: 'Local In-Browser Parsing' },
          ].map((stat, i) => (
            <div 
              key={i} 
              className="backdrop-blur-xl bg-white/70 border border-white/80 p-5 rounded-2xl shadow-xs text-center hover:bg-white/90 transition-all"
            >
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mt-0.5">{stat.label}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Formats Deep Dive Section */}
      <section id="formats" className="py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/50">
              Complete Document Compatibility
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 mb-4">
              Two Tailored Engines. Zero Guesswork.
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Never worry about printer spreads showing backward or A4 documents being sliced in half. Choose the exact format or let our smart geometry analyzer detect it automatically.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Format 1: A3 Booklet Spreads */}
            <div className="backdrop-blur-xl bg-white/75 border border-white/90 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-6">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-3">
                  Format Mode 1
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">A3 Booklet Spreads (Auto-Imposition)</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Perfect for folded booklets, event service programs, wedding/funeral bulletins, school magazines, and catalogues where two pages share a single A3 landscape sheet.
                </p>

                <ul className="space-y-3 text-sm text-slate-700 mb-8">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>4 A3 sheets automatically become 8 A4 pages:</strong> Solves the 4-page bug once and for all.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>Mathematical booklet imposition:</strong> Front Cover, Inside spreads, and Back Cover align in exact reading order.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>3200px Retina resolution:</strong> High-DPI canvas render ensures every word is razor sharp.</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/admin/upload?type=a3"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-center text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Upload A3 Booklet Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Format 2: Standard A4 Direct */}
            <div className="backdrop-blur-xl bg-white/75 border border-white/90 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                  <FileText className="w-7 h-7" />
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-3">
                  Format Mode 2
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Standard A4 / Single Page (1:1 Direct)</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Built for single-page portrait documents, company profiles, restaurant menus, pitch decks, proposals, and portfolios that should not be split down the middle.
                </p>

                <ul className="space-y-3 text-sm text-slate-700 mb-8">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>No splitting or cropping:</strong> Keeps every single page intact exactly as designed.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>Full multi-page support:</strong> From 1-page flyers to 100+ page corporate reports.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>Smooth vertical reader:</strong> Mobile swipe and desktop thumbnail sidebar for effortless reading.</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/admin/upload?type=a4"
                className="w-full py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl font-semibold text-center text-sm transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <span>Upload Standard A4 Document</span>
                <ArrowRight className="w-4 h-4 text-blue-600" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid (Glassmorphism) */}
      <section id="features" className="py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/50">
              Engineered For Excellence
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 mb-4">
              Everything You Need For Digital Publishing
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Deliver an interactive, native app-like document experience with zero server overhead or third-party ad clutter.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <RefreshCw className="w-6 h-6 text-blue-600" />,
                title: 'Seamless Update Button',
                desc: 'Replace PDFs anytime without breaking the public link or reprinting QR codes. The update automatically preserves booklet splitting or direct page structure.'
              },
              {
                icon: <QrCode className="w-6 h-6 text-indigo-600" />,
                title: 'Branded Dynamic QR Codes',
                desc: 'Every publication generates high-resolution vector QR codes with your custom logo embedded in the center, ready for event stands and menus.'
              },
              {
                icon: <Clock className="w-6 h-6 text-amber-600" />,
                title: 'Automated Link Expiry',
                desc: 'Set documents to automatically self-destruct after 5 days, 1 month, 1 year, or on an exact calendar date to preserve privacy and reduce storage.'
              },
              {
                icon: <Zap className="w-6 h-6 text-emerald-600" />,
                title: 'Instant Browser Processing',
                desc: 'All page parsing and rendering happens in client-side WebAssembly. No uploading huge 100MB PDF files to slow cloud queues.'
              },
              {
                icon: <Share2 className="w-6 h-6 text-sky-600" />,
                title: 'Custom Vanity Slugs',
                desc: 'Create clean, memorable links like flipbook/summer-gala or append .pdf for direct WhatsApp and social media previews.'
              },
              {
                icon: <Smartphone className="w-6 h-6 text-purple-600" />,
                title: 'Universal Responsive Reader',
                desc: 'Optimized for high-speed mobile reading with thumbnail preview drawers, smooth vertical flow, and gesture-friendly scrolling.'
              }
            ].map((f, idx) => (
              <div 
                key={idx}
                className="backdrop-blur-xl bg-white/70 border border-white/80 p-7 rounded-2xl shadow-xs hover:shadow-md hover:bg-white/90 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/50">
              Simple 4-Step Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 mb-4">
              From Print File to Interactive Reader in Seconds
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              No complex software configurations. Just drop your file and let the engine handle the rest.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Upload PDF',
                desc: 'Select or drag your PDF file. Choose A3 Booklet or Standard A4 mode, or let auto-detect decide.'
              },
              {
                step: '02',
                title: 'Auto-Process',
                desc: 'Pages are extracted at 3200px. A3 spreads are cleanly split down the middle and sequenced.'
              },
              {
                step: '03',
                title: 'Customize',
                desc: 'Set your vanity URL slug, upload your brand logo for the QR code, and pick an auto-expiry date.'
              },
              {
                step: '04',
                title: 'Publish & Share',
                desc: 'Instant live link, print-ready QR code, and interactive flipbook ready for your audience.'
              }
            ].map((st, i) => (
              <div 
                key={i} 
                className="backdrop-blur-xl bg-white/70 border border-white/80 p-6 rounded-2xl shadow-xs relative overflow-hidden"
              >
                <div className="text-4xl font-black text-blue-100 mb-3">{st.step}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{st.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/50">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-base">
              Everything you need to know about publishing with Whizpoint Flipbook.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="backdrop-blur-xl bg-white/75 border border-white/90 rounded-2xl overflow-hidden shadow-xs transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-base hover:text-blue-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner (Glassmorphism) */}
      <section className="py-16 px-6 relative z-10">
        <div className="max-w-5xl mx-auto backdrop-blur-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-3xl p-8 sm:p-14 text-center shadow-xl shadow-blue-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4 text-white">
            Ready to Transform Your First Document?
          </h2>
          <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto mb-8 font-normal">
            Upload your A3 booklet spreads or single-page A4 PDF now and see the interactive reader in action within seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/admin/upload?type=a3"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-blue-700 font-bold rounded-2xl hover:bg-blue-50 transition-colors shadow-md text-sm flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Create A3 Booklet Flipbook</span>
            </Link>
            
            <Link
              href="/admin/upload?type=a4"
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-700/60 hover:bg-blue-700 text-white font-bold rounded-2xl border border-white/20 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Upload Standard A4 Document</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Modern Light-Mode Footer */}
      <footer className="border-t border-slate-200/80 bg-white/90 backdrop-blur-md relative z-10 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-100">
            {/* Column 1: Brand & Bio */}
            <div className="md:col-span-2 space-y-3">
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
              <div className="text-xs text-slate-500 pt-1 space-y-1">
                <div>Nairobi, Kenya &bull; Tel: <a href="tel:+254718311345" className="text-slate-700 font-medium hover:text-blue-600">+254 718 311 345</a></div>
                <div>Support: <a href="mailto:support@whizpoint.app" className="text-blue-600 hover:underline">support@whizpoint.app</a></div>
              </div>
            </div>

            {/* Column 2: Navigation */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Platform</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><a href="#formats" className="hover:text-blue-600 transition-colors">A3 Booklet & A4 Formats</a></li>
                <li><a href="#features" className="hover:text-blue-600 transition-colors">Imposition Features</a></li>
                <li><a href="#how-it-works" className="hover:text-blue-600 transition-colors">Workflow & QR Engine</a></li>
                <li><Link href="/gallery" className="hover:text-blue-600 transition-colors">Public Publications</Link></li>
              </ul>
            </div>

            {/* Column 3: Legal & Security */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Legal & Compliance</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy (KDPA &bull; GDPR)</Link></li>
                <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service & SLAs</Link></li>
                <li><a href="mailto:legal@whizpoint.app" className="hover:text-blue-600 transition-colors">DMCA Takedown Notice</a></li>
                <li><Link href="/auth/login" className="hover:text-blue-600 transition-colors">Publisher Studio Sign In</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>&copy; {new Date().getFullYear()} Whizpoint Solutions. All rights reserved.</p>
            <p className="font-mono text-[11px]">KDPA 2019 Registered &bull; AES-256 R2 Storage</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
