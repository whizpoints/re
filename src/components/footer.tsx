import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, ExternalLink, ShieldCheck, Layers, BookOpen } from 'lucide-react';

const LOGO_URL = 'https://www.whizpoint.app/_next/image?url=%2Ficon.png&w=1920&q=75';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200/80 bg-white/90 backdrop-blur-md relative z-10 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-100">
          {/* Col 1: Brand & Operational Description */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white rounded-xl shadow-xs border border-slate-200/80">
                <img
                  src={LOGO_URL}
                  alt="Whizpoint Logo"
                  className="h-7 w-auto object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 leading-none">Whizpoint</span>
                  <span className="font-semibold text-blue-600 leading-none">Flipbook</span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">
                  Digital Publishing Engine &bull; e.whizpoint.app
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 max-w-md leading-relaxed">
              Industrial-grade client-side WebAssembly rasterization for A3 booklet spreads and single-page A4 publications with vector QR codes, automated imposition, and Cloudflare multi-region edge delivery.
            </p>

            {/* Official Verified Contacts */}
            <div className="text-xs text-slate-600 pt-1 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-400 font-medium">Phone / WhatsApp:</span>
                <a
                  href="https://wa.me/254754783683"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                >
                  +254 754 783 683
                </a>
                <span className="text-slate-300">&bull;</span>
                <a
                  href="tel:+254718311345"
                  className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
                >
                  +254 718 311 345
                </a>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-400 font-medium">Official Email:</span>
                <a href="mailto:support@whizpoint.app" className="text-blue-600 hover:underline">
                  support@whizpoint.app
                </a>
                <span className="text-slate-300">&bull;</span>
                <a href="mailto:info@whizpoint.app" className="text-slate-700 hover:text-blue-600">
                  info@whizpoint.app
                </a>
                <span className="text-slate-300">&bull;</span>
                <a href="mailto:admin@whizpoint.app" className="text-slate-700 hover:text-blue-600">
                  admin@whizpoint.app
                </a>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-slate-500">
                <span className="text-slate-400 font-medium">Headquarters:</span>
                <span>Nairobi, Kenya</span>
                <span className="text-slate-300">&bull;</span>
                <a
                  href="https://www.whizpoint.app/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
                >
                  <span>Whizpoint Contact Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/gallery" className="hover:text-blue-600 font-medium transition-colors flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Public Gallery</span>
                </Link>
              </li>
              <li>
                <Link href="/#formats" className="hover:text-blue-600 transition-colors">
                  A3 Booklet & A4 Imposition
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-blue-600 transition-colors">
                  Platform Features
                </Link>
              </li>
              <li>
                <Link href="/#workflow" className="hover:text-blue-600 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-blue-600 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/errors" className="hover:text-blue-600 text-slate-400 transition-colors text-[11px]">
                  System Status & Diagnostics
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Publisher */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Legal & Studio</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/privacy" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Privacy Policy (KDPA 2019)</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="mailto:legal@whizpoint.app" className="hover:text-blue-600 transition-colors">
                  DMCA & Copyright Notice
                </a>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-blue-600 transition-colors font-semibold text-slate-800">
                  Publisher Sign In &rarr;
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="text-blue-600 hover:underline font-semibold">
                  Create Publisher Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>&copy; {currentYear} Whizpoint Solutions. All rights reserved.</p>
          <p className="font-mono text-center sm:text-right">
            Registered under Kenya Commercial Law &bull; KDPA 2019 Compliant
          </p>
        </div>
      </div>
    </footer>
  );
}
