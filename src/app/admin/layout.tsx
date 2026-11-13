'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  Layers,
  FileText,
  Sliders,
  Users,
  Mail,
  LogOut,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Printer,
} from 'lucide-react';

const LOGO_URL = 'https://www.whizpoint.app/_next/image?url=%2Ficon.png&w=1920&q=75';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    setIsClient(true);
    if (pathname !== '/auth/login') {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
      } else {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.email) {
            setUserEmail(payload.email);
          }
          if (payload.email === 'admin@whizpoint.app') {
            setIsAdmin(true);
          }

          // Verify token validity with backend to catch old or expired tokens
          fetch('/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => {
              if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('auth_token');
                router.push('/auth/login');
              }
            })
            .catch(console.error);
        } catch (e) {
          console.error(e);
          localStorage.removeItem('auth_token');
          router.push('/auth/login');
        }
      }
    }
  }, [pathname, router]);

  if (pathname === '/auth/login') {
    return <>{children}</>;
  }

  if (!isClient) return null;

  const isDashboardRoute = pathname.startsWith('/dashboard');
  const basePath = isDashboardRoute ? '/dashboard' : '/admin';

  const navItems = [
    {
      name: 'My Publications',
      href: basePath,
      icon: BookOpen,
      badge: null,
    },
    {
      name: 'Upload A3 Booklet',
      href: `${basePath}/upload?type=a3`,
      icon: Layers,
      badge: 'Imposition',
    },
    {
      name: 'Upload A4 Document',
      href: `${basePath}/upload?type=a4`,
      icon: FileText,
      badge: '1:1 Direct',
    },
    {
      name: 'A4 Standee Studio',
      href: `${basePath}/a4-studio`,
      icon: Printer,
      badge: '50 Presets',
    },
    {
      name: 'Studio Settings',
      href: `${basePath}/settings`,
      icon: Sliders,
      badge: null,
    },
  ];

  if (isAdmin) {
    navItems.push({
      name: 'All Documents',
      href: `${basePath}/documents`,
      icon: FileText,
      badge: 'Admin',
    });
    navItems.push({
      name: 'Users Directory',
      href: `${basePath}/users`,
      icon: Users,
      badge: 'Admin',
    });
    navItems.push({
      name: 'Email Broadcast',
      href: `${basePath}/broadcast`,
      icon: Mail,
      badge: 'Dispatcher',
    });
  }

  const handleSignOut = () => {
    localStorage.removeItem('auth_token');
    router.push('/auth/login');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-blue-50/20 overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* ========================================================= */}
      {/* DESKTOP GLASSMORPHIC SIDEBAR                              */}
      {/* ========================================================= */}
      <aside className="hidden md:flex flex-col w-72 bg-white/80 backdrop-blur-2xl border-r border-slate-200/70 shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-full relative z-20">
        
        {/* Brand Header */}
        <div className="p-6 pb-5 border-b border-slate-100/80">
          <Link href={basePath} className="flex items-center gap-3 group">
            <div className="p-1.5 bg-white rounded-2xl shadow-xs border border-slate-200/80 group-hover:scale-105 transition-transform duration-200">
              <img src={LOGO_URL} alt="Whizpoint" className="h-8 w-auto object-contain" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight leading-none text-base">
                  Whizpoint
                </span>
                <span className="font-semibold text-blue-600 tracking-tight leading-none text-base">
                  Flipbook
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span
                  className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                    isAdmin
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}
                >
                  {isAdmin ? 'Super Admin' : 'Publisher Studio'}
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Studio Workspaces
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (pathname.startsWith(item.href) && item.href !== basePath && item.href !== '/admin');

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/70'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Sign Out */}
        <div className="p-4 border-t border-slate-100/80 bg-slate-50/50">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Logged in as
              </span>
              <span className="text-xs font-bold text-slate-800 truncate" title={userEmail}>
                {userEmail || 'Publisher'}
              </span>
            </div>
            <Link
              href="/"
              target="_blank"
              title="View Public Portal"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 px-3 py-2.5 w-full rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 font-semibold text-xs transition-all shadow-2xs cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN CONTENT WORKSPACE                                    */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Mobile Header */}
        <header className="md:hidden bg-white/90 backdrop-blur-xl border-b border-slate-200/80 flex items-center justify-between p-4 z-30">
          <Link href={basePath} className="flex items-center gap-2.5">
            <img src={LOGO_URL} alt="Whizpoint" className="h-7 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="font-extrabold text-slate-900 leading-none text-sm">
                Whizpoint Flipbook
              </span>
              <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider mt-0.5">
                {isAdmin ? 'Admin Console' : 'Publisher Studio'}
              </span>
            </div>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            aria-label="Toggle mobile navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Floating Translucent Glassmorphic Mobile Drawer */}
        {mobileMenuOpen && (
          <>
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-slate-900/15 backdrop-blur-xs z-20"
            />
            <div className="md:hidden absolute top-16 left-3 right-3 z-30 bg-white/85 backdrop-blur-2xl border border-white/70 shadow-[0_20px_60px_rgba(0,0,0,0.12)] rounded-3xl p-4 animate-in slide-in-from-top-2 duration-200 space-y-3">
              <nav className="space-y-1">
                <div className="px-3 pb-1.5 text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Navigation
                </div>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">
                  {userEmail}
                </span>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-semibold text-xs border border-red-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
          {/* Subtle Ambient Background Glows */}
          <div className="fixed top-20 right-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="fixed bottom-10 left-80 w-96 h-96 bg-indigo-200/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-6xl mx-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
