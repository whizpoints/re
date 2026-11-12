'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const LOGO_URL = 'https://www.whizpoint.app/_next/image?url=%2Ficon.png&w=1920&q=75';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<'verifying' | 'syncing' | 'redirecting' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const name = searchParams.get('name');

    if (!token) {
      setPhase('error');
      setErrorMessage('Google authentication could not be completed.');
      return;
    }

    // Phase 1: verifying
    const timer1 = setTimeout(() => {
      try {
        localStorage.setItem('auth_token', token);
        setPhase('syncing');
      } catch (err) {
        console.error(err);
      }
    }, 400);

    // Phase 2: syncing and transitioning to studio
    const timer2 = setTimeout(() => {
      setPhase('redirecting');
    }, 900);

    // Phase 3: perform router transition
    const timer3 = setTimeout(() => {
      router.replace('/dashboard');
    }, 1400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden text-slate-100">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-700/60 shadow-2xl rounded-3xl p-8 text-center">
          {/* Logo with pulsing glow ring */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 rounded-2xl bg-blue-500/30 blur-md animate-pulse" />
            <div className="relative p-3 bg-white rounded-2xl shadow-md border border-white/20">
              <img src={LOGO_URL} alt="Whizpoint" className="h-9 w-auto object-contain" />
            </div>
          </div>

          {phase !== 'error' ? (
            <>
              <h2 className="text-xl font-bold text-white tracking-tight mb-2">
                Authenticating Session
              </h2>
              <p className="text-xs text-slate-400 mb-6 font-mono">
                {phase === 'verifying' && 'Validating Google credentials...'}
                {phase === 'syncing' && 'Synchronizing publisher workspace...'}
                {phase === 'redirecting' && 'Launching Flipbook Studio...'}
              </p>

              {/* High-tech smooth progress bar */}
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-6 border border-slate-700/60">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full transition-all duration-500 ease-out rounded-full"
                  style={{
                    width:
                      phase === 'verifying' ? '35%' : phase === 'syncing' ? '75%' : '100%',
                  }}
                />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Encrypted 256-bit Token Exchange</span>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Authentication Failed</h2>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                {errorMessage || 'Unable to complete sign-in. Please try again.'}
              </p>
              <Link
                href="/auth/login"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md"
              >
                Return to Login
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
