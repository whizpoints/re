'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, RotateCw, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { NavigationHeader } from '@/components/navigation-header';
import { toast } from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to request password reset');
      }

      setSuccess(true);
      toast.success('Password reset link sent to your inbox');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans relative overflow-hidden">
      <NavigationHeader showFullNav={false} />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 pt-24 sm:pt-28">
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/90 backdrop-blur-2xl border border-white/70 shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-3xl p-6 sm:p-8 text-center transition-all duration-300">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl border border-blue-200/70 flex items-center justify-center mx-auto mb-5 text-blue-600 shadow-sm">
              <KeyRound className="w-7 h-7" />
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
              Reset Password
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
              Enter your registered work email and we will send you a cryptographically secure link to reset your password.
            </p>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 text-left">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs text-left flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    A password reset link has been dispatched to{' '}
                    <strong className="font-mono">{email}</strong>. Please check your inbox and spam folder.
                  </div>
                </div>

                <Link
                  href="/auth/login"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm"
                >
                  <span>Return to Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="text-left space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Account Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="publisher@whizpoint.app"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Reset Link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Recovery Link</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-4 text-xs font-medium">
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Return to Login
              </Link>
              <span className="text-slate-300">&bull;</span>
              <Link href="/" className="text-slate-500 hover:underline">
                Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
