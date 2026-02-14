'use client';

import { ReactNode } from 'react';
import { SpiderCursor } from '@/components/ui/spider-cursor';
import { Link } from 'react-router-dom';
import { Gem } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Spider Cursor Background */}
      <SpiderCursor />

      {/* Logo */}
      <div className="fixed top-6 left-6 z-50">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
            <Gem className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">
            ProSpect
          </span>
        </Link>
      </div>

      {/* Form Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        {children}
      </div>
    </div>
  );
}
