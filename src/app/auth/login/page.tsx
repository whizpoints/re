'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

const LOGO_URL = 'https://www.whizpoint.app/_next/image?url=%2Ficon.png&w=1920&q=75';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const isRegistered = searchParams.get('registered');
    const isVerified = searchParams.get('verified');
    const emailParam = searchParams.get('email');
    const errorParam = searchParams.get('error');

    if (emailParam) {
      setEmail(emailParam);
    }

    if (isRegistered) {
      setNotification('🎉 Account created! Please check your email inbox to verify your account.');
    } else if (isVerified) {
      setNotification('✅ Email verified successfully! You can now sign in.');
    } else if (errorParam) {
      if (errorParam === 'google_failed' || errorParam === 'google_denied') {
        setError('Google Single Sign-On was cancelled or failed. Please try again.');
      } else {
        setError('Authentication issue encountered. Please sign in again.');
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
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
      toast.success('Welcome back!');

      // Send users to /dashboard (which rewrites to the studio workspace)
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-indigo-300/25 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Main Glassmorphic Card */}
        <div className="bg-white/85 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-8 sm:p-10 transition-all duration-300">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
              <div className="p-2 bg-white rounded-2xl shadow-sm border border-slate-200/60 group-hover:scale-105 transition-transform duration-200">
                <img src={LOGO_URL} alt="Whizpoint" className="h-8 w-auto object-contain" />
              </div>
            </Link>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-100 text-blue-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Publishing Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Sign in to manage your flipbooks and view analytics
            </p>
          </div>

          {/* Registration / Verification Notification Banner */}
          {notification && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{notification}</div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@domain.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In to Workspace
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* SSO Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white/90 px-3 text-slate-400 uppercase tracking-wider font-semibold">
                  or sign in with
                </span>
              </div>
            </div>

            {/* Google SSO Button */}
            <a
              href="/api/auth/google"
              className="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-3 shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </a>

            <p className="pt-2 text-center text-xs text-slate-500">
              Do not have an account yet?{' '}
              <Link href="/auth/signup" className="font-semibold text-blue-600 hover:text-blue-700">
                Create free account
              </Link>
            </p>
          </form>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-slate-400">
          Whizpoint Solutions &bull; Nairobi, Kenya &bull;{' '}
          <Link href="/privacy" className="underline hover:text-slate-600">
            Privacy
          </Link>{' '}
          &bull;{' '}
          <Link href="/terms" className="underline hover:text-slate-600">
            Terms
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
