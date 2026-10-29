import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { EventCard } from '../components/EventCard';
import {
  Sparkles,
  Shield,
  Zap,
  QrCode,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Flame
} from 'lucide-react';

export function LandingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['featured-events'],
    queryFn: () => api.getEvents({ limit: 3 })
  });

  const featuredEvents = data?.events || [];

  return (
    <main id="main-content" className="space-y-24 sm:space-y-32 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-28 pb-12 sm:pb-20 text-center px-4 sm:px-6 lg:px-8">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-purple/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-surface-raised/40 bg-surface-card/80 backdrop-blur-sm text-brand-light text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(134,23,208,0.3)]">
            <Sparkles className="w-4 h-4 text-brand-light animate-pulse" />
            <span>Zero Overselling • Real-Time ACID Seat Engine</span>
          </div>

          {/* Fluid Heading */}
          <h1 className="font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-text-primary leading-[1.08]">
            Next-Gen Tech Summits,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light via-purple-300 to-white">
              Instant Confirmed
            </span>{' '}
            Tickets.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-text-tertiary max-w-2xl mx-auto leading-relaxed">
            Discover premier engineering conferences and leadership symposiums. Powered by atomic row-locking concurrency control, live WebSocket seat feeds, and verifiable QR tickets.
          </p>

          {/* Primary & Secondary Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/events"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-surface-raised hover:bg-surface-strong text-text-primary text-base font-bold shadow-[0_8px_30px_rgba(134,23,208,0.45)] transition-all duration-fast transform hover:-translate-y-1 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-brand-light flex items-center justify-center gap-2 min-h-[48px]"
            >
              <span>Explore All Events</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-xl border-2 border-surface-border hover:border-brand-light/50 bg-surface-card/50 text-text-primary text-base font-bold transition-all duration-fast transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-brand-light flex items-center justify-center gap-2 min-h-[48px]"
            >
              <span>How It Works</span>
            </a>
          </div>

          {/* Platform Stat Pills */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl border border-surface-border bg-surface-card/40 backdrop-blur-sm">
              <span className="text-2xl sm:text-3xl font-extrabold text-text-primary block">0.00%</span>
              <span className="text-xs text-text-tertiary font-semibold uppercase tracking-wider">Oversell Rate</span>
            </div>
            <div className="p-4 rounded-2xl border border-surface-border bg-surface-card/40 backdrop-blur-sm">
              <span className="text-2xl sm:text-3xl font-extrabold text-brand-light block">&lt; 1s</span>
              <span className="text-xs text-text-tertiary font-semibold uppercase tracking-wider">Seat Sync Latency</span>
            </div>
            <div className="p-4 rounded-2xl border border-surface-border bg-surface-card/40 backdrop-blur-sm">
              <span className="text-2xl sm:text-3xl font-extrabold text-text-primary block">100%</span>
              <span className="text-xs text-text-tertiary font-semibold uppercase tracking-wider">ACID Guaranteed</span>
            </div>
            <div className="p-4 rounded-2xl border border-surface-border bg-surface-card/40 backdrop-blur-sm">
              <span className="text-2xl sm:text-3xl font-extrabold text-brand-light block">Instant</span>
              <span className="text-xs text-text-tertiary font-semibold uppercase tracking-wider">QR Generation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase font-extrabold tracking-widest text-brand-light mb-2">
              <Flame className="w-4 h-4 text-brand-light" />
              <span>Trending Now</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              Featured Tech Summits
            </h2>
          </div>

          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-light hover:text-white transition-colors underline-offset-4 hover:underline"
          >
            <span>View all upcoming events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <EventCard key={i} loading={true} />
              ))
            : featuredEvents.map((evt) => (
                <EventCard key={evt.id} event={evt} />
              ))}
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs uppercase font-extrabold tracking-widest text-brand-light block">
            Engineered For Scale
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
            Built on Mission-Critical Architecture
          </h2>
          <p className="text-text-tertiary text-sm sm:text-base leading-relaxed">
            Standard booking sites crumble during ticket drop spikes. Summitra solves overselling and race conditions at the database transaction layer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl border border-surface-border bg-surface-card hover:border-brand-purple/60 transition-all duration-base flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-surface-raised/20 border border-brand-purple/40 flex items-center justify-center text-brand-light">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-text-primary">
                Row-Lock Concurrency Protection
              </h3>
              <p className="text-sm text-text-tertiary leading-relaxed">
                Every booking runs inside an atomic SQL transaction with <code>SELECT ... FOR UPDATE</code>. Parallel checkout requests queue deterministically so seats never drop below zero.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-surface-border/50 text-xs text-brand-light font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-feedback-success" />
              Verified by Concurrency Stress Test
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl border border-surface-border bg-surface-card hover:border-brand-purple/60 transition-all duration-base flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-surface-raised/20 border border-brand-purple/40 flex items-center justify-center text-brand-light">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-text-primary">
                Sub-Second Socket.IO Sync
              </h3>
              <p className="text-sm text-text-tertiary leading-relaxed">
                Room-based WebSocket architecture emits immediate seat count deltas upon transaction commit. All open browsers update live without requiring manual page refresh.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-surface-border/50 text-xs text-brand-light font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-feedback-success" />
              Auto-reconnect with fresh state
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl border border-surface-border bg-surface-card hover:border-brand-purple/60 transition-all duration-base flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-surface-raised/20 border border-brand-purple/40 flex items-center justify-center text-brand-light">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-text-primary">
                Instant QR Verification & PNG Export
              </h3>
              <p className="text-sm text-text-tertiary leading-relaxed">
                Attendee tickets generate instant cryptographically verifiable QR codes directly on the client. Attendees can download high-resolution PNG passes for offline entry.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-surface-border/50 text-xs text-brand-light font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-feedback-success" />
              Accessible text equivalent included
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="relative rounded-3xl border border-surface-raised/50 bg-gradient-to-r from-surface-raised/30 via-black to-surface-strong/30 p-10 sm:p-16 text-center overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
              Ready to Secure Your Pass?
            </h2>
            <p className="text-sm sm:text-base text-text-tertiary">
              Browse world-class technical summits, view interactive venue locations on Google Maps, and checkout in under 60 seconds.
            </p>
            <div className="pt-2">
              <Link
                to="/events"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-surface-raised hover:bg-surface-strong text-text-primary text-base font-bold shadow-[0_4px_25px_rgba(134,23,208,0.5)] transition-all duration-fast transform hover:-translate-y-0.5 active:translate-y-0 min-h-[48px]"
              >
                <span>Browse All Upcoming Events</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
