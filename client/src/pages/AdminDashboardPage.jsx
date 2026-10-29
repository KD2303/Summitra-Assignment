import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import {
  Plus,
  Edit2,
  Trash2,
  LogOut,
  Users,
  Calendar,
  DollarSign,
  AlertCircle,
  X,
  Check,
  Eye,
  ShieldCheck
} from 'lucide-react';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Active Tab: 'events' | 'bookings'
  const [activeTab, setActiveTab] = useState('events');
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Modals state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [modalError, setModalError] = useState('');

  // Form state for Event Modal
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formSeats, setFormSeats] = useState(100);
  const [formPrice, setFormPrice] = useState(199);
  const [formImg, setFormImg] = useState('');

  // Fetch Events
  const { data: eventsData, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => api.getEvents({ limit: 50 })
  });
  const events = eventsData?.events || [];

  // Fetch Bookings for Selected Event
  const { data: bookingsData, isLoading: isLoadingBookings } = useQuery({
    queryKey: ['admin-bookings', selectedEventId],
    queryFn: () => api.getEventBookings(selectedEventId),
    enabled: Boolean(selectedEventId)
  });
  const bookings = bookingsData?.bookings || [];

  // Set default selected event for bookings view
  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('summitra_admin_token');
    navigate('/admin/login');
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setFormTitle('');
    setFormDesc('');
    setFormLocation('');
    setFormDate(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16));
    setFormSeats(100);
    setFormPrice(199);
    setFormImg('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80');
    setModalError('');
    setIsEventModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (evt) => {
    setEditingEvent(evt);
    setFormTitle(evt.title);
    setFormDesc(evt.description || '');
    setFormLocation(evt.location);
    setFormDate(new Date(evt.date).toISOString().slice(0, 16));
    setFormSeats(evt.total_seats);
    setFormPrice(evt.price);
    setFormImg(evt.img || '');
    setModalError('');
    setIsEventModalOpen(true);
  };

  // Submit Event Form
  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    setModalError('');

    try {
      const payload = {
        title: formTitle.trim(),
        description: formDesc.trim(),
        location: formLocation.trim(),
        date: new Date(formDate).toISOString(),
        total_seats: Number(formSeats),
        price: Number(formPrice),
        img: formImg.trim()
      };

      if (editingEvent) {
        await api.updateEvent(editingEvent.id, payload);
      } else {
        await api.createEvent(payload);
      }

      await queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      setIsEventModalOpen(false);
    } catch (err) {
      setModalError(err.message || 'Failed to save event');
    }
  };

  // Delete Event
  const handleConfirmDelete = async () => {
    if (!deletingEvent) return;
    try {
      await api.deleteEvent(deletingEvent.id);
      await queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      setDeletingEvent(null);
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  return (
    <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <span className="text-xs font-bold text-brand-light uppercase tracking-wider block">
            Administrative Management
          </span>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
            Summitra Operations Center
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-xl bg-surface-raised hover:bg-surface-strong text-text-primary text-xs font-bold transition-all shadow-[0_4px_14px_rgba(134,23,208,0.39)] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Summit</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-surface-subtle hover:bg-surface-border text-text-tertiary hover:text-text-primary text-xs font-bold transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-border space-x-6">
        <button
          type="button"
          onClick={() => setActiveTab('events')}
          className={`pb-3 text-sm font-bold transition-colors relative ${
            activeTab === 'events'
              ? 'text-text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-surface-raised'
              : 'text-text-tertiary hover:text-text-primary'
          }`}
        >
          Manage Summits ({events.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 text-sm font-bold transition-colors relative ${
            activeTab === 'bookings'
              ? 'text-text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-surface-raised'
              : 'text-text-tertiary hover:text-text-primary'
          }`}
        >
          Attendee Bookings
        </button>
      </div>

      {/* Tab 1: Events Management Table */}
      {activeTab === 'events' && (
        <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" aria-label="Summit Events Management Table">
              <thead className="bg-surface-subtle border-b border-surface-border text-xs uppercase text-text-tertiary font-bold tracking-wider">
                <tr>
                  <th scope="col" className="p-4">Title & Venue</th>
                  <th scope="col" className="p-4">Scheduled Date</th>
                  <th scope="col" className="p-4">Total Seats</th>
                  <th scope="col" className="p-4">Available</th>
                  <th scope="col" className="p-4">Price</th>
                  <th scope="col" className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {events.map((evt) => {
                  const booked = evt.total_seats - evt.available_seats;
                  return (
                    <tr key={evt.id} className="hover:bg-surface-subtle/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-text-primary line-clamp-1">{evt.title}</div>
                        <div className="text-xs text-text-tertiary line-clamp-1">{evt.location}</div>
                      </td>
                      <td className="p-4 font-mono text-xs text-text-tertiary whitespace-nowrap">
                        {new Date(evt.date).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-bold text-text-primary">{evt.total_seats}</td>
                      <td className="p-4">
                        <span
                          className={`font-bold ${
                            evt.available_seats === 0
                              ? 'text-feedback-error'
                              : evt.available_seats < 10
                              ? 'text-amber-400'
                              : 'text-feedback-success'
                          }`}
                        >
                          {evt.available_seats} left
                        </span>
                        <span className="text-xs text-text-tertiary block">({booked} sold)</span>
                      </td>
                      <td className="p-4 font-extrabold text-text-primary">
                        ${parseFloat(evt.price).toFixed(2)}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEventId(evt.id);
                            setActiveTab('bookings');
                          }}
                          className="p-2 rounded-lg bg-surface-subtle hover:bg-surface-border text-brand-light transition-colors"
                          title="View attendee bookings"
                          aria-label={`View bookings for ${evt.title}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(evt)}
                          className="p-2 rounded-lg bg-surface-subtle hover:bg-surface-border text-text-primary transition-colors"
                          title="Edit event details"
                          aria-label={`Edit ${evt.title}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingEvent(evt)}
                          className="p-2 rounded-lg bg-feedback-error/20 hover:bg-feedback-error text-red-300 hover:text-white transition-colors"
                          title="Delete event"
                          aria-label={`Delete ${evt.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Bookings Viewer */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {/* Select Event Filter */}
          <div className="p-4 rounded-xl border border-surface-border bg-surface-card flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-brand-light" />
              <div>
                <span className="text-xs uppercase font-bold text-text-tertiary block">Filter Bookings by Summit</span>
                <span className="font-bold text-text-primary">
                  {events.find((e) => e.id === selectedEventId)?.title || 'Selected Summit'}
                </span>
              </div>
            </div>

            <select
              value={selectedEventId || ''}
              onChange={(e) => setSelectedEventId(Number(e.target.value))}
              className="px-4 py-2 rounded-xl bg-surface-subtle border border-surface-border text-xs text-text-primary font-bold focus-visible:ring-2 focus-visible:ring-brand-light"
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>

          {/* Bookings Table */}
          <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden shadow-xl">
            {isLoadingBookings ? (
              <div className="p-12 text-center text-text-tertiary animate-pulse">Loading attendee records...</div>
            ) : bookings.length === 0 ? (
              <div className="p-16 text-center text-text-tertiary space-y-2">
                <Users className="w-8 h-8 mx-auto text-text-tertiary" />
                <p className="font-semibold text-text-primary">No bookings registered for this summit yet.</p>
                <p className="text-xs">When attendees complete checkout, registrations will display here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm" aria-label="Attendee Bookings Table">
                  <thead className="bg-surface-subtle border-b border-surface-border text-xs uppercase text-text-tertiary font-bold tracking-wider">
                    <tr>
                      <th scope="col" className="p-4">Pass ID</th>
                      <th scope="col" className="p-4">Attendee Name</th>
                      <th scope="col" className="p-4">Contact</th>
                      <th scope="col" className="p-4">Category</th>
                      <th scope="col" className="p-4">Qty</th>
                      <th scope="col" className="p-4">Total Paid</th>
                      <th scope="col" className="p-4">Date</th>
                      <th scope="col" className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-surface-subtle/50 transition-colors">
                        <td className="p-4 font-mono text-xs font-bold text-brand-light">#{b.id}</td>
                        <td className="p-4 font-bold text-text-primary">{b.name}</td>
                        <td className="p-4 text-xs text-text-tertiary">
                          <div>{b.email}</div>
                          <div>{b.mobile}</div>
                        </td>
                        <td className="p-4 text-xs font-semibold text-text-primary">{b.category_name || 'Standard'}</td>
                        <td className="p-4 font-bold text-text-primary">{b.quantity}</td>
                        <td className="p-4 font-extrabold text-text-primary">${parseFloat(b.total_amount).toFixed(2)}</td>
                        <td className="p-4 font-mono text-xs text-text-tertiary">
                          {new Date(b.booking_date).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-feedback-success/20 text-emerald-400 border border-feedback-success/30">
                            <ShieldCheck className="w-3 h-3" />
                            Confirmed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create / Edit Event Modal */}
      {isEventModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-xl rounded-3xl border border-surface-border bg-surface-card p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-surface-border pb-4">
              <h2 id="modal-title" className="text-xl font-extrabold text-text-primary">
                {editingEvent ? `Edit Summit: ${editingEvent.title}` : 'Create New Summit'}
              </h2>
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                aria-label="Close modal"
                className="p-1 rounded-lg text-text-tertiary hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div role="alert" className="p-3.5 rounded-xl bg-feedback-error/20 border border-feedback-error text-red-200 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitEvent} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-text-primary uppercase">Summit Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-sm text-text-primary focus-visible:ring-2 focus-visible:ring-brand-light"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-text-primary uppercase">Description</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-sm text-text-primary focus-visible:ring-2 focus-visible:ring-brand-light"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-text-primary uppercase">Location / Venue *</label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-sm text-text-primary focus-visible:ring-2 focus-visible:ring-brand-light"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-text-primary uppercase">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-sm text-text-primary focus-visible:ring-2 focus-visible:ring-brand-light"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-text-primary uppercase">Total Seat Capacity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formSeats}
                    onChange={(e) => setFormSeats(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-sm text-text-primary focus-visible:ring-2 focus-visible:ring-brand-light"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-text-primary uppercase">Base Price (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-sm text-text-primary focus-visible:ring-2 focus-visible:ring-brand-light"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-text-primary uppercase">Image URL</label>
                <input
                  type="url"
                  value={formImg}
                  onChange={(e) => setFormImg(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-sm text-text-primary focus-visible:ring-2 focus-visible:ring-brand-light"
                />
              </div>

              <div className="pt-4 border-t border-surface-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-text-tertiary hover:text-text-primary font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-surface-raised hover:bg-surface-strong text-text-primary font-bold text-xs shadow-[0_4px_14px_rgba(134,23,208,0.4)]"
                >
                  {editingEvent ? 'Save Changes' : 'Create Summit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingEvent && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-3xl border border-surface-border bg-surface-card p-6 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 text-feedback-error">
              <Trash2 className="w-6 h-6" />
              <h2 className="text-xl font-bold text-text-primary">Delete Event</h2>
            </div>
            <p className="text-sm text-text-tertiary">
              Are you sure you want to permanently delete{' '}
              <strong className="text-text-primary">{deletingEvent.title}</strong>? This action cannot be undone and will delete all associated bookings.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingEvent(null)}
                className="px-5 py-2.5 rounded-xl text-text-tertiary hover:text-text-primary font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-6 py-2.5 rounded-xl bg-feedback-error hover:bg-red-600 text-white font-bold text-xs"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
