'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Chrome } from 'lucide-react';

interface SignInFormProps {
  className?: string;
}

export function SignInForm({ className }: SignInFormProps) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'success'>('email');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setStep('code');
  };

  useEffect(() => {
    if (step === 'code') {
      setTimeout(() => codeInputRefs.current[0]?.focus(), 500);
    }
  }, [step]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) codeInputRefs.current[index + 1]?.focus();
      if (index === 5 && value && newCode.every(d => d.length === 1)) {
        setTimeout(() => setStep('success'), 1000);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="relative w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 'email' ? (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-background/40 backdrop-blur-md border border-border/30 rounded-2xl p-8"
            >
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Welcome Back
                </h2>
                <p className="text-muted-foreground text-sm">
                  Sign in to access your dashboard
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background/20 border border-border/30 rounded-lg py-3 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    required
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground p-2 rounded-md hover:bg-primary/90 transition-colors"
                  >
                    →
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <button 
                  type="button"
                  className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-3 px-4 rounded-lg font-medium hover:bg-foreground/90 transition-colors"
                >
                  <Chrome className="h-5 w-5" />
                  Sign in with Google
                </button>
              </div>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </motion.div>
          ) : step === 'code' ? (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-background/40 backdrop-blur-md border border-border/30 rounded-2xl p-8"
            >
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Check your inbox
                </h2>
                <p className="text-muted-foreground text-sm">
                  Enter the code sent to {email}
                </p>
              </div>

              <div className="flex justify-center gap-2 mb-6">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { codeInputRefs.current[i] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-10 h-12 text-center text-xl bg-background/20 border border-border/30 rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to email
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-background/40 backdrop-blur-md border border-border/30 rounded-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-2xl">✓</span>
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Access Granted
              </h2>
              <Link
                to="/"
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Go to Dashboard
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
