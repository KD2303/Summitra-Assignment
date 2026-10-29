import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { useSeats } from '../hooks/useSeats';
import { TicketSelector } from '../components/TicketSelector';
import {
  Calendar,
  MapPin,
  ArrowLeft,
  ShieldCheck,
  Zap,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Users,
  CheckCircle2,
  ArrowRight,
  Mic,
  Laptop,
  Coffee,
  Layers
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
        <div className="h-6 bg-white/5 rounded w-48" />
        <div className="h-[380px] bg-white/5 rounded-[28px] w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-10 bg-white/5 rounded w-3/4" />
            <div className="h-4 bg-white/5 rounded w-1/2" />
            <div className="h-40 bg-white/5 rounded-2xl w-full" />
          </div>
          <div className="h-[460px] bg-white/5 rounded-[28px] w-full" />
        </div>
      </main>
    );
  }

  if (isError || !event) {
    return (
      <main id="main-content" className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <Calendar className="w-8 h-8" />
        </div>
        <h1 className="text-[28px] sm:text-[34px] font-extrabold text-white">Summit Not Found</h1>
        <p className="text-white/60 text-[15px]">
          The event you are looking for may have been rescheduled or is currently unavailable.
        </p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold text-[14px] hover:bg-[#fdda7a] transition-colors shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Browse Upcoming Summits
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
    <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Accessible Breadcrumbs with Back Link */}
      <div className="flex items-center justify-between">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-white/50">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/30" />
          <Link to="/events" className="hover:text-white transition-colors">Summits</Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/30" />
          <span className="text-[#fdda7a] font-semibold truncate max-w-xs">{event.title}</span>
        </nav>

        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Summits</span>
        </Link>
      </div>

      {/* Hero Cinematic Visual Banner */}
      <div className="relative w-full h-[320px] sm:h-[440px] rounded-[28px] overflow-hidden border border-white/10 shadow-2xl select-none">
        <img
          src={event.img || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80'}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Floating Top Badges */}
        <div className="absolute top-5 sm:top-6 left-5 sm:left-6 right-5 sm:right-6 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider bg-black/75 backdrop-blur-md border border-white/15 text-white">
            <Sparkles className="w-3.5 h-3.5 text-[#fdda7a]" />
            <span>Official Conference</span>
          </div>

          {/* Registration Status & Starting Tier Badge (Replaces duplicate seats indicator) */}
          {isSoldOut ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider bg-zinc-900/80 backdrop-blur-md border border-white/10 text-zinc-400">
              Sold Out
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider bg-black/75 backdrop-blur-md border border-white/15 text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Registration Open</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-bold bg-black/75 backdrop-blur-md border border-white/15 text-[#fdda7a]">
                <span>From ${parseFloat(event.price).toFixed(0)}</span>
              </span>
            </div>
          )}
        </div>

        {/* Bottom Banner Content Overlay */}
        <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 right-6 sm:right-8 space-y-3">
          <div className="flex flex-wrap items-center gap-2.5 text-[13px] text-white/80 font-medium">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-[#fdda7a]" />
              <span>{formattedDate}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-[#c084fc]" />
              <span>{event.location}</span>
            </span>
          </div>

          <h1 className="text-[28px] sm:text-[40px] lg:text-[46px] font-bold text-white tracking-tight leading-[1.1] max-w-4xl drop-shadow-md">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Main Content Layout: 2 Columns (Details & Map + Sticky Booking Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start">
        {/* Left Column: Fast Facts, Description, Highlights, Map */}
        <div className="lg:col-span-2 space-y-10">
          {/* Quick Key Facts Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fact 1: Date & Time */}
            <div className="p-5 rounded-2xl border border-white/10 bg-[#0d0d12] flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#8617d0]/20 border border-[#8617d0]/40 flex items-center justify-center text-[#fdda7a] flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold text-white/50 block tracking-wider">
                  Date & Session Time
                </span>
                <p className="font-bold text-white text-[15px] mt-0.5">{formattedDate}</p>
                <p className="text-[12px] text-white/60 font-medium">{formattedTime} Local Time</p>
              </div>
            </div>

            {/* Fact 2: Venue Location */}
            <div className="p-5 rounded-2xl border border-white/10 bg-[#0d0d12] flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#8617d0]/20 border border-[#8617d0]/40 flex items-center justify-center text-[#c084fc] flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold text-white/50 block tracking-wider">
                  Venue & City
                </span>
                <p className="font-bold text-white text-[15px] mt-0.5">{event.location}</p>
                <p className="text-[12px] text-white/60 font-medium">India Convention & Exhibition Hub</p>
              </div>
            </div>

            {/* Fact 3: Conference Format */}
            <div className="p-5 rounded-2xl border border-white/10 bg-[#0d0d12] flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#8617d0]/20 border border-[#8617d0]/40 flex items-center justify-center text-[#fdda7a] flex-shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold text-white/50 block tracking-wider">
                  Conference Format
                </span>
                <p className="font-bold text-white text-[15px] mt-0.5">In-Person & Live Keynotes</p>
                <p className="text-[12px] text-white/60 font-medium">Interactive Q&A & Tech Labs</p>
              </div>
            </div>

            {/* Fact 4: Anti-Oversell Protection */}
            <div className="p-5 rounded-2xl border border-white/10 bg-[#0d0d12] flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#8617d0]/20 border border-[#8617d0]/40 flex items-center justify-center text-[#fdda7a] flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold text-white/50 block tracking-wider">
                  Protection Guarantee
                </span>
                <p className="font-bold text-white text-[15px] mt-0.5">Row-Level ACID Locks</p>
                <p className="text-[12px] text-white/60 font-medium">Zero oversell architecture</p>
              </div>
            </div>
          </div>

          {/* Description & Summit Highlights */}
          <section className="space-y-5 border-t border-white/5 pt-8">
            <h2 className="text-[26px] sm:text-[30px] font-bold text-white tracking-tight">
              About This <span className="text-[#fdda7a]">Summit</span>
            </h2>
            <div className="text-white/70 leading-relaxed space-y-4 text-[15px]">
              <p>{event.description}</p>
              <p>
                Summitra assembles visionary engineering directors, principal AI architects, and systems builders for an intensive day of high-impact technical discourses, live architectural breakdowns, and structured executive networking.
              </p>
            </div>

            {/* Key Agenda Highlights */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border border-white/10 bg-[#0d0d12] hover:border-white/20 transition-all">
                <div className="w-9 h-9 rounded-xl bg-[#fdda7a]/15 border border-[#fdda7a]/30 flex items-center justify-center text-[#fdda7a] mb-3">
                  <Mic className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-[15px]">Keynote Sessions</h4>
                <p className="text-[12px] text-white/50 mt-1.5 leading-relaxed">
                  Direct insights from keynote speakers and industry leaders.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-white/10 bg-[#0d0d12] hover:border-white/20 transition-all">
                <div className="w-9 h-9 rounded-xl bg-[#c084fc]/15 border border-[#c084fc]/30 flex items-center justify-center text-[#c084fc] mb-3">
                  <Laptop className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-[15px]">Hands-on Workshops</h4>
                <p className="text-[12px] text-white/50 mt-1.5 leading-relaxed">
                  Production-ready system architecture case studies and live demos.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-white/10 bg-[#0d0d12] hover:border-white/20 transition-all">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                  <Coffee className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-[15px]">Executive Lounge</h4>
                <p className="text-[12px] text-white/50 mt-1.5 leading-relaxed">
                  Networking lunch and direct speaker roundtable discussions.
                </p>
              </div>
            </div>
          </section>

          {/* Google Maps Location Embed Section */}
          <section className="space-y-5 border-t border-white/5 pt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-[24px] sm:text-[28px] font-bold text-white tracking-tight flex items-center gap-2.5">
                  <MapPin className="w-6 h-6 text-[#9e6ce8] flex-shrink-0" />
                  <span>Venue & Location</span>
                </h2>
                <p className="text-[13px] text-white/50 mt-1">
                  Explore the conference venue and surrounding directions
                </p>
              </div>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(event.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[13px] font-bold text-white transition-colors self-start sm:self-auto shadow-md"
                aria-label="Open location in Google Maps (opens in a new tab)"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#fdda7a]" />
              </a>
            </div>

            {/* Google Maps Interactive Frame */}
            <div className="relative w-full h-80 sm:h-96 rounded-[24px] overflow-hidden border border-white/10 bg-[#0d0d12] shadow-xl">
              <iframe
                title={`Interactive map of ${event.location}`}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={mapsEmbedUrl}
                className="filter invert contrast-125 opacity-85 hover:opacity-100 transition-opacity"
                loading="lazy"
              />
              <div className="absolute bottom-4 left-4 pointer-events-none px-4 py-2.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/15 text-[13px] font-bold text-white flex items-center gap-2 shadow-lg">
                <MapPin className="w-3.5 h-3.5 text-[#fdda7a]" />
                <span>{event.location}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Ticket Reservation Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 p-5 sm:p-6 rounded-[28px] border border-white/10 bg-[#0d0d12]/95 backdrop-blur-xl space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            {/* Header with Instant Reservation Badge & Real-Time Live Sync Status */}
            <div className="space-y-3 pb-3 border-b border-white/10">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#8617d0]/20 border border-[#8617d0]/40 text-[#c084fc]">
                  <Zap className="w-3 h-3 text-[#fdda7a] fill-[#fdda7a]" />
                  <span>Instant Reservation</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/[0.04] border border-white/10 text-white/70">
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${effectiveSeats > 0 ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${effectiveSeats > 0 ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                  </span>
                  <span className="tracking-tight">{isLive ? 'Live Inventory' : 'Synced'}</span>
                </span>
              </div>

              <div className="space-y-1">
                <h2 className="text-[22px] sm:text-[24px] font-bold text-white tracking-tight leading-tight">
                  Reserve <span className="text-[#fdda7a]">Seats</span>
                </h2>
                <p className="text-[12px] text-white/50 leading-relaxed">
                  Choose your ticket tier and quantity. Seats are locked atomically during checkout.
                </p>
              </div>
            </div>

            {/* Real-Time Live Seat Capacity Monitor (The single authoritative seat counter) */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <Users className="w-3.5 h-3.5 text-[#9e6ce8]" />
                  <span>Seat Availability</span>
                </div>

                {isSoldOut ? (
                  <span className="font-extrabold text-rose-400 text-[11px] uppercase tracking-wider">
                    Sold Out
                  </span>
                ) : effectiveSeats <= 15 ? (
                  <span className="font-extrabold text-rose-300 text-[11px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                    Only {effectiveSeats} seats left!
                  </span>
                ) : (
                  <span className="font-bold text-[#fdda7a] text-[12px]">
                    {effectiveSeats} of {event.total_seats || 100} available
                  </span>
                )}
              </div>

              {/* Smooth Visual Capacity Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden" role="progressbar" aria-valuenow={effectiveSeats} aria-valuemin={0} aria-valuemax={event.total_seats || 100} aria-label="Seat availability">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isSoldOut
                      ? 'bg-zinc-600'
                      : effectiveSeats <= 15
                      ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                      : 'bg-gradient-to-r from-[#8617d0] to-[#fdda7a]'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(6, (((event.total_seats || 100) - effectiveSeats) / (event.total_seats || 100)) * 100))}%`
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-white/40">
                <span>Row-level ACID lock active</span>
                <span>{Math.round((((event.total_seats || 100) - effectiveSeats) / (event.total_seats || 100)) * 100)}% Booked</span>
              </div>
            </div>

            {/* Ticket Selector Component with Dynamic Pricing & Controlled Sizing */}
            <TicketSelector
              categories={event.categories || []}
              basePrice={event.price}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              quantity={quantity}
              onChangeQuantity={setQuantity}
              maxAvailable={effectiveSeats}
            />

            {/* Signature Summitra Pill Checkout Button */}
            <button
              type="button"
              onClick={handleProceedToCheckout}
              disabled={isSoldOut}
              className={`w-full py-3.5 px-6 rounded-full text-[15px] font-extrabold transition-all duration-300 shadow-xl flex items-center justify-center gap-3 cursor-pointer ${
                isSoldOut
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                  : 'bg-white hover:bg-[#fdda7a] text-black shadow-[0_8px_30px_rgba(253,218,122,0.25)] hover:scale-[1.02] active:scale-[0.99]'
              }`}
            >
              <span>
                {isSoldOut
                  ? 'Summit Sold Out'
                  : `Book ${quantity} Ticket${quantity > 1 ? 's' : ''}`}
              </span>
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  isSoldOut ? 'bg-zinc-700 text-zinc-500' : 'bg-[#8617d0] text-white'
                }`}
              >
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>

            {/* Security Guarantee Notes */}
            <div className="pt-3 border-t border-white/5 text-[12px] text-white/50 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#8617d0] flex-shrink-0" />
                <span>Zero oversell guarantee with row-level ACID locks.</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#fdda7a] flex-shrink-0" />
                <span>Seats temporarily held for 5 minutes during checkout.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
