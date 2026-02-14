'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { CanvasRevealEffect } from './canvas-reveal-effect';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Gem } from 'lucide-react';

interface SignInFlowProps {
  className?: string;
  mode: 'login' | 'signup';
}

export function SignInFlow({ className, mode }: SignInFlowProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'credentials' | 'loading' | 'success'>('credentials');
  const [initialCanvasVisible, setInitialCanvasVisible] = useState(true);
  const [reverseCanvasVisible, setReverseCanvasVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        // Show success animation
        setReverseCanvasVisible(true);
        setTimeout(() => setInitialCanvasVisible(false), 50);
        setTimeout(() => {
          setStep('success');
          toast({
            title: 'Account created!',
            description: 'Please check your email to verify your account.',
          });
        }, 2000);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Show success animation
        setReverseCanvasVisible(true);
        setTimeout(() => setInitialCanvasVisible(false), 50);
        setTimeout(() => {
          setStep('success');
          setTimeout(() => navigate('/'), 1000);
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('min-h-screen w-full relative overflow-hidden bg-black', className)}>
      {/* Canvas Background */}
      <div className="absolute inset-0">
        {initialCanvasVisible && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: reverseCanvasVisible ? 0 : 1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <CanvasRevealEffect
              animationSpeed={5}
              containerClassName="bg-black"
              colors={[[59, 130, 246]]}
              dotSize={3}
            />
          </motion.div>
        )}

        {reverseCanvasVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <CanvasRevealEffect
              animationSpeed={10}
              containerClassName="bg-black"
              colors={[[34, 197, 94]]}
              dotSize={3}
              reverse
            />
          </motion.div>
        )}

        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top navigation */}
        <div className="fixed top-6 left-6 z-50">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <Gem className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              ProSpect
            </span>
          </Link>
        </div>

        {/* Main content container */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              {step === 'credentials' ? (
                <motion.div
                  key="credentials"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-gray-400">
                      {mode === 'login'
                        ? 'Sign in to continue'
                        : 'Sign up to get started'}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="w-full flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full py-3 px-4 text-white hover:bg-white/20 transition-colors"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Sign in with Google
                    </button>

                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-white/20" />
                      <span className="text-gray-500 text-sm">or</span>
                      <div className="flex-1 h-px bg-white/20" />
                    </div>

                    <div className="space-y-3">
                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border-white/30 placeholder:text-gray-500"
                        required
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border-white/30 placeholder:text-gray-500"
                        required
                        minLength={6}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !email || !password}
                      className={cn(
                        'w-full rounded-full py-3 px-4 font-medium transition-all',
                        email && password && !isLoading
                          ? 'bg-white text-black hover:bg-white/90'
                          : 'bg-white/20 text-white/50 cursor-not-allowed'
                      )}
                    >
                      {isLoading
                        ? 'Loading...'
                        : mode === 'login'
                        ? 'Sign In'
                        : 'Create Account'}
                    </button>
                  </form>

                  <p className="mt-6 text-gray-500 text-sm">
                    {mode === 'login' ? (
                      <>
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-primary hover:underline">
                          Sign up
                        </Link>
                      </>
                    ) : (
                      <>
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:underline">
                          Sign in
                        </Link>
                      </>
                    )}
                  </p>

                  <p className="mt-8 text-gray-600 text-xs max-w-sm mx-auto">
                    By signing up, you agree to the Terms of Service and Privacy Policy.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {mode === 'login' ? "You're in!" : 'Account Created!'}
                    </h1>
                    <p className="text-gray-400">
                      {mode === 'login'
                        ? 'Redirecting...'
                        : 'Check your email to verify'}
                    </p>
                  </div>

                  <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>

                  {mode === 'signup' && (
                    <button
                      onClick={() => navigate('/login')}
                      className="bg-white text-black rounded-full py-3 px-8 font-medium hover:bg-white/90 transition-colors"
                    >
                      Go to Login
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
