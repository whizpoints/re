'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthSplitView } from '@/components/auth/auth-split-view';
import { Loader2 } from 'lucide-react';

function LoginWrapper() {
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get('registered');
  const isVerified = searchParams.get('verified');
  const emailParam = searchParams.get('email') || '';
  const errorParam = searchParams.get('error');

  let notification: string | null = null;
  if (isRegistered) {
    notification = 'Account registered successfully. Please verify your email via the link sent to your inbox.';
  } else if (isVerified) {
    notification = 'Email address verified successfully. You may now sign in to your workspace.';
  }

  let error: string | null = null;
  if (errorParam) {
    if (errorParam === 'google_failed' || errorParam === 'google_denied') {
      error = 'Google Single Sign-On was cancelled or declined. Please try again.';
    } else {
      error = 'Authentication session expired or encountered an issue. Please sign in.';
    }
  }

  return (
    <AuthSplitView
      initialMode="login"
      notification={notification}
      errorParam={error}
      emailParam={emailParam}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      }
    >
      <LoginWrapper />
    </Suspense>
  );
}
