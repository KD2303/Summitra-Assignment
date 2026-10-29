import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { EventCard } from '../components/EventCard';
import { Search, MapPin, Calendar, X, Filter } from 'lucide-react';
import { socket } from '../lib/socket';

export function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
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

  // Listen for global seat changes or admin changes to refresh list
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

  return (
    <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Page Header */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
          Explore Upcoming Summits
        </h1>
        <p className="text-sm sm:text-base text-text-tertiary max-w-2xl">
          Browse upcoming technical summits, AI symposiums, and spatial design conferences. Real-time availability refreshed live.
        </p>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="p-6 rounded-2xl border border-surface-border bg-surface-card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Keyword Search */}
          <div className="md:col-span-2 relative">
            <label htmlFor="search-input" className="block text-xs font-bold text-text-tertiary mb-1.5 uppercase tracking-wider">
              Search by Title or Topic
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-text-tertiary absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search AI, Architecture, Design..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-subtle border border-surface-border text-sm text-text-primary placeholder:text-text-tertiary/60 focus-visible:ring-2 focus-visible:ring-brand-light transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search keyword"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Location Dropdown Filter */}
          <div>
            <label htmlFor="location-select" className="block text-xs font-bold text-text-tertiary mb-1.5 uppercase tracking-wider">
              Location / City
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-text-tertiary absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                id="location-select"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pl-11 pr-8 py-3 rounded-xl bg-surface-subtle border border-surface-border text-sm text-text-primary focus-visible:ring-2 focus-visible:ring-brand-light appearance-none cursor-pointer"
              >
                <option value="">All Locations</option>
                <option value="San Francisco">San Francisco, CA</option>
                <option value="New York">New York, NY</option>
                <option value="Seattle">Seattle, WA</option>
                <option value="Austin">Austin, TX</option>
                <option value="Boston">Boston, MA</option>
                <option value="Chicago">Chicago, IL</option>
              </select>
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <label htmlFor="from-date" className="block text-xs font-bold text-text-tertiary mb-1.5 uppercase tracking-wider">
              From Date
            </label>
            <div className="relative">
              <input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-subtle border border-surface-border text-sm text-text-primary focus-visible:ring-2 focus-visible:ring-brand-light"
              />
            </div>
          </div>
        </div>

        {/* Filter status & clear button */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-surface-border/50 text-xs text-text-tertiary">
          <div role="status" aria-live="polite" className="font-semibold text-text-primary">
            {isLoading ? 'Searching events...' : `Showing ${total} event${total === 1 ? '' : 's'}`}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-border text-text-primary font-bold transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Events Grid */}
      <section aria-label="Event Search Results">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <EventCard key={i} loading={true} />
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center rounded-2xl border border-feedback-error/40 bg-surface-card space-y-4">
            <h2 className="text-xl font-bold text-text-primary">Unable to load events</h2>
            <p className="text-sm text-text-tertiary max-w-md mx-auto">
              We encountered a network error while connecting to the event catalog. Please try again.
            </p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2.5 rounded-xl bg-surface-raised hover:bg-surface-strong text-text-primary text-sm font-bold"
            >
              Retry Connection
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="p-16 text-center rounded-2xl border border-surface-border bg-surface-card space-y-4">
            <Filter className="w-10 h-10 text-brand-light mx-auto" />
            <h2 className="text-xl font-bold text-text-primary">No events match your filters</h2>
            <p className="text-sm text-text-tertiary max-w-md mx-auto">
              Try adjusting your search terms, changing the date range, or clearing your location filter.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="px-6 py-3 rounded-xl bg-surface-raised hover:bg-surface-strong text-text-primary text-sm font-bold"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
