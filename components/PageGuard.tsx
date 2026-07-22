'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, ShieldAlert, ArrowRight, RefreshCw } from 'lucide-react';
import { checkPageSecurity, verifyPagePasscode } from '@/lib/actions/admin';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface PageGuardProps {
  pagePath: string;
  children: React.ReactNode;
}

export const PageGuard: React.FC<PageGuardProps> = ({ pagePath, children }) => {
  const [checking, setChecking] = useState(true);
  const [locked, setLocked] = useState(false);
  const [lockType, setLockType] = useState<'pin' | 'password'>('pin');
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  // Passcode states
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const inputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  // 1. Initial check on mount
  useEffect(() => {
    const runCheck = async () => {
      // Check session storage first
      const sessionUnlocked = sessionStorage.getItem(`page_unlocked_${pagePath}`);
      if (sessionUnlocked === 'true') {
        setIsUnlocked(true);
        setChecking(false);
        return;
      }

      try {
        const status = await checkPageSecurity(pagePath);
        if (status.locked) {
          setLocked(true);
          setLockType(status.type as 'pin' | 'password');
        } else {
          setIsUnlocked(true); // Path is not protected
        }
      } catch (err) {
        console.error('Error checking page security:', err);
      } finally {
        setChecking(false);
      }
    };

    runCheck();
  }, [pagePath]);

  // 2. PIN auto-submit when all 4 digits are filled
  useEffect(() => {
    if (lockType === 'pin' && pin.every((digit) => digit !== '')) {
      const fullPin = pin.join('');
      handleVerify(fullPin);
    }
  }, [pin, lockType]);

  const handleVerify = async (code: string) => {
    setVerifying(true);
    setErrorMsg(null);
    try {
      const res = await verifyPagePasscode(pagePath, code);
      if (res.success) {
        sessionStorage.setItem(`page_unlocked_${pagePath}`, 'true');
        setIsUnlocked(true);
        toast.success('Access granted!');
      } else {
        setErrorMsg('Incorrect passcode. Please try again.');
        // Clear inputs on failure
        if (lockType === 'pin') {
          setPin(['', '', '', '']);
          inputRefs[0].current?.focus();
        } else {
          setPassword('');
        }
      }
    } catch (err) {
      setErrorMsg('Verification failed. Try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handlePinChange = (index: number, val: string) => {
    // Only accept numeric inputs
    if (val !== '' && !/^\d$/.test(val)) return;

    const newPin = [...pin];
    newPin[index] = val;
    setPin(newPin);

    // Auto-focus next input
    if (val !== '' && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && pin[index] === '' && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs[index - 1].current?.focus();
      const newPin = [...pin];
      newPin[index - 1] = '';
      setPin(newPin);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    handleVerify(password);
  };

  // While performing initial route security check
  if (checking) {
    return (
      <div className="fixed inset-0 bg-[#0a060a] z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
          <span className="text-sm text-gray-500 font-serif italic">Checking security credentials...</span>
        </div>
      </div>
    );
  }

  // If unlocked, simply render child content
  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 bg-[#0c070c] z-50 flex items-center justify-center p-4 select-none">
      {/* Blurred romantic background ambient lights */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none" style={{
        background: `
          radial-gradient(circle at 30% 20%, rgba(88,20,46,0.5), transparent 50%),
          radial-gradient(circle at 70% 80%, rgba(58,15,34,0.4), transparent 50%)
        `
      }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-black/40 border border-rose-500/20 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 text-[#f3e6d8] text-center"
      >
        <div className="mx-auto w-12 h-12 rounded-full bg-[#3a0f22] border border-[#ff7a9a]/20 flex items-center justify-center mb-6">
          <Lock className="w-5 h-5 text-[#ff7a9a]" />
        </div>

        <h2 className="font-serif italic text-2xl md:text-3xl text-[#f3e6d8] mb-2 font-medium">
          Protected Page
        </h2>
        <p className="text-xs text-[#e8a6b8]/60 uppercase tracking-widest mb-6 font-serif">
          passcode required for entry
        </p>

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {lockType === 'pin' ? (
          /* Numeric 4-digit PIN form */
          <div className="space-y-6">
            <div className="flex justify-center gap-3">
              {pin.map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type="text"
                  pattern="\d*"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  disabled={verifying}
                  className="w-12 h-12 rounded-full bg-[#170a14] border border-[#d3a768]/20 focus:border-[#ff7a9a] focus:ring-1 focus:ring-[#ff7a9a] text-[#f3e6d8] text-xl font-bold text-center outline-none transition-all disabled:opacity-50"
                  autoFocus={idx === 0}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 italic">
              {verifying ? 'Verifying PIN...' : 'Enter the 4-digit passcode configured by the admin'}
            </p>
          </div>
        ) : (
          /* Password input form */
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={verifying}
                className="w-full py-3 pl-4 pr-12 rounded-xl bg-[#170a14] border border-[#d3a768]/20 focus:border-[#ff7a9a] focus:ring-1 focus:ring-[#ff7a9a] text-[#f3e6d8] outline-none transition-all disabled:opacity-50 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button
              type="submit"
              disabled={verifying || !password}
              className="w-full bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white rounded-xl py-3 cursor-pointer shadow-sm text-sm"
            >
              {verifying ? (
                <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  Unlock Page <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
