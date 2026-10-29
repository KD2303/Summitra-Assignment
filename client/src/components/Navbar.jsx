import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Menu, X, Shield, Sparkles } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Trap focus and handle Escape key for mobile menu accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const navLinks = [
    { name: 'Discover Events', path: '/events' },
    { name: 'Architecture', path: '/#features' },
    { name: 'Admin Portal', path: '/admin' }
  ];

  return (
    <>
      {/* WCAG 2.2 Skip to content link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus-visible:ring-2 focus-visible:ring-brand-light rounded-md px-1 py-1"
            aria-label="Summitra Homepage"
          >
            <div className="w-10 h-10 rounded-xl bg-surface-raised flex items-center justify-center group-hover:bg-surface-strong transition-colors duration-fast shadow-[0_0_20px_rgba(134,23,208,0.5)]">
              <Sparkles className="w-5 h-5 text-text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-text-primary flex items-center gap-1.5">
                SUMMITRA
                <span className="inline-block w-2 h-2 rounded-full bg-feedback-success animate-pulse" title="Real-time WebSocket Live" />
              </span>
              <span className="text-xs text-text-tertiary tracking-wide uppercase font-semibold">
                Smart Event Booking
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`text-sm font-semibold transition-colors duration-fast relative py-1 focus-visible:ring-2 focus-visible:ring-brand-light rounded ${
                    isActive
                      ? 'text-text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-surface-raised'
                      : 'text-text-tertiary hover:text-text-primary'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Primary CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/events"
              className="px-6 py-2.5 rounded-xl bg-surface-raised hover:bg-surface-strong text-text-primary text-sm font-bold transition-all duration-fast transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-brand-light flex items-center gap-2 shadow-[0_4px_14px_rgba(134,23,208,0.39)]"
            >
              <Calendar className="w-4 h-4" />
              Browse Events
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-lg text-text-tertiary hover:text-text-primary bg-surface-card border border-surface-border focus-visible:ring-2 focus-visible:ring-brand-light min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div
            id="mobile-navigation"
            className="md:hidden border-b border-surface-border bg-black/95 px-4 pt-4 pb-6 space-y-4 shadow-2xl"
          >
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="px-4 py-3 rounded-lg text-base font-semibold text-text-primary hover:bg-surface-card transition-colors min-h-[44px] flex items-center"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/events"
                className="w-full mt-2 px-5 py-3 rounded-xl bg-surface-raised text-center text-text-primary font-bold shadow-[0_4px_14px_rgba(134,23,208,0.39)] min-h-[44px] flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Browse Events
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
