import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Tag } from 'lucide-react';
import { SeatIndicator } from './SeatIndicator';

/**
 * EventCard
 * Implements all seven component states:
 * default, hover, focus-visible, active, disabled (sold out), loading, error.
 * Features single tab stop per card via stretched link pattern.
 */
export function EventCard({ event, loading = false, error = false, onRetry }) {
  if (loading) {
    return (
      <div
        className="rounded-2xl border border-surface-border bg-surface-card p-5 animate-pulse flex flex-col justify-between h-[450px]"
        aria-busy="true"
        aria-label="Loading event details"
      >
        <div className="w-full h-48 bg-surface-subtle rounded-xl mb-4" />
        <div className="space-y-3">
          <div className="h-6 bg-surface-subtle rounded w-3/4" />
          <div className="h-4 bg-surface-subtle rounded w-1/2" />
          <div className="h-4 bg-surface-subtle rounded w-2/3" />
        </div>
        <div className="pt-4 border-t border-surface-border flex items-center justify-between">
          <div className="h-6 bg-surface-subtle rounded w-20" />
          <div className="h-6 bg-surface-subtle rounded w-24" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-feedback-error/40 bg-surface-card p-6 flex flex-col items-center justify-center text-center h-[450px]">
        <p className="text-sm text-text-tertiary mb-4">Couldn't load this event</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-xl bg-surface-raised hover:bg-surface-strong text-text-primary text-xs font-bold"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  const isSoldOut = event.available_seats <= 0;
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <article
      className={`group relative flex flex-col justify-between rounded-2xl border bg-surface-card p-5 transition-all duration-base hover:-translate-y-1 hover:border-brand-purple/60 hover:shadow-[0_8px_30px_rgba(134,23,208,0.25)] focus-within:ring-2 focus-within:ring-brand-light ${
        isSoldOut ? 'border-surface-border/50 opacity-90' : 'border-surface-border'
      }`}
    >
      <div>
        {/* Event Thumbnail */}
        <div className="relative w-full h-52 rounded-xl overflow-hidden bg-surface-subtle mb-5">
          <img
            src={event.img || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-slow group-hover:scale-105"
          />
          <div className="absolute top-3 right-3">
            <SeatIndicator
              availableSeats={event.effective_available_seats ?? event.available_seats}
              totalSeats={event.total_seats}
            />
          </div>
        </div>

        {/* Event Meta: Date & Location */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-text-tertiary mb-3 font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-light flex-shrink-0" />
            <span>{formattedDate}</span>
          </div>
          <span className="text-surface-border">•</span>
          <div className="flex items-center gap-1.5 max-w-[200px] truncate" title={event.location}>
            <MapPin className="w-3.5 h-3.5 text-brand-light flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {/* Title with single accessible link covering card */}
        <h3 className="font-extrabold text-xl text-text-primary tracking-tight mb-2 group-hover:text-brand-light transition-colors line-clamp-2">
          <Link
            to={`/events/${event.id}`}
            className="focus:outline-none"
            aria-label={`${event.title}, on ${formattedDate} at ${event.location}. Price $${parseFloat(event.price).toFixed(2)}. ${
              isSoldOut ? 'Sold out.' : `${event.available_seats} seats remaining.`
            }`}
          >
            <span className="absolute inset-0" aria-hidden="true" />
            {event.title}
          </Link>
        </h3>

        {/* Description preview */}
        <p className="text-sm text-text-tertiary line-clamp-2 leading-relaxed mb-4">
          {event.description}
        </p>
      </div>

      {/* Card Footer: Price & Action CTA */}
      <div className="pt-4 border-t border-surface-border/60 flex items-center justify-between mt-auto">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-text-tertiary block font-semibold">
            Starting from
          </span>
          <span className="text-xl font-extrabold text-text-primary">
            ${parseFloat(event.price).toFixed(2)}
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors bg-surface-subtle text-text-primary group-hover:bg-surface-raised group-hover:text-text-primary">
          <span>{isSoldOut ? 'View Details' : 'Book Tickets'}</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </article>
  );
}
