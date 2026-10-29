import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Cpu, Github, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-surface-border bg-black text-text-tertiary mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-raised flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-text-primary" />
              </div>
              <span className="font-extrabold text-lg text-text-primary tracking-tight">SUMMITRA</span>
            </div>
            <p className="text-sm max-w-sm text-text-tertiary leading-relaxed">
              Enterprise-grade smart event booking engine engineered with atomic row locking, zero overselling guarantees, and sub-second WebSocket seat synchronization.
            </p>
            <div className="flex items-center gap-4 text-xs text-text-tertiary pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-card border border-surface-border text-feedback-success font-semibold">
                <span className="w-2 h-2 rounded-full bg-feedback-success animate-pulse" />
                Socket.IO Synchronized
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-card border border-surface-border text-brand-light font-semibold">
                <Shield className="w-3.5 h-3.5" />
                Row-Level ACID Locks
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-text-primary font-bold text-sm tracking-wider uppercase mb-4">
              Platform
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/events" className="hover:text-text-primary transition-colors underline-offset-4 hover:underline">
                  Upcoming Summits
                </Link>
              </li>
              <li>
                <Link to="/#features" className="hover:text-text-primary transition-colors underline-offset-4 hover:underline">
                  Anti-Oversell Engine
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-text-primary transition-colors underline-offset-4 hover:underline">
                  Admin Management
                </Link>
              </li>
            </ul>
          </div>

          {/* Accessibility & Standard */}
          <div>
            <h3 className="text-text-primary font-bold text-sm tracking-wider uppercase mb-4">
              Compliance
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2 text-text-primary font-medium">
                <span className="w-2 h-2 rounded-full bg-feedback-success" />
                WCAG 2.2 AA Certified
              </li>
              <li>Keyboard Navigation First</li>
              <li>Screen Reader Tested (NVDA/VoiceOver)</li>
              <li>Prefers-Reduced-Motion Compliant</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-surface-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-text-tertiary gap-4">
          <p>© {new Date().getFullYear()} Summitra Event Systems. Built for high-concurrency event operations.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-text-primary transition-colors">Privacy Policy</span>
            <span className="hover:text-text-primary transition-colors">Terms of Service</span>
            <span className="hover:text-text-primary transition-colors">Accessibility Statement</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
