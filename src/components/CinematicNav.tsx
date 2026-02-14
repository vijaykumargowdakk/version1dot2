import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Gem, Menu, X, LogIn, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';

const publicNavLinks = [
  { to: '/', label: 'New Scan' },
  { to: '/history', label: 'History' },
];

const authNavLinks = [
  { to: '/settings', label: 'Settings' },
];

export function CinematicNav() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, signOut, loading } = useAuth();

  const navLinks = isAuthenticated 
    ? [...publicNavLinks, ...authNavLinks] 
    : publicNavLinks;

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-8 py-4 md:py-6 backdrop-blur-sm bg-background/10 border-b border-border/10">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
            <Gem className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">
            ProSpect
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-2 md:gap-6">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg",
                location.pathname === to
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              )}
            >
              {label}
            </Link>
          ))}
          
          {!loading && (
            isAuthenticated ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-foreground/5"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-foreground/5"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            )
          )}
          <ThemeToggle />
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-foreground hover:bg-foreground/5 transition-colors"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-20 left-4 right-4 bg-background/90 backdrop-blur-md border border-border/30 rounded-2xl p-4 space-y-2">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block text-base font-medium px-4 py-3 rounded-lg transition-colors",
                  location.pathname === to
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:bg-foreground/5"
                )}
              >
                {label}
              </Link>
            ))}
            
            {!loading && (
              isAuthenticated ? (
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 text-base font-medium text-foreground px-4 py-3 rounded-lg hover:bg-foreground/5 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-base font-medium text-foreground px-4 py-3 rounded-lg hover:bg-foreground/5 transition-colors"
                >
                  <LogIn className="h-5 w-5" />
                  Login
                </Link>
              )
            )}
            
            <div className="px-4 pt-2 border-t border-border/30">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
