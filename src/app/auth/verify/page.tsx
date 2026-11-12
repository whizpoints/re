'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  RotateCw,
  Sparkles,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { NavigationHeader } from '@/components/navigation-header';
import { toast } from 'react-hot-toast';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(2);
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          if (data.token) {
            localStorage.setItem('auth_token', data.token);
          }
          setStatus('success');
          setMessage('Email address verified successfully. Welcome to Whizpoint Flipbook.');
          toast.success('Email verified successfully');
        } else {
          setStatus('error');
          setMessage(data.error || 'This verification link is invalid or has already expired.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Network error verifying your account. Please try again.');
      });
  }, [token]);

  // Automated redirect timer upon successful verification
  useEffect(() => {
    if (status !== 'success') return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          const authToken = localStorage.getItem('auth_token');
          if (authToken) {
            router.push('/dashboard');
          } else {
            router.push('/auth/login?verified=true');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, router]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail || !resendEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setIsResending(true);
    try {
      const res = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('New verification link sent to your inbox.');
      } else {
        toast.error(data.error || 'Failed to resend link');
      }
    } catch {
      toast.error('Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10">
      <div className="bg-white/85 backdrop-blur-2xl border border-white/70 shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-3xl p-6 sm:p-8 text-center transition-all duration-300">
        {status === 'loading' && (
          <div className="py-6 space-y-4">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Verifying Credentials</h2>
              <p className="text-xs text-slate-500 mt-1">
                Authenticating token against cryptographic keystore...
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="py-4 space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl animate-pulse" />
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-sm relative z-10">
                <CheckCircle2 className="w-9 h-9" />
              </div>
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Identity Confirmed
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Account Verified
              </h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {message}
              </p>
            </div>

            {/* Countdown Badge */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Automatic workspace launch</span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono font-bold text-blue-600">
                {countdown}s
              </span>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer group"
            >
              <span>Launch Studio Immediately</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="py-4 space-y-5 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 mx-auto shadow-sm">
              <AlertCircle className="w-9 h-9" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold mb-2">
                Token Invalid or Expired
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Verification Expired
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {message}
              </p>
            </div>

            {/* Quick Resend Form */}
            <form onSubmit={handleResend} className="text-left space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-700">
                Request a new verification link
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isResending}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isResending ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Dispatching Link...</span>
                  </>
                ) : (
                  <span>Send New Verification Link</span>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-4 text-xs font-medium">
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Return to Login
              </Link>
              <span className="text-slate-300">&bull;</span>
              <Link href="/" className="text-slate-500 hover:underline">
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 font-sans relative overflow-hidden">
      <NavigationHeader showFullNav={false} />

      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-indigo-200/25 rounded-full blur-3xl pointer-events-none" />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 pt-24 sm:pt-28">
        <Suspense
          fallback={
            <div className="w-16 h-16 rounded-2xl bg-white/70 backdrop-blur-md flex items-center justify-center shadow-lg">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          }
        >
          <VerifyContent />
        </Suspense>
      </main>
    </div>
  );
}
