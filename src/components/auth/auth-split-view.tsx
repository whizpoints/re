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
  Sparkles,
  BookOpen,
  QrCode,
  Layers,
  Cpu,
  Zap,
  RotateCw,
  FileText,
  Sliders,
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
      setError('Passwords do not match');
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 relative">
      <NavigationHeader showFullNav={true} />

      {/* Main container with comfortable header offset */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-10 pt-20 sm:pt-24 lg:pt-28">
        <div className="w-full max-w-5xl rounded-3xl overflow-hidden border border-slate-200/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08)] bg-white grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* ========================================================= */}
          {/* LEFT SIDEBAR: RETRO ARCHIVAL IMPOSITION SHOWCASE          */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 bg-slate-950 text-slate-200 p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden select-none border-b lg:border-b-0 lg:border-r border-slate-800">
            {/* Retro Blueprint Grid Background */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
                `,
                backgroundSize: '32px 32px',
              }}
            />

            {/* Ambient Cyan/Blue Glow in Top Corner */}
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

            {/* Corner Crosshair Coordinates */}
            <div className="absolute top-4 left-4 font-mono text-[10px] text-slate-500 tracking-wider">
              + [SYS-ARCHIVE: 001]
            </div>
            <div className="absolute top-4 right-4 font-mono text-[10px] text-slate-500 tracking-wider">
              [COORD: 254-NBO] +
            </div>

            {/* Top Bar / Telemetry */}
            <div className="relative z-10 pt-2">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 font-mono text-[10px] text-blue-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-slate-300">ENGINE STATUS:</span>
                  <span className="text-emerald-400 font-bold">ONLINE</span>
                </div>
                <div className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                  ISO-216 &bull; SPREAD ENGINE
                </div>
              </div>

              {/* Dynamic Retro Title */}
              <div className="mt-8">
                <div className="text-[11px] font-mono tracking-widest text-blue-400 uppercase mb-1">
                  {mode === 'login' ? 'Authentication Console' : 'Publisher Commissioning'}
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  {mode === 'login'
                    ? 'Enter the Archival Publishing Studio'
                    : 'Commission Your Digital Imposition Node'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                  {mode === 'login'
                    ? 'Seamless client-side A3 imposition, instant A4 direct flows, dynamic vector QR generators, and sub-300ms edge publication delivery.'
                    : 'Create your studio workspace to transform landscape spreads into interactive reading experiences with automated Cloudflare R2 replication.'}
                </p>
              </div>
            </div>

            {/* CENTER: RETRO INTERACTIVE FLIPBOOK BLUEPRINT VISUALIZER */}
            <div className="relative z-10 my-8">
              <div className="relative mx-auto max-w-sm rounded-2xl p-4 bg-slate-900/90 border border-slate-800/80 shadow-2xl backdrop-blur-md">
                
                {/* Visualizer Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[10px] font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>A3 LANDSCAPE &rarr; DUAL A4 IMPOSITION</span>
                  </div>
                  <span className="text-blue-400">3200 PX / WEBP</span>
                </div>

                {/* Simulated 3D Book Spreads */}
                <div className="relative py-4 flex items-center justify-center gap-1.5">
                  {/* Left Page (A3 Left Half) */}
                  <div className="w-1/2 aspect-[1/1.414] bg-slate-950 border border-slate-700/80 rounded-l-lg p-3 flex flex-col justify-between shadow-inner relative overflow-hidden group">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-mono text-slate-500">[PAGE 01]</span>
                        <span className="text-[8px] font-mono text-blue-400">VERSO</span>
                      </div>
                      <div className="h-2 w-3/4 bg-slate-800 rounded" />
                      <div className="h-1.5 w-full bg-slate-800/60 rounded" />
                      <div className="h-1.5 w-5/6 bg-slate-800/60 rounded" />
                      <div className="h-1.5 w-4/6 bg-slate-800/60 rounded" />
                    </div>
                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[8px] font-mono text-slate-600">
                      <span>WHIZPOINT</span>
                      <span>SPREAD A</span>
                    </div>
                    {/* Retro Grid Accent */}
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-60" />
                  </div>

                  {/* Book Spine Wire Separator */}
                  <div className="w-1.5 h-36 bg-gradient-to-b from-slate-700 via-slate-600 to-slate-700 rounded-sm shadow-md flex flex-col justify-between py-1">
                    <span className="w-1 h-1 bg-slate-900 rounded-full mx-auto" />
                    <span className="w-1 h-1 bg-slate-900 rounded-full mx-auto" />
                    <span className="w-1 h-1 bg-slate-900 rounded-full mx-auto" />
                    <span className="w-1 h-1 bg-slate-900 rounded-full mx-auto" />
                    <span className="w-1 h-1 bg-slate-900 rounded-full mx-auto" />
                  </div>

                  {/* Right Page (A3 Right Half) */}
                  <div className="w-1/2 aspect-[1/1.414] bg-slate-950 border border-slate-700/80 rounded-r-lg p-3 flex flex-col justify-between shadow-inner relative overflow-hidden">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-mono text-blue-400">RECTO</span>
                        <span className="text-[8px] font-mono text-slate-500">[PAGE 02]</span>
                      </div>
                      {/* Simulated Graphic / QR Blueprint */}
                      <div className="aspect-square w-12 bg-slate-900 border border-slate-800 rounded p-1 flex items-center justify-center">
                        <QrCode className="w-6 h-6 text-blue-400/80" />
                      </div>
                      <div className="h-1.5 w-full bg-slate-800/60 rounded" />
                    </div>
                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[8px] font-mono text-slate-600">
                      <span>QR DYNAMIC</span>
                      <span>e.whizpoint.app</span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-60" />
                  </div>
                </div>

                {/* Telemetry Bar Under Spreads */}
                <div className="pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-center">
                  <div className="p-1.5 rounded bg-slate-950/60 border border-slate-800/60">
                    <div className="text-[8px] font-mono text-slate-500 uppercase">Imposition</div>
                    <div className="text-[10px] font-mono font-bold text-slate-200">2-UP SPLIT</div>
                  </div>
                  <div className="p-1.5 rounded bg-slate-950/60 border border-slate-800/60">
                    <div className="text-[8px] font-mono text-slate-500 uppercase">Storage</div>
                    <div className="text-[10px] font-mono font-bold text-slate-200">EDGE R2</div>
                  </div>
                  <div className="p-1.5 rounded bg-slate-950/60 border border-slate-800/60">
                    <div className="text-[8px] font-mono text-slate-500 uppercase">Latency</div>
                    <div className="text-[10px] font-mono font-bold text-emerald-400">&lt;14MS</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Hardware & Security Specifications */}
            <div className="relative z-10 pt-4 border-t border-slate-800/80">
              <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>AES-256 Cloud Cryptographic Storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Sub-second WebAssembly Client Rasterizer</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT PANEL: COMPACT GLASSMORPHIC AUTH CARD               */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 bg-white flex flex-col justify-center p-6 sm:p-10 lg:p-12 relative">
            <div className="max-w-md w-full mx-auto">
              
              {/* Brand Header */}
              <div className="flex items-center justify-between mb-6">
                <Link href="/" className="inline-flex items-center gap-2 group">
                  <div className="p-1.5 bg-slate-50 rounded-xl border border-slate-200/80 group-hover:scale-105 transition-transform duration-200">
                    <img src={LOGO_URL} alt="Whizpoint" className="h-7 w-auto object-contain" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-extrabold text-slate-900 leading-none">Whizpoint</span>
                    <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest mt-0.5">Flipbook Studio</span>
                  </div>
                </Link>

                <div className="font-mono text-[11px] text-slate-400">
                  {mode === 'login' ? 'v2.6 Secure' : 'Free Tier'}
                </div>
              </div>

              {/* Smooth Animated Tab Switcher Pill */}
              <div className="relative p-1 bg-slate-100/90 rounded-2xl flex items-center mb-6 border border-slate-200/70">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                    mode === 'login'
                      ? 'bg-white text-slate-900 shadow-sm shadow-slate-200/60'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-white text-slate-900 shadow-sm shadow-slate-200/60'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Notification Banner */}
              {notification && (
                <div className="mb-5 p-3 rounded-xl bg-blue-50/90 border border-blue-200/80 text-blue-800 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{notification}</span>
                </div>
              )}

              {/* Error Banner */}
              {error && (
                <div className="mb-5 p-3 rounded-xl bg-red-50/90 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* ===================================================== */}
              {/* SPECIAL CASE: SIGNUP PENDING EMAIL VERIFICATION VIEW  */}
              {/* ===================================================== */}
              {signupSuccessEmail ? (
                <div className="py-4 space-y-5 animate-in fade-in duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200/70 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
                    <Mail className="w-7 h-7" />
                  </div>

                  <div className="text-center">
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      Check Your Inbox
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      We dispatched a verification link to:
                    </p>
                    <div className="mt-2 inline-block px-3 py-1 bg-slate-100 rounded-lg font-mono text-xs font-semibold text-slate-800 border border-slate-200">
                      {signupSuccessEmail}
                    </div>
                    <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                      Click the verification link in your email to instantly activate your publishing workspace.
                    </p>
                  </div>

                  <div className="pt-2 space-y-2.5">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendCooldown > 0}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {resendCooldown > 0 ? (
                        <span>Resend link available in {resendCooldown}s</span>
                      ) : (
                        <>
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Resend Verification Link</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Proceed to Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Google Single Sign-On Button */}
                  <a
                    href="/api/auth/google"
                    className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50/90 text-slate-700 font-semibold text-xs transition-all shadow-xs hover:shadow-sm group cursor-pointer mb-5"
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

                  {/* Divider */}
                  <div className="relative flex items-center justify-center mb-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200/80" />
                    </div>
                    <span className="relative px-3 bg-white text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      Or with credentials
                    </span>
                  </div>

                  {/* ================================================= */}
                  {/* LOGIN FORM                                        */}
                  {/* ================================================= */}
                  {mode === 'login' ? (
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-semibold text-slate-700">
                            Password
                          </label>
                          <Link
                            href="/auth/forgot-password"
                            className="text-[11px] font-medium text-blue-600 hover:underline"
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
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer group"
                      >
                        {loading ? (
                          <>
                            <RotateCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Authenticating Session...</span>
                          </>
                        ) : (
                          <>
                            <span>Enter Publishing Studio</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* ================================================= */
                    /* SIGNUP FORM                                       */
                    /* ================================================= */
                    <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Minimum 6 chars"
                              required
                              minLength={6}
                              className="w-full pl-10 pr-8 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Re-type password"
                              required
                              minLength={6}
                              className="w-full pl-10 pr-8 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                            >
                              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Terms Acceptance */}
                      <div className="flex items-start gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="terms-checkbox"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor="terms-checkbox" className="text-[11px] text-slate-500 leading-snug cursor-pointer">
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

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer group"
                      >
                        {loading ? (
                          <>
                            <RotateCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Creating Publisher Node...</span>
                          </>
                        ) : (
                          <>
                            <span>Commission Publisher Account</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </>
              )}

              {/* Bottom Micro Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Kenya Data Protection Act &bull; GDPR Ready</span>
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
