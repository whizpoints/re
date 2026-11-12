'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthSplitView } from '@/components/auth/auth-split-view';
import { Loader2 } from 'lucide-react';

function SignupWrapper() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  return (
    <AuthSplitView
      initialMode="signup"
      emailParam={emailParam}
    />
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      }
    >
      <SignupWrapper />
    </Suspense>
  );
}
