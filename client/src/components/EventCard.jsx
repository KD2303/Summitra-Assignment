import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowRight, Sparkles, Shield } from 'lucide-react';
import { SeatIndicator } from './SeatIndicator';

/**
 * EventCard
 * Premium animated event card with live seat status, glassmorphic badges,
 * hover elevation, and signature Summitra pill CTA button.
 */
export function EventCard({ event, loading = false, error = false, onRetry }) {
  if (loading) {
    return (
      <div
        className="rounded-[24px] border border-white/5 bg-[#0e0e12] p-5 flex flex-col justify-between h-[490px] animate-pulse"
        aria-busy="true"
        aria-label="Loading summit details"
      >
        <div className="w-full h-52 bg-white/5 rounded-2xl mb-5" />
        <div className="space-y-3 flex-1">
          <div className="h-4 bg-white/5 rounded w-1/3" />
          <div className="h-6 bg-white/5 rounded w-4/5" />
          <div className="h-4 bg-white/5 rounded w-full" />
          <div className="h-4 bg-white/5 rounded w-2/3" />
        </div>
        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="h-8 bg-white/5 rounded w-24" />
          <div className="h-10 bg-white/5 rounded-full w-32" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-rose-500/30 bg-[#0e0e12] p-8 flex flex-col items-center justify-center text-center h-[490px]">
        <p className="text-sm text-white/60 mb-4 font-medium">Couldn't load this summit</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-5 py-2.5 rounded-xl bg-[#8617d0] hover:bg-[#933be1] text-white text-xs font-bold transition-colors shadow-lg"
          >
            Retry Connection
          </button>
        )}
      </div>
    );
  }

  const isSoldOut = (event.effective_available_seats ?? event.available_seats) <= 0;
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`group relative flex flex-col justify-between rounded-[24px] border bg-[#0d0d11] p-5 sm:p-6 transition-all duration-300 hover:border-[#8617d0]/60 hover:shadow-[0_16px_45px_rgba(134,23,208,0.22)] focus-within:ring-2 focus-within:ring-[#c084fc] ${
        isSoldOut ? 'border-white/5 opacity-85' : 'border-white/10'
      }`}
    >
      <div>
        {/* Event Thumbnail with Zoom on Hover */}
        <div className="relative w-full h-52 sm:h-56 rounded-2xl overflow-hidden bg-white/5 mb-5 select-none">
          <img
            src={event.img || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Floating Category Pill on Top-Left */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-black/70 backdrop-blur-md border border-white/15 text-white/90">
              <Sparkles className="w-3 h-3 text-[#fdda7a]" />
              <span>Summit</span>
            </span>
          </div>

          {/* Real-time Seat Indicator on Top-Right */}
          <div className="absolute top-3 right-3">
            <SeatIndicator
              availableSeats={event.effective_available_seats ?? event.available_seats}
              totalSeats={event.total_seats}
            />
          </div>
        </div>

        {/* Event Meta Tags: Date & Location */}
        <div className="flex flex-wrap items-center gap-3 text-[13px] text-white/60 mb-3 font-medium">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/5">
            <Calendar className="w-3.5 h-3.5 text-[#fdda7a] flex-shrink-0" />
            <span className="text-white/80">{formattedDate}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/5 max-w-[190px] truncate" title={event.location}>
            <MapPin className="w-3.5 h-3.5 text-[#c084fc] flex-shrink-0" />
            <span className="text-white/80 truncate">{event.location}</span>
          </div>
        </div>

        {/* Title with single accessible link covering entire card */}
        <h3 className="font-bold text-[20px] text-white tracking-tight mb-2.5 leading-snug group-hover:text-[#fdda7a] transition-colors line-clamp-2">
          <Link
            to={`/events/${event.id}`}
            className="focus:outline-none"
            aria-label={`${event.title}, on ${formattedDate} at ${event.location}. Price $${parseFloat(event.price).toFixed(2)}. ${
              isSoldOut ? 'Sold out.' : `${event.available_seats} seats remaining.`
            }`}
          >
            <span className="absolute inset-0 z-0" aria-hidden="true" />
            {event.title}
          </Link>
        </h3>

        {/* Description preview */}
        <p className="text-[14px] text-white/60 line-clamp-2 leading-relaxed mb-4">
          {event.description}
        </p>
      </div>

      {/* Card Footer: Starting Price & Signature Summitra Pill Button */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto relative z-10 pointer-events-none">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-white/50 block font-semibold">
            Starting from
          </span>
          <span className="text-[22px] font-extrabold text-[#fdda7a] tracking-tight">
            ${parseFloat(event.price).toFixed(2)}
          </span>
        </div>

        {/* Signature Summitra Pill CTA */}
        <div
          className={`inline-flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full text-[13px] font-bold transition-all duration-300 shadow-md ${
            isSoldOut
              ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              : 'bg-white text-black group-hover:bg-[#fdda7a] group-hover:scale-[1.03]'
          }`}
        >
          <span>{isSoldOut ? 'View Summit' : 'Buy Ticket'}</span>
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
              isSoldOut ? 'bg-zinc-700 text-zinc-400' : 'bg-[#8617d0] text-white group-hover:rotate-[-45deg]'
            }`}
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </motion.article>
  );
}
