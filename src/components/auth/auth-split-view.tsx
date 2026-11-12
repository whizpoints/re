'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Zap,
  RotateCw,
  Check,
} from 'lucide-react';
import { NavigationHeader } from '@/components/navigation-header';
import { toast } from 'react-hot-toast';

const LOGO_URL = 'https://www.whizpoint.app/_next/image?url=%2Ficon.png&w=1920&q=75';

interface AuthSplitViewProps {
  initialMode: 'login' | 'signup';
  notification?: string | null;
  errorParam?: string | null;
  emailParam?: string | null;
}

export function AuthSplitView({
  initialMode,
  notification: initialNotification,
  errorParam,
  emailParam = '',
}: AuthSplitViewProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState(emailParam || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(errorParam || '');
  const [notification, setNotification] = useState<string | null>(initialNotification || null);

  // Signup verification pending state
  const [signupSuccessEmail, setSignupSuccessEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const switchMode = (newMode: 'login' | 'signup') => {
    setError('');
    setNotification(null);
    setSignupSuccessEmail(null);
    setMode(newMode);
    if (newMode === 'login') {
      router.replace('/auth/login', { scroll: false });
    } else {
      router.replace('/auth/signup', { scroll: false });
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.notVerified) {
          router.push(`/auth/unverified?email=${encodeURIComponent(email)}`);
          return;
        }
        throw new Error(data.error || 'Invalid email or password');
      }

      localStorage.setItem('auth_token', data.token);
      toast.success('Welcome back');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your confirm password.');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      setSignupSuccessEmail(email);
      setResendCooldown(60);
      toast.success('Account created! Verification link sent.');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !signupSuccessEmail) return;
    try {
      const res = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupSuccessEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('New verification link sent to your inbox');
        setResendCooldown(60);
      } else {
        toast.error(data.error || 'Failed to resend verification link');
      }
    } catch {
      toast.error('Network error resending verification link');
    }
  };

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 relative">
      <NavigationHeader showFullNav={true} />

      {/* Main Container - Centered and 100% single-screen fit without scrolling */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-4 sm:pb-6">
        <div className="w-full max-w-md lg:max-w-6xl xl:max-w-7xl lg:grid lg:grid-cols-12 lg:h-[calc(100vh-95px)] lg:max-h-[760px] lg:min-h-[580px] rounded-3xl lg:border lg:border-slate-200/90 lg:shadow-[0_20px_50px_rgba(0,0,0,0.06)] bg-white overflow-hidden">
          
          {/* ========================================================= */}
          {/* LEFT SIDEBAR: DESKTOP ONLY (HIDDEN ON MOBILE)             */}
          {/* ========================================================= */}
          <div className="hidden lg:flex lg:col-span-6 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 text-slate-800 p-6 xl:p-8 flex-col justify-between relative overflow-hidden select-none border-r border-slate-200/80">
            {/* Crisp Light Blueprint Grid Background */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(37,99,235,0.06) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(37,99,235,0.06) 1px, transparent 1px)
                `,
                backgroundSize: '28px 28px',
              }}
            />

            {/* Radiant Ambient Sky Glows */}
            <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-blue-300/25 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-indigo-300/20 blur-3xl pointer-events-none" />

            {/* Corner Crosshair Coordinates */}
            <div className="absolute top-3.5 left-4 font-mono text-[9px] text-slate-400 tracking-wider">
              + [SYS-ARCHIVE: 001]
            </div>
            <div className="absolute top-3.5 right-4 font-mono text-[9px] text-slate-400 tracking-wider">
              [COORD: 254-NBO] +
            </div>

            {/* Top Bar / Telemetry */}
            <div className="relative z-10 pt-1">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 border border-slate-200/90 shadow-2xs font-mono text-[10px] text-blue-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-slate-500">ENGINE:</span>
                  <span className="font-bold text-emerald-600">ONLINE</span>
                </div>
                <div className="font-mono text-[9px] text-slate-400 uppercase tracking-widest">
                  ISO-216 &bull; SPREAD ENGINE
                </div>
              </div>

              {/* Dynamic Bright Light-Theme Title */}
              <div className="mt-4 sm:mt-5">
                <div className="text-[10px] font-mono tracking-widest text-blue-600 uppercase font-bold mb-1">
                  {mode === 'login' ? 'Authentication Console' : 'Publisher Commissioning'}
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {mode === 'login'
                    ? 'Enter the Archival Publishing Studio'
                    : 'Commission Your Digital Imposition Node'}
                </h2>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed max-w-lg">
                  {mode === 'login'
                    ? 'Automated A3 booklet splitting, 1:1 A4 direct flow, vector QR codes, and sub-300ms edge publication delivery.'
                    : 'Create your studio workspace to transform landscape spreads into interactive reading experiences with automated Cloudflare R2 replication.'}
                </p>
              </div>
            </div>

            {/* CENTER: BRIGHT INTERACTIVE FLIPBOOK BLUEPRINT VISUALIZER */}
            <div className="relative z-10 my-auto py-2">
              <div className="relative mx-auto max-w-sm rounded-2xl p-3.5 bg-white/95 border border-slate-200/90 shadow-[0_10px_25px_rgba(0,0,0,0.04)] backdrop-blur-md">
                
                {/* Visualizer Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 text-[9px] font-mono text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span className="font-semibold text-slate-700">A3 LANDSCAPE &rarr; DUAL A4 IMPOSITION</span>
                  </div>
                  <span className="text-blue-600 font-bold">3200 PX / WEBP</span>
                </div>

                {/* Simulated 3D Book Spreads */}
                <div className="relative py-3 flex items-center justify-center gap-1.5">
                  {/* Left Page (A3 Left Half) */}
                  <div className="w-1/2 aspect-[1/1.414] bg-slate-50 border border-slate-200 rounded-l-lg p-2.5 flex flex-col justify-between shadow-xs relative overflow-hidden group">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[7px] font-mono text-slate-400 font-bold">[PAGE 01]</span>
                        <span className="text-[7px] font-mono text-blue-600 font-bold">VERSO</span>
                      </div>
                      <div className="h-1.5 w-3/4 bg-slate-200 rounded" />
                      <div className="h-1 w-full bg-slate-200/80 rounded" />
                      <div className="h-1 w-5/6 bg-slate-200/80 rounded" />
                      <div className="h-1 w-4/6 bg-slate-200/80 rounded" />
                    </div>
                    <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between text-[7px] font-mono text-slate-400">
                      <span>WHIZPOINT</span>
                      <span>SPREAD A</span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600" />
                  </div>

                  {/* Book Spine Wire Separator */}
                  <div className="w-1.5 h-28 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200 rounded-xs shadow-xs flex flex-col justify-between py-1">
                    <span className="w-1 h-1 bg-slate-400 rounded-full mx-auto" />
                    <span className="w-1 h-1 bg-slate-400 rounded-full mx-auto" />
                    <span className="w-1 h-1 bg-slate-400 rounded-full mx-auto" />
                    <span className="w-1 h-1 bg-slate-400 rounded-full mx-auto" />
                  </div>

                  {/* Right Page (A3 Right Half) */}
                  <div className="w-1/2 aspect-[1/1.414] bg-slate-50 border border-slate-200 rounded-r-lg p-2.5 flex flex-col justify-between shadow-xs relative overflow-hidden">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[7px] font-mono text-blue-600 font-bold">RECTO</span>
                        <span className="text-[7px] font-mono text-slate-400 font-bold">[PAGE 02]</span>
                      </div>
                      <div className="aspect-square w-10 bg-white border border-slate-200 rounded p-1 flex items-center justify-center shadow-2xs">
                        <QrCode className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="h-1 w-full bg-slate-200/80 rounded" />
                    </div>
                    <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between text-[7px] font-mono text-slate-400">
                      <span>QR DYNAMIC</span>
                      <span>e.whizpoint.app</span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-600" />
                  </div>
                </div>

                {/* Telemetry Bar Under Spreads */}
                <div className="pt-2.5 border-t border-slate-100 grid grid-cols-3 gap-1.5 text-center">
                  <div className="p-1 rounded bg-slate-50 border border-slate-100">
                    <div className="text-[7px] font-mono text-slate-400 uppercase">Imposition</div>
                    <div className="text-[9px] font-mono font-bold text-slate-800">2-UP SPLIT</div>
                  </div>
                  <div className="p-1 rounded bg-slate-50 border border-slate-100">
                    <div className="text-[7px] font-mono text-slate-400 uppercase">Storage</div>
                    <div className="text-[9px] font-mono font-bold text-slate-800">EDGE R2</div>
                  </div>
                  <div className="p-1 rounded bg-slate-50 border border-slate-100">
                    <div className="text-[7px] font-mono text-slate-400 uppercase">Latency</div>
                    <div className="text-[9px] font-mono font-bold text-emerald-600">&lt;14MS</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Hardware & Security Specifications */}
            <div className="relative z-10 pt-3 border-t border-slate-200/80">
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>AES-256 Storage Security</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>WASM Client Rasterizer</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT PANEL / MOBILE STANDALONE GLASSMORPHIC AUTH CARD    */}
          {/* ========================================================= */}
          <div className="w-full lg:col-span-6 bg-white/90 lg:bg-white backdrop-blur-2xl lg:backdrop-blur-none border border-white/80 lg:border-none shadow-[0_20px_50px_rgba(0,0,0,0.06)] lg:shadow-none rounded-3xl lg:rounded-none flex flex-col justify-center p-6 sm:p-8 lg:p-8 xl:p-10 relative">
            <div className="w-full max-w-sm sm:max-w-md mx-auto">
              
              {/* Brand Header */}
              <div className="flex items-center justify-between mb-4">
                <Link href="/" className="inline-flex items-center gap-2.5 group">
                  <div className="p-1.5 bg-slate-50 rounded-xl border border-slate-200 group-hover:scale-105 transition-transform duration-200">
                    <img src={LOGO_URL} alt="Whizpoint" className="h-6 sm:h-7 w-auto object-contain" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 leading-none">Whizpoint</span>
                    <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Flipbook Studio</span>
                  </div>
                </Link>

                <div className="font-mono text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
                  {mode === 'login' ? 'Secure Auth' : 'Free Tier'}
                </div>
              </div>

              {/* Mode Switcher Pill */}
              <div className="p-1 bg-slate-100 rounded-2xl flex items-center mb-4 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                    mode === 'login'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Notification Banner */}
              {notification && (
                <div className="mb-3.5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{notification}</span>
                </div>
              )}

              {/* Error Banner */}
              {error && (
                <div className="mb-3.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* ===================================================== */}
              {/* SIGNUP PENDING EMAIL VERIFICATION VIEW                */}
              {/* ===================================================== */}
              {signupSuccessEmail ? (
                <div className="py-3 space-y-4 animate-in fade-in duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
                    <Mail className="w-7 h-7" />
                  </div>

                  <div className="text-center">
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                      Check Your Inbox
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      We dispatched a verification link to:
                    </p>
                    <div className="mt-2 inline-block px-3.5 py-1 bg-slate-100 rounded-lg font-mono text-xs font-semibold text-slate-800 border border-slate-200">
                      {signupSuccessEmail}
                    </div>
                    <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                      Click the link in your email to immediately activate your publishing workspace.
                    </p>
                  </div>

                  <div className="pt-2 space-y-2.5">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendCooldown > 0}
                      className="w-full h-11 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {resendCooldown > 0 ? (
                        <span>Resend available in {resendCooldown}s</span>
                      ) : (
                        <>
                          <RotateCw className="w-4 h-4" />
                          <span>Resend Verification Link</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="w-full h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Proceed to Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Google Single Sign-On Button */}
                  <a
                    href="/api/auth/google"
                    className="w-full h-11 sm:h-12 flex items-center justify-center gap-3 px-4 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-all shadow-2xs hover:shadow-xs group cursor-pointer mb-3.5"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </a>

                  {/* Clean Divider */}
                  <div className="relative flex items-center justify-center mb-3.5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <span className="relative px-3 bg-white text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      Or with email
                    </span>
                  </div>

                  {/* ================================================= */}
                  {/* LOGIN FORM                                        */}
                  {/* ================================================= */}
                  {mode === 'login' ? (
                    <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Work Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="publisher@whizpoint.app"
                            required
                            className="w-full h-11 sm:h-12 pl-10 pr-4 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-700">
                            Password
                          </label>
                          <Link
                            href="/auth/forgot-password"
                            className="text-xs font-semibold text-blue-600 hover:underline"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                            className="w-full h-11 sm:h-12 pl-10 pr-10 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 sm:h-12 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer group"
                      >
                        {loading ? (
                          <>
                            <RotateCw className="w-4 h-4 animate-spin" />
                            <span>Authenticating Session...</span>
                          </>
                        ) : (
                          <>
                            <span>Sign In to Studio</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* ================================================= */
                    /* SIGNUP FORM WITH CONFIRM PASSWORD & CONFIRM BUTTON */
                    /* ================================================= */
                    <form onSubmit={handleSignupSubmit} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Full Name or Organization
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe / Creative Agency"
                            required
                            className="w-full h-10 sm:h-11 pl-10 pr-4 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Work Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="publisher@whizpoint.app"
                            required
                            className="w-full h-10 sm:h-11 pl-10 pr-4 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      {/* Password & Confirm Password Side-by-Side Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Min 6 chars"
                              required
                              minLength={6}
                              className="w-full h-10 sm:h-11 pl-10 pr-9 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                            >
                              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold text-slate-700">
                              Confirm Password
                            </label>
                            {passwordsMatch && (
                              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> Match
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Re-type password"
                              required
                              minLength={6}
                              className={`w-full h-10 sm:h-11 pl-10 pr-9 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                                confirmPassword.length > 0 && !passwordsMatch
                                  ? 'border-amber-400 focus:border-amber-400'
                                  : 'border-slate-200 focus:border-blue-500'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                            >
                              {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Terms Acceptance Checkbox */}
                      <div className="flex items-start gap-2 pt-0.5">
                        <input
                          type="checkbox"
                          id="terms-checkbox"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor="terms-checkbox" className="text-[11px] text-slate-500 leading-tight cursor-pointer">
                          I agree to the{' '}
                          <Link href="/terms" target="_blank" className="text-blue-600 hover:underline font-medium">
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link href="/privacy" target="_blank" className="text-blue-600 hover:underline font-medium">
                            Privacy Policy
                          </Link>
                          .
                        </label>
                      </div>

                      {/* Confirm & Create Account Button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 sm:h-12 mt-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer group"
                      >
                        {loading ? (
                          <>
                            <RotateCw className="w-4 h-4 animate-spin" />
                            <span>Confirming & Creating Account...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Confirm & Create Account</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </>
              )}

              {/* Bottom Micro Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Kenya Data Protection &bull; GDPR Ready</span>
                <Link href="/privacy" className="hover:text-slate-600 underline">
                  Legal Compliance
                </Link>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
