'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, ArrowRight, RotateCw, AlertCircle, ShieldAlert } from 'lucide-react';
import { NavigationHeader } from '@/components/navigation-header';
import { toast } from 'react-hot-toast';

function UnverifiedContent() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const [loading, setLoading] = useState(false);
  const [emailToResend, setEmailToResend] = useState(initialEmail);
  const [showEdit, setShowEdit] = useState(!initialEmail);

  const handleResend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!emailToResend || !emailToResend.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToResend }),
      });

      if (res.ok) {
        toast.success('Verification email sent to your inbox');
        setShowEdit(false);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to dispatch verification email');
      }
    } catch {
      toast.error('Network error dispatching verification email');
    } finally {
      setLoading(false);
    }
  };

  const getEmailProviderLink = (email: string) => {
    if (email.includes('@gmail.com')) return 'https://mail.google.com/';
    if (email.includes('@yahoo.com')) return 'https://mail.yahoo.com/';
    if (email.includes('@outlook.com') || email.includes('@hotmail.com')) return 'https://outlook.live.com/';
    return `mailto:${email}`;
  };

  return (
    <div className="w-full max-w-md relative z-10">
      <div className="bg-white/90 backdrop-blur-2xl border border-white/70 shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-3xl p-6 sm:p-8 text-center transition-all duration-300">
        <div className="w-14 h-14 bg-amber-50 rounded-2xl border border-amber-200/70 flex items-center justify-center mx-auto mb-5 text-amber-600 shadow-sm">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
          Verify Your Account
        </h2>

        {!showEdit ? (
          <>
            <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
              A verification link was dispatched to{' '}
              <span className="font-semibold text-slate-800 font-mono">{emailToResend}</span>.
              Please verify your email address to access your publishing studio.
            </p>

            <div className="space-y-2.5">
              <a
                href={getEmailProviderLink(emailToResend)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Open Mail Application</span>
              </a>

              <button
                type="button"
                onClick={() => handleResend()}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-xs hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <span>Resend Verification Link</span>
                )}
              </button>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Incorrect email?</span>
              <button
                type="button"
                onClick={() => setShowEdit(true)}
                className="text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                Update Email Address
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleResend} className="text-left space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Enter correct email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={emailToResend}
                  onChange={(e) => setEmailToResend(e.target.value)}
                  required
                  placeholder="publisher@whizpoint.app"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {loading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <span>Send Link</span>}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-4 text-xs">
          <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
            Return to Login
          </Link>
          <span className="text-slate-300">&bull;</span>
          <Link href="/" className="text-slate-500 hover:underline">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function UnverifiedPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans relative overflow-hidden">
      <NavigationHeader showFullNav={false} />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 pt-16 sm:pt-20">
        <Suspense
          fallback={
            <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center">
              <RotateCw className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          }
        >
          <UnverifiedContent />
        </Suspense>
      </main>
    </div>
  );
}
