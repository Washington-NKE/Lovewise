'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export default function SignupDisabledPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-rose-50 via-white to-purple-50">
      <Card className="w-full max-w-md border border-rose-200 shadow-xl bg-white/90 backdrop-blur-md rounded-2xl">
        <CardHeader className="text-center pt-8">
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-rose-500" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-rose-950 font-serif">
            Registration Disabled
          </CardTitle>
          <CardDescription className="text-rose-900/60 mt-1">
            Accounts cannot be created publicly
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pb-8 space-y-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            Public sign-ups have been disabled in this system. All accounts are managed and added directly by the administrator via the dashboard.
          </p>
          <div className="pt-2">
            <Link
              href="/signin"
              className="inline-flex justify-center items-center px-6 py-2.5 rounded-xl border border-rose-300 text-rose-600 font-semibold text-sm hover:bg-rose-50 transition-colors shadow-sm"
            >
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}