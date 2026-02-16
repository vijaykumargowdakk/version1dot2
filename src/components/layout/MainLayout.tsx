'use client';

import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { SplineScene } from '@/components/ui/splite';
import { SpotlightNew } from '@/components/ui/spotlight-new';
import { BackgroundPaths } from '@/components/ui/background-paths';
import { CinematicNav } from '@/components/CinematicNav';

interface MainLayoutProps {
  children: ReactNode;
  showStatusFooter?: boolean;
}

export function MainLayout({ children, showStatusFooter = false }: MainLayoutProps) {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="relative w-full min-h-screen bg-background/80 overflow-x-hidden">
      {isHomePage ? (
        <>
          {/* Home: Mouse-following Spotlight */}
          <SpotlightNew size={500} />

          {/* Home: Fullscreen 3D Robot Background */}
          <div className="fixed inset-0 w-full h-full z-30 flex items-center justify-center">
            <SplineScene 
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          </div>

          {/* Home: Gradient Overlay for text legibility */}
          <div 
            className="fixed inset-0 z-40 pointer-events-none"
            style={{
              background: 'linear-gradient(to right, hsl(var(--background)) 0%, hsl(var(--background) / 0.7) 30%, transparent 60%, hsl(var(--background) / 0.4) 100%)'
            }}
          />
        </>
      ) : (
        /* Non-home pages: Animated path lines background */
        <BackgroundPaths />
      )}

      {/* Navigation - z-[60] ensures it's always clickable above content */}
      <div className="relative z-[60]">
        <CinematicNav />
      </div>

      {/* Page Content */}
      <main className={`relative z-50 pt-24 min-h-screen ${isHomePage ? 'pointer-events-none' : ''}`}>
        {children}
      </main>
    </div>
  );
}
