import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { EventCard } from '../components/EventCard';
import { Search, MapPin, Calendar, X, Filter, Sparkles, Radio, ArrowRight } from 'lucide-react';
import { socket } from '../lib/socket';

export function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input for performance
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 280);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['events', debouncedSearch, selectedLocation, fromDate, toDate],
    queryFn: () =>
      api.getEvents({
        q: debouncedSearch,
        location: selectedLocation,
        from: fromDate,
        to: toDate
      })
  });

  // Real-time WebSocket listener for immediate seat updates
  useEffect(() => {
    const handleEventsChanged = () => {
      refetch();
    };
    socket.on('events:changed', handleEventsChanged);
    socket.on('seats:changed', handleEventsChanged);
    return () => {
      socket.off('events:changed', handleEventsChanged);
      socket.off('seats:changed', handleEventsChanged);
    };
  }, [refetch]);

  const events = data?.events || [];
  const total = data?.pagination?.total ?? events.length;
  const hasActiveFilters = Boolean(searchTerm || selectedLocation || fromDate || toDate);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setFromDate('');
    setToDate('');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Page Header matching Summitra Webflow aesthetic */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/5">
        <div className="space-y-3 max-w-2xl">
          <h1 className="text-4xl sm:text-6xl font-semibold text-white tracking-tight leading-[1.08]">
            Explore Upcoming <span className="text-[#fdda7a]">Summits</span>
          </h1>
          <p className="text-sm sm:text-base text-white/60 leading-relaxed max-w-xl">
            Browse upcoming technical conferences, AI symposiums, and spatial computing summits across India. Real-time availability refreshed live with zero oversell guarantee.
          </p>
        </div>

        {/* Live WebSocket Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#111116] border border-white/10 text-xs font-bold text-white/80 self-start md:self-end shadow-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>Live Seat Sync Active</span>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="p-6 sm:p-8 rounded-[28px] border border-white/10 bg-[#0c0c10] backdrop-blur-md space-y-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Keyword Search */}
          <div className="md:col-span-2 relative">
            <label htmlFor="search-input" className="block text-xs font-bold text-white/60 mb-2 uppercase tracking-wider">
              Search by Title or Topic
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search AI, Cloud, Architecture..."
                className="w-full pl-11 pr-10 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-[#8617d0] focus:border-[#8617d0] transition-colors outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search keyword"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Location Dropdown Filter - Indian Cities */}
          <div>
            <label htmlFor="location-select" className="block text-xs font-bold text-white/60 mb-2 uppercase tracking-wider">
              Location / City
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                id="location-select"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pl-11 pr-8 py-3 rounded-xl bg-[#14141a] border border-white/10 text-sm text-white focus-visible:ring-2 focus-visible:ring-[#8617d0] focus:border-[#8617d0] appearance-none cursor-pointer outline-none"
              >
                <option value="">All Indian Cities</option>
                <option value="Bengaluru">Bengaluru, Karnataka</option>
                <option value="Mumbai">Mumbai, Maharashtra</option>
                <option value="Delhi">New Delhi / NCR</option>
                <option value="Hyderabad">Hyderabad, Telangana</option>
                <option value="Pune">Pune, Maharashtra</option>
                <option value="Chennai">Chennai, Tamil Nadu</option>
              </select>
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <label htmlFor="from-date" className="block text-xs font-bold text-white/60 mb-2 uppercase tracking-wider">
              From Date
            </label>
            <div className="relative">
              <input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus-visible:ring-2 focus-visible:ring-[#8617d0] focus:border-[#8617d0] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Filter status & clear button */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-white/5 text-xs text-white/60">
          <div role="status" aria-live="polite" className="font-semibold text-white">
            {isLoading ? 'Searching summits...' : `Showing ${total} event${total === 1 ? '' : 's'} available for booking`}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white font-bold transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Events Grid with Staggered Entrance Animations */}
      <section aria-label="Event Search Results">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <EventCard key={i} loading={true} />
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center rounded-[28px] border border-rose-500/30 bg-[#0e0e12] space-y-4">
            <h2 className="text-xl font-bold text-white">Unable to load summits</h2>
            <p className="text-sm text-white/60 max-w-md mx-auto">
              We encountered a network error while connecting to the event catalog. Please try again.
            </p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2.5 rounded-xl bg-[#8617d0] hover:bg-[#933be1] text-white text-sm font-bold shadow-lg transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="p-16 text-center rounded-[28px] border border-white/10 bg-[#0c0c10] space-y-4">
            <Filter className="w-12 h-12 text-[#a278d9] mx-auto" />
            <h2 className="text-2xl font-bold text-white tracking-tight">No summits match your filters</h2>
            <p className="text-sm text-white/60 max-w-md mx-auto">
              Try adjusting your search terms, changing the date range, or clicking below to reset all filters.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="px-6 py-3 rounded-full bg-white text-black font-bold text-sm hover:bg-[#fdda7a] transition-colors shadow-lg"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {events.map((evt) => (
              <motion.div key={evt.id} variants={itemVariants}>
                <EventCard event={evt} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </main>
  );
}
