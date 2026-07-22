'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Eye, EyeOff, Check, X } from 'lucide-react';
import { changeCurrentUserPassword } from '@/lib/actions/auth';
import { toast } from 'sonner';

export default function ChangePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Password validation checks
  const validations = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    notDefault: password !== 'Passw0rd@1',
  };

  const isFormValid =
    validations.length &&
    validations.uppercase &&
    validations.lowercase &&
    validations.number &&
    validations.special &&
    validations.notDefault &&
    password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    try {
      const res = await changeCurrentUserPassword(password);
      if (res.success) {
        toast.success('Password updated successfully!');
        router.push('/dashboard');
      } else {
        toast.error(res.error || 'Failed to update password');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ValidationRow = ({ checked, text }: { checked: boolean; text: string }) => (
    <div className="flex items-center gap-2 text-xs">
      {checked ? (
        <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
      ) : (
        <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
      )}
      <span className={checked ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
        {text}
      </span>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-rose-50 via-white to-purple-50">
      <Card className="w-full max-w-md border border-rose-200 shadow-xl bg-white/90 backdrop-blur-md rounded-2xl">
        <CardHeader className="text-center pt-8">
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
            <KeyRound className="w-6 h-6 text-rose-600" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-rose-950 font-serif">
            Update Password
          </CardTitle>
          <CardDescription className="text-rose-900/60 mt-1">
            You must change your default password before proceeding
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 rounded-xl border-gray-300 focus:border-rose-400 focus:ring-rose-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-xl border-gray-300 focus:border-rose-400 focus:ring-rose-400"
                required
              />
            </div>

            {/* Live validations checklist */}
            {password.length > 0 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-950/40 rounded-xl border border-gray-100 space-y-1.5">
                <ValidationRow checked={validations.length} text="At least 8 characters long" />
                <ValidationRow checked={validations.uppercase} text="Contains an uppercase letter (A-Z)" />
                <ValidationRow checked={validations.lowercase} text="Contains a lowercase letter (a-z)" />
                <ValidationRow checked={validations.number} text="Contains a digit (0-9)" />
                <ValidationRow checked={validations.special} text="Contains a special character (e.g. @, $, !, %)" />
                <ValidationRow checked={validations.notDefault} text="Is not the default password 'Passw0rd@1'" />
                <ValidationRow
                  checked={confirmPassword.length > 0 && password === confirmPassword}
                  text="Passwords match"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={!isFormValid || loading}
              className="w-full mt-4 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white rounded-xl py-3.5 font-medium transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
