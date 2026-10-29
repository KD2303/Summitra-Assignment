import React, { useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, RefreshCw, Calendar } from 'lucide-react';

export function BookingFailurePage() {
  const location = useLocation();
  const headingRef = useRef(null);

  const errorState = location.state || {};
  const { eventId, eventTitle, message, code } = errorState;

  // Set focus on heading on mount (WCAG 2.2 AA)
  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, []);

  return (
    <main id="main-content" className="max-w-xl mx-auto px-4 py-20 text-center space-y-8">
      {/* Alert Icon */}
      <div
        role="alert"
        aria-live="assertive"
        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-feedback-error/20 border border-feedback-error text-feedback-error mb-2 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
      >
        <AlertTriangle className="w-10 h-10" />
      </div>

      {/* Heading with accessible focus */}
      <div className="space-y-3">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight focus:outline-none"
        >
          Booking Failed
        </h1>

        {/* Actionable plain-language message per DESIGN.md tone rules */}
        <p className="text-base text-text-tertiary leading-relaxed">
          {message ||
            'We were unable to complete your reservation because the requested seats were booked by another attendee moments ago.'}
        </p>

        {eventTitle && (
          <p className="text-sm font-semibold text-brand-light">
            Event: {eventTitle}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        {eventId && (
          <Link
            to={`/events/${eventId}`}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-surface-raised hover:bg-surface-strong text-text-primary text-sm font-bold shadow-[0_4px_20px_rgba(134,23,208,0.4)] transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again (Choose Fewer Tickets)</span>
          </Link>
        )}

        <Link
          to="/events"
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-surface-card hover:bg-surface-subtle border border-surface-border text-text-primary text-sm font-bold transition-all flex items-center justify-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          <span>Browse Other Summits</span>
        </Link>
      </div>
    </main>
  );
}
