import React, { useEffect, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { ConfettiEffect } from '../components/ConfettiEffect';
import { QRTicket } from '../components/QRTicket';
import { CheckCircle2, ArrowRight, Calendar, Sparkles } from 'lucide-react';

export function BookingSuccessPage() {
  const { id } = useParams();
  const location = useLocation();
  const headingRef = useRef(null);

  const passedBooking = location.state?.booking;

  const { data } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => api.getBookingById(id),
    enabled: !passedBooking
  });

  const booking = passedBooking || data?.booking;

  // Move keyboard focus to heading on mount for screen readers (WCAG 2.2 AA)
  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, []);

  return (
    <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Confetti Explosion (Respects reduced motion) */}
      <ConfettiEffect />

      {/* Header section with accessible focus */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-feedback-success/20 border border-feedback-success text-feedback-success mb-2 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight focus:outline-none"
        >
          Booking Confirmed!
        </h1>

        <p className="text-sm sm:text-base text-text-tertiary max-w-md mx-auto">
          Your admission has been permanently registered in the Summitra database. A copy of your pass is ready below.
        </p>
      </div>

      {/* QR Ticket Display & PNG Exporter */}
      {booking ? (
        <QRTicket booking={booking} />
      ) : (
        <div className="p-8 text-center bg-surface-card rounded-2xl animate-pulse">
          <p className="text-text-tertiary">Loading ticket pass details...</p>
        </div>
      )}

      {/* Next Actions */}
      <div className="pt-8 border-t border-surface-border text-center flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/events"
          className="px-6 py-3 rounded-xl bg-surface-card hover:bg-surface-subtle border border-surface-border text-text-primary text-sm font-bold transition-colors inline-flex items-center gap-2"
        >
          <Calendar className="w-4 h-4 text-brand-light" />
          Browse Other Events
        </Link>
        <Link
          to="/"
          className="px-6 py-3 rounded-xl text-text-tertiary hover:text-text-primary text-sm font-semibold transition-colors"
        >
          Return to Summitra Home
        </Link>
      </div>
    </main>
  );
}
