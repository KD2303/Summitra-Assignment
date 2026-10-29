import React, { useEffect, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { ConfettiEffect } from '../components/ConfettiEffect';
import { QRTicket } from '../components/QRTicket';
import { CheckCircle2, Calendar } from 'lucide-react';

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
    <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Confetti Explosion (Respects reduced motion) */}
      <ConfettiEffect />

      {/* Header section with accessible focus */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mb-2 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-[28px] sm:text-[38px] font-extrabold text-white tracking-tight focus:outline-none"
        >
          Booking <span className="text-[#fdda7a]">Confirmed!</span>
        </h1>

        <p className="text-[14px] sm:text-[15px] text-white/60 max-w-lg mx-auto leading-relaxed">
          Your admission has been permanently registered in the Summitra database with row-level ACID locks. Your official digital pass is ready below.
        </p>
      </div>

      {/* QR Ticket Display & PNG Exporter */}
      {booking ? (
        <QRTicket booking={booking} />
      ) : (
        <div className="p-8 text-center bg-[#0d0d12] border border-white/10 rounded-[28px] animate-pulse">
          <p className="text-white/50 text-[14px]">Loading ticket pass details...</p>
        </div>
      )}

      {/* Next Actions */}
      <div className="pt-6 border-t border-white/10 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-[#fdda7a] text-black text-[14px] font-extrabold transition-all shadow-lg hover:scale-105 active:scale-95"
        >
          <Calendar className="w-4 h-4 text-[#8617d0]" />
          <span>Browse Other Summits</span>
        </Link>
        <Link
          to="/"
          className="px-6 py-3 rounded-full text-white/60 hover:text-white text-[14px] font-semibold transition-colors"
        >
          Return to Summitra Home
        </Link>
      </div>
    </main>
  );
}
