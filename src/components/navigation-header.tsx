'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, ShieldCheck, BookOpen, Sparkles } from 'lucide-react';

const LOGO_URL = 'https://www.whizpoint.app/_next/image?url=%2Ficon.png&w=1920&q=75';

interface NavigationHeaderProps {
  showFullNav?: boolean;
}

export function NavigationHeader({ showFullNav = true }: NavigationHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '/#features' },
    { name: 'A3 Booklet & A4', href: '/#formats' },
    { name: 'Workflow', href: '/#workflow' },
    { name: 'FAQ', href: '/#faq' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] py-3'
            : 'bg-white/60 backdrop-blur-md py-3.5 sm:py-4 border-b border-white/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="p-1 sm:p-1.5 bg-white/90 rounded-2xl shadow-xs border border-slate-200/60 group-hover:scale-105 transition-all duration-200">
              <img src={LOGO_URL} alt="Whizpoint Logo" className="h-6 sm:h-8 w-auto object-contain" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight leading-none">
                  Whizpoint
                </span>
                <span className="font-semibold text-sm sm:text-base text-blue-600 tracking-tight leading-none">
                  Flipbook
                </span>
              </div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mt-1">
                Studio &bull; e.whizpoint.app
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {showFullNav && (
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/70 backdrop-blur-md border border-slate-200/50 p-1.5 rounded-full">
              {navLinks.slice(0, 4).map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-white/90 transition-all"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/privacy"
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  pathname === '/privacy' || pathname === '/terms'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-white/90'
                }`}
              >
                Legal
              </Link>
            </nav>
          )}

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/auth/login"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 group"
            >
              Launch Studio
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs"
            >
              Studio
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100/80 border border-slate-200/60 text-slate-700 hover:bg-slate-200/80 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Hovering Translucent Glassmorphic Dropdown Menu (Mobile) */}
        {mobileMenuOpen && (
          <div className="sm:hidden absolute top-[calc(100%+8px)] left-3 right-3 bg-white/80 backdrop-blur-2xl border border-white/70 shadow-[0_20px_60px_rgba(0,0,0,0.12)] rounded-3xl p-4 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-blue-50/70 hover:text-blue-600 transition-colors"
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-3 mt-2 border-t border-slate-200/60 flex items-center gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center rounded-xl bg-slate-100 text-slate-800 font-bold text-xs"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm"
                >
                  Sign Up Free
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Backdrop overlay to close menu when tapping outside */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/10 backdrop-blur-xs z-40 sm:hidden"
        />
      )}
    </>
  );
}
