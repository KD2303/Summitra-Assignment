import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useSeats } from '../hooks/useSeats';
import { SeatIndicator } from '../components/SeatIndicator';
import { TicketSelector } from '../components/TicketSelector';
import {
  Calendar,
  MapPin,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['event', id],
    queryFn: () => api.getEventById(id)
  });

  const event = data?.event;

  // Real-time seat updates hook
  const { availableSeats, effectiveSeats, isLive, lastUpdated } = useSeats(
    id,
    event?.available_seats ?? 0
  );

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Set default category when categories load
  useEffect(() => {
    if (event?.categories && event.categories.length > 0 && !selectedCategory) {
      setSelectedCategory(event.categories[0]);
    }
  }, [event, selectedCategory]);

  if (isLoading) {
    return (
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-8">
        <div className="h-6 bg-surface-subtle rounded w-48" />
        <div className="h-80 bg-surface-subtle rounded-3xl w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-10 bg-surface-subtle rounded w-3/4" />
            <div className="h-4 bg-surface-subtle rounded w-1/2" />
            <div className="h-32 bg-surface-subtle rounded w-full" />
          </div>
          <div className="h-96 bg-surface-subtle rounded-3xl w-full" />
        </div>
      </main>
    );
  }

  if (isError || !event) {
    return (
      <main id="main-content" className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6">
        <h1 className="text-3xl font-extrabold text-text-primary">Event Not Found</h1>
        <p className="text-text-tertiary">
          The event you are looking for may have been removed or does not exist.
        </p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-raised hover:bg-surface-strong text-text-primary font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Browse Upcoming Events
        </Link>
      </main>
    );
  }

  const isSoldOut = effectiveSeats <= 0;
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = new Date(event.date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const handleProceedToCheckout = () => {
    navigate(`/checkout/${event.id}`, {
      state: {
        event,
        category: selectedCategory,
        quantity
      }
    });
  };

  // Google Maps query URL for embed iframe
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    event.location
  )}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Accessible Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-text-tertiary">
        <Link to="/" className="hover:text-text-primary transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/events" className="hover:text-text-primary transition-colors">Events</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-text-primary font-semibold truncate max-w-xs">{event.title}</span>
      </nav>

      {/* Hero Visual Banner */}
      <div className="relative w-full h-[320px] sm:h-[420px] rounded-3xl overflow-hidden border border-surface-border shadow-2xl">
        <img
          src={event.img || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80'}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        {/* Banner Content overlay */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <SeatIndicator
              availableSeats={effectiveSeats}
              totalSeats={event.total_seats}
              isLive={isLive}
            />
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content Layout: 2 Cols (Details + Booking Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Description, Schedule, Maps */}
        <div className="lg:col-span-2 space-y-10">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 rounded-2xl border border-surface-border bg-surface-card">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-raised/20 border border-brand-purple/40 flex items-center justify-center text-brand-light flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-text-tertiary block tracking-wider">Date & Time</span>
                <p className="font-bold text-text-primary text-sm sm:text-base">{formattedDate}</p>
                <p className="text-xs text-brand-light font-medium">{formattedTime} Local Time</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-raised/20 border border-brand-purple/40 flex items-center justify-center text-brand-light flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-text-tertiary block tracking-wider">Location</span>
                <p className="font-bold text-text-primary text-sm sm:text-base">{event.location}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <section className="space-y-4">
            <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">
              About This Summit
            </h2>
            <div className="text-text-tertiary leading-relaxed space-y-4 text-base">
              <p>{event.description}</p>
              <p>
                Summitra summits assemble distinguished architects, lead system engineers, and engineering directors. Attendees experience high-intensity technical discourse, hands-on production case studies, and structured executive networking.
              </p>
            </div>
          </section>

          {/* Google Maps Location Embed */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-text-primary tracking-tight flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-light" />
                Venue Location
              </h2>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(event.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-brand-light hover:underline inline-flex items-center gap-1"
                aria-label="Open location in Google Maps (opens in a new tab)"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="w-full h-72 rounded-2xl overflow-hidden border border-surface-border bg-surface-card shadow-inner">
              <iframe
                title={`Interactive map of ${event.location}`}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={mapsEmbedUrl}
                className="filter invert contrast-125 opacity-90"
                loading="lazy"
              />
            </div>
          </section>
        </div>

        {/* Right Column: Checkout Ticket Selector Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 p-6 sm:p-8 rounded-3xl border border-surface-border bg-surface-card space-y-6 shadow-2xl">
            <div className="space-y-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-brand-light block">
                Instant Reservation
              </span>
              <h2 className="text-2xl font-extrabold text-text-primary">
                Book Tickets
              </h2>
              <div className="pt-1">
                <SeatIndicator
                  availableSeats={effectiveSeats}
                  totalSeats={event.total_seats}
                  isLive={isLive}
                />
              </div>
            </div>

            {/* Ticket Selector Component */}
            <TicketSelector
              categories={event.categories || []}
              basePrice={event.price}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              quantity={quantity}
              onChangeQuantity={setQuantity}
              maxAvailable={effectiveSeats}
            />

            {/* Checkout Action Button */}
            <button
              type="button"
              onClick={handleProceedToCheckout}
              disabled={isSoldOut}
              className="w-full py-4 rounded-xl bg-surface-raised hover:bg-surface-strong disabled:opacity-40 disabled:cursor-not-allowed text-text-primary text-base font-extrabold shadow-[0_4px_25px_rgba(134,23,208,0.4)] transition-all duration-fast transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-brand-light min-h-[48px] flex items-center justify-center gap-2"
            >
              {isSoldOut ? (
                'Sold Out'
              ) : (
                `Book ${quantity} Ticket${quantity > 1 ? 's' : ''}`
              )}
            </button>

            {/* Security Guarantee Note */}
            <div className="pt-2 border-t border-surface-border/50 text-xs text-text-tertiary space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-light flex-shrink-0" />
                <span>Zero oversell guarantee with row-level ACID locks.</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-brand-light flex-shrink-0" />
                <span>Seats held for 5 minutes during checkout.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
