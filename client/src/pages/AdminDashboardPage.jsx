import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { formatTicketCode } from '../lib/ticket';
import {
  Calendar,
  Ticket,
  Users,
  Shield,
  Plus,
  Edit2,
  Trash2,
  LogOut,
  Eye,
  EyeOff,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  X,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  DollarSign,
  Layers,
  MapPin,
  Menu
} from 'lucide-react';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes inactivity timeout

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Active Navigation Tab: 'events' | 'inventory' | 'users' | 'security'
  const [activeTab, setActiveTab] = useState('events');

  // Mobile sidebar toggle
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filters & Search
  const [eventSearch, setEventSearch] = useState('');
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [selectedEventFilter, setSelectedEventFilter] = useState('');

  // Privacy Shield state (unmasked by default so admin can see full attendee info)
  const [maskPii, setMaskPii] = useState(false);

  // Modals state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [modalError, setModalError] = useState('');
  const [viewingPass, setViewingPass] = useState(null);

  // Form state for Event Modal
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formSeats, setFormSeats] = useState(100);
  const [formPrice, setFormPrice] = useState(199);
  const [formImg, setFormImg] = useState('');

  // Session Security & Inactivity Auto-Logout
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    const checkInterval = setInterval(async () => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= IDLE_TIMEOUT_MS) {
        clearInterval(checkInterval);
        try {
          await api.logout();
        } catch (e) {
          // ignore
        }
        localStorage.removeItem('summitra_admin_token');
        alert('Administrator session expired due to 15 minutes of inactivity for security.');
        navigate('/admin/login');
      }
    }, 10000);

    return () => {
      clearInterval(checkInterval);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [navigate]);

  // Fetch Current Admin Profile
  const { data: adminData } = useQuery({
    queryKey: ['admin-me'],
    queryFn: () => api.getMe(),
    staleTime: 1000 * 60 * 5
  });
  const adminEmail = adminData?.admin?.email || 'admin@summitra.com';

  // Fetch Events
  const { data: eventsData, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => api.getEvents({ limit: 100 })
  });
  const events = eventsData?.events || [];

  // Fetch All Bookings across summits for User Management
  const { data: allBookingsData, isLoading: isLoadingBookings } = useQuery({
    queryKey: ['admin-all-bookings', selectedEventFilter, attendeeSearch],
    queryFn: () => api.getAllBookings({
      eventId: selectedEventFilter || undefined,
      search: attendeeSearch || undefined
    })
  });
  const bookings = allBookingsData?.bookings || [];

  // Calculate High-Level Metrics
  const totalSystemSeats = events.reduce((acc, e) => acc + (Number(e.total_seats) || 0), 0);
  const totalAvailableSeats = events.reduce((acc, e) => acc + (Number(e.available_seats) || 0), 0);
  const totalBookedSeats = Math.max(0, totalSystemSeats - totalAvailableSeats);
  const totalRevenue = bookings.reduce((acc, b) => acc + (parseFloat(b.total_amount) || 0), 0);

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

  // Safe Two-Step Delete Event
  const handleConfirmDelete = async () => {
    if (!deletingEvent) return;
    if (deleteConfirmationText.trim().toUpperCase() !== 'DELETE') {
      alert('Please type DELETE to confirm permanent removal.');
      return;
    }

    try {
      await api.deleteEvent(deletingEvent.id);
      await queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      setDeletingEvent(null);
      setDeleteConfirmationText('');
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  // PII masking helper
  const maskEmail = (email) => {
    if (!maskPii || !email) return email;
    const [name, domain] = email.split('@');
    if (!domain) return email;
    return `${name.slice(0, 2)}***@${domain}`;
  };

  const maskPhone = (phone) => {
    if (!maskPii || !phone) return phone;
    const clean = phone.trim();
    if (clean.length < 5) return '***';
    return `${clean.slice(0, 4)} *** ***${clean.slice(-2)}`;
  };

  const maskName = (name) => {
    if (!maskPii || !name) return name;
    const parts = name.trim().split(' ');
    if (parts.length === 1) return `${parts[0].slice(0, 2)}***`;
    return `${parts[0]} ${parts[1][0]}.`;
  };

  const filteredEvents = events.filter((evt) =>
    evt.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
    evt.location.toLowerCase().includes(eventSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#07070a] text-white flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <div className="lg:hidden p-4 bg-[#0d0d12] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#8617d0] flex items-center justify-center font-black text-white text-[15px]">
            S
          </div>
          <span className="font-bold text-[16px] tracking-tight">Summitra Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* Left Sidebar Navigation */}
      {/* ========================================================================= */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-[#0c0c10] border-r border-white/10 flex flex-col justify-between p-5 transition-transform duration-300 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-5 border-b border-white/10">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8617d0] to-[#5a0c94] flex items-center justify-center font-black text-white text-[17px] shadow-[0_0_20px_rgba(134,23,208,0.5)]">
                S
              </div>
              <div>
                <span className="font-extrabold text-[17px] text-white tracking-tight block leading-none">
                  Summitra
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#fdda7a] block mt-1">
                  Control Center
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Admin Navigation">
            <button
              type="button"
              onClick={() => {
                setActiveTab('events');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-[#8617d0] text-white shadow-[0_4px_20px_rgba(134,23,208,0.35)]'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4" />
                <span>Event Management</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeTab === 'events' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'
                }`}
              >
                {events.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('inventory');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-[#8617d0] text-white shadow-[0_4px_20px_rgba(134,23,208,0.35)]'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Ticket className="w-4 h-4" />
                <span>Ticket Availability</span>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('users');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-[#8617d0] text-white shadow-[0_4px_20px_rgba(134,23,208,0.35)]'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>User Management</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeTab === 'users' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'
                }`}
              >
                {bookings.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('security');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-[#8617d0] text-white shadow-[0_4px_20px_rgba(134,23,208,0.35)]'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4" />
                <span>Security & Audits</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </button>
          </nav>
        </div>

        {/* Sidebar Footer: Profile & Security Controls */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-white truncate max-w-[150px]">{adminEmail}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-white/40 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-[#fdda7a]" />
              <span>15m Inactivity Auto-Lock</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex-1 py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-bold text-white/70 hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Public Site</span>
              <ExternalLink className="w-3 h-3 text-[#fdda7a]" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white transition-colors cursor-pointer"
              title="Sign Out of Admin Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* Main Content Area */}
      {/* ========================================================================= */}
      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Header & Security Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-[12px] text-white/50 mb-1">
              <span>Admin Console</span>
              <ChevronRight className="w-3.5 h-3.5 text-white/30" />
              <span className="text-[#fdda7a] font-bold uppercase tracking-wider">
                {activeTab === 'events' && 'Event Management'}
                {activeTab === 'inventory' && 'Ticket Availability & Capacity'}
                {activeTab === 'users' && 'User & Attendee Management'}
                {activeTab === 'security' && 'Security Architecture'}
              </span>
            </div>
            <h1 className="text-[24px] sm:text-[30px] font-extrabold text-white tracking-tight">
              {activeTab === 'events' && 'Summits & Conferences'}
              {activeTab === 'inventory' && 'Live Seat Availability Engine'}
              {activeTab === 'users' && 'Attendee Registrations & Passes'}
              {activeTab === 'security' && 'System Security & ACID Concurrency'}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* PII Masking Toggle */}
            <button
              type="button"
              onClick={() => setMaskPii(!maskPii)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                maskPii
                  ? 'bg-[#8617d0]/20 border-[#8617d0]/40 text-[#c084fc]'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              }`}
              title="Toggle PII Privacy Shield"
            >
              {maskPii ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{maskPii ? 'PII Masking: ON' : 'PII Masking: OFF'}</span>
            </button>

            {/* Quick Create Summit CTA */}
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-full bg-white hover:bg-[#fdda7a] text-black text-[12px] font-extrabold transition-all shadow-[0_8px_30px_rgba(253,218,122,0.25)] flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-[#8617d0]" />
              <span>Create Summit</span>
            </button>
          </div>
        </div>

        {/* Global Key Metrics Bento Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-[20px] bg-[#0d0d12] border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-white/50 font-bold uppercase tracking-wider">
              <span>Active Summits</span>
              <Calendar className="w-4 h-4 text-[#8617d0]" />
            </div>
            <div className="text-[24px] font-extrabold text-white">{events.length}</div>
            <div className="text-[11px] text-white/40">Across major tech hubs</div>
          </div>

          <div className="p-4 rounded-[20px] bg-[#0d0d12] border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-white/50 font-bold uppercase tracking-wider">
              <span>System Seats</span>
              <Ticket className="w-4 h-4 text-[#fdda7a]" />
            </div>
            <div className="text-[24px] font-extrabold text-[#fdda7a]">{totalAvailableSeats}</div>
            <div className="text-[11px] text-white/40">of {totalSystemSeats} available</div>
          </div>

          <div className="p-4 rounded-[20px] bg-[#0d0d12] border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-white/50 font-bold uppercase tracking-wider">
              <span>Confirmed Attendees</span>
              <Users className="w-4 h-4 text-[#c084fc]" />
            </div>
            <div className="text-[24px] font-extrabold text-white">{bookings.length}</div>
            <div className="text-[11px] text-emerald-400 font-semibold">{totalBookedSeats} tickets booked</div>
          </div>

          <div className="p-4 rounded-[20px] bg-[#0d0d12] border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-white/50 font-bold uppercase tracking-wider">
              <span>Gross Volume</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-[24px] font-extrabold text-emerald-400">${totalRevenue.toFixed(2)}</div>
            <div className="text-[11px] text-white/40">Simulated bookings</div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: EVENT MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative max-w-md w-full">
                <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  placeholder="Search summits by title, venue, or city..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141419] border border-white/10 text-[13px] text-white placeholder:text-white/30 focus:border-[#9e6ce8] outline-none"
                />
              </div>

              <span className="text-[12px] text-white/50">
                Displaying {filteredEvents.length} of {events.length} summits
              </span>
            </div>

            {/* Events Management Table */}
            <div className="rounded-[24px] border border-white/10 bg-[#0d0d12] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]" aria-label="Summit Events Management Table">
                  <thead className="bg-[#141419] border-b border-white/10 text-[11px] uppercase text-white/50 font-bold tracking-wider">
                    <tr>
                      <th scope="col" className="p-4">Summit & Location</th>
                      <th scope="col" className="p-4">Date</th>
                      <th scope="col" className="p-4">Capacity</th>
                      <th scope="col" className="p-4">Seats Left</th>
                      <th scope="col" className="p-4">Base Price</th>
                      <th scope="col" className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredEvents.map((evt) => {
                      const booked = evt.total_seats - evt.available_seats;
                      return (
                        <tr key={evt.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={evt.img || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=200&q=80'}
                                alt=""
                                className="w-10 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0"
                              />
                              <div>
                                <div className="font-bold text-white line-clamp-1">{evt.title}</div>
                                <div className="text-[11px] text-white/50 flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3 text-[#c084fc]" />
                                  <span className="truncate max-w-xs">{evt.location}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-[12px] text-white/60 whitespace-nowrap">
                            {new Date(evt.date).toLocaleDateString()}
                          </td>
                          <td className="p-4 font-bold text-white">{evt.total_seats}</td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                evt.available_seats === 0
                                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                  : evt.available_seats < 15
                                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                              <span>{evt.available_seats} left</span>
                            </span>
                            <span className="text-[10px] text-white/40 block mt-0.5">({booked} sold)</span>
                          </td>
                          <td className="p-4 font-extrabold text-[#fdda7a]">
                            ${parseFloat(evt.price).toFixed(2)}
                          </td>
                          <td className="p-4 text-right whitespace-nowrap space-x-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedEventFilter(String(evt.id));
                                setActiveTab('users');
                              }}
                              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-[#c084fc] transition-colors cursor-pointer"
                              title="View attendees for this summit"
                            >
                              <Users className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(evt)}
                              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-white transition-colors cursor-pointer"
                              title="Edit summit parameters"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingEvent(evt);
                                setDeleteConfirmationText('');
                              }}
                              className="p-2 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white transition-colors cursor-pointer"
                              title="Delete summit permanently"
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
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TICKET AVAILABILITY & INVENTORY */}
        {/* ========================================================================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="p-4 rounded-[20px] bg-gradient-to-r from-[#8617d0]/20 via-[#8617d0]/10 to-transparent border border-[#8617d0]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#8617d0]/30 border border-[#8617d0]/50 flex items-center justify-center text-[#fdda7a]">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-[14px] text-white block">
                    Real-Time Seat Synchronization Engine
                  </span>
                  <span className="text-[12px] text-white/50">
                    Live inventory updates broadcast via WebSocket rooms with row-level ACID serialization locks.
                  </span>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Socket.IO Active</span>
              </span>
            </div>

            {/* Inventory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {events.map((evt) => {
                const total = evt.total_seats || 100;
                const available = evt.available_seats;
                const booked = total - available;
                const bookedPct = Math.round((booked / total) * 100);

                return (
                  <div
                    key={evt.id}
                    className="p-5 rounded-[24px] border border-white/10 bg-[#0d0d12] space-y-4 shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-[#c084fc] uppercase tracking-wider block">
                          ID #{evt.id} &bull; {new Date(evt.date).toLocaleDateString()}
                        </span>
                        <h3 className="font-bold text-white text-[16px] mt-0.5 leading-snug">
                          {evt.title}
                        </h3>
                        <p className="text-[11px] text-white/50 flex items-center gap-1 mt-1 truncate">
                          <MapPin className="w-3 h-3 text-[#fdda7a]" />
                          <span>{evt.location}</span>
                        </p>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0 ${
                          available === 0
                            ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                            : available <= 15
                            ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                            : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                        }`}
                      >
                        {available === 0 ? 'Sold Out' : available <= 15 ? 'Critical Inventory' : 'Healthy'}
                      </span>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-white/60">Occupancy</span>
                        <span className="font-bold text-[#fdda7a]">
                          {available} / {total} Available ({bookedPct}% Booked)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            available === 0
                              ? 'bg-rose-500'
                              : available <= 15
                              ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                              : 'bg-gradient-to-r from-[#8617d0] to-[#fdda7a]'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(6, bookedPct))}%` }}
                        />
                      </div>
                    </div>

                    {/* Ticket Tiers Breakdown */}
                    {evt.categories && evt.categories.length > 0 && (
                      <div className="pt-2 border-t border-white/5 space-y-1.5">
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider block">
                          Tier Pass Breakdown
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          {evt.categories.map((cat) => (
                            <div
                              key={cat.id}
                              className="p-2 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between"
                            >
                              <span className="text-white/70 font-medium truncate">{cat.name}</span>
                              <span className="font-bold text-[#fdda7a]">${parseFloat(cat.price).toFixed(0)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
                      <span>Row-level lock enabled</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEventFilter(String(evt.id));
                          setActiveTab('users');
                        }}
                        className="text-[#c084fc] hover:text-white font-bold transition-colors cursor-pointer"
                      >
                        Inspect Bookings &rarr;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: USER / ATTENDEE MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="p-4 rounded-[20px] bg-[#0d0d12] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={attendeeSearch}
                    onChange={(e) => setAttendeeSearch(e.target.value)}
                    placeholder="Search attendee name, email, or pass ID..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#141419] border border-white/10 text-[13px] text-white placeholder:text-white/30 focus:border-[#9e6ce8] outline-none"
                  />
                </div>

                <select
                  value={selectedEventFilter}
                  onChange={(e) => setSelectedEventFilter(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#141419] border border-white/10 text-[13px] text-white font-semibold focus:border-[#9e6ce8] outline-none"
                >
                  <option value="">All Summits ({events.length})</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-[12px] text-white/50 flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <span>{bookings.length} Registered Passes</span>
                {selectedEventFilter && (
                  <button
                    type="button"
                    onClick={() => setSelectedEventFilter('')}
                    className="text-[#fdda7a] hover:underline font-bold text-[11px] cursor-pointer"
                  >
                    Clear Summit Filter
                  </button>
                )}
              </div>
            </div>

            {/* Bookings Table */}
            <div className="rounded-[24px] border border-white/10 bg-[#0d0d12] overflow-hidden shadow-2xl">
              {isLoadingBookings ? (
                <div className="p-12 text-center text-white/50 animate-pulse">Loading attendee records...</div>
              ) : bookings.length === 0 ? (
                <div className="p-16 text-center text-white/50 space-y-2">
                  <Users className="w-8 h-8 mx-auto text-white/30" />
                  <p className="font-semibold text-white">No attendee registrations match your criteria.</p>
                  <p className="text-[12px]">When attendees book passes online, their records will display here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px]" aria-label="Attendee Registrations Table">
                    <thead className="bg-[#141419] border-b border-white/10 text-[11px] uppercase text-white/50 font-bold tracking-wider">
                      <tr>
                        <th scope="col" className="p-4">Pass ID</th>
                        <th scope="col" className="p-4">Attendee Name</th>
                        <th scope="col" className="p-4">Contact Details</th>
                        <th scope="col" className="p-4">Summit</th>
                        <th scope="col" className="p-4">Tier Pass</th>
                        <th scope="col" className="p-4">Qty</th>
                        <th scope="col" className="p-4">Total</th>
                        <th scope="col" className="p-4">Booking Date</th>
                        <th scope="col" className="p-4">Status</th>
                        <th scope="col" className="p-4 text-right">Pass Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-mono text-[12px] font-bold text-[#c084fc] whitespace-nowrap">
                            {b.ticket_code || formatTicketCode(b.event_id, b.id)}
                          </td>
                          <td className="p-4 font-bold text-white whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#8617d0]/20 border border-[#8617d0]/40 flex items-center justify-center text-[12px] font-black text-[#fdda7a] flex-shrink-0">
                                {b.name ? b.name[0] : 'U'}
                              </div>
                              <span className="text-[14px]">{maskName(b.name)}</span>
                            </div>
                          </td>
                          <td className="p-4 text-[12px] text-white/80">
                            <div className="font-medium text-white">{maskEmail(b.email)}</div>
                            <div className="text-[11px] text-white/50">{maskPhone(b.mobile)}</div>
                          </td>
                          <td className="p-4 font-medium text-white max-w-xs truncate">
                            {b.event_title || 'Summit Event'}
                          </td>
                          <td className="p-4 text-[12px] font-semibold text-[#fdda7a]">
                            {b.category_name || 'Standard'}
                          </td>
                          <td className="p-4 font-bold text-white">{b.quantity}</td>
                          <td className="p-4 font-extrabold text-emerald-400">
                            ${parseFloat(b.total_amount).toFixed(2)}
                          </td>
                          <td className="p-4 font-mono text-[11px] text-white/50 whitespace-nowrap">
                            {new Date(b.booking_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <ShieldCheck className="w-3 h-3" />
                              Confirmed
                            </span>
                          </td>
                          <td className="p-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setViewingPass(b)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8617d0]/20 hover:bg-[#8617d0] text-[#c084fc] hover:text-white border border-[#8617d0]/40 text-[11px] font-bold transition-all cursor-pointer shadow-sm"
                              title="Inspect Attendee Ticket Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Details</span>
                            </button>
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

        {/* ========================================================================= */}
        {/* TAB 4: SECURITY & SYSTEM AUDITS */}
        {/* ========================================================================= */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="p-6 rounded-[24px] border border-white/10 bg-[#0d0d12] space-y-4 shadow-xl">
              <div className="flex items-center gap-3 text-emerald-400">
                <ShieldCheck className="w-6 h-6 flex-shrink-0" />
                <h3 className="text-[18px] font-bold text-white">Active System Security Architecture</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                  <span className="text-[11px] font-bold text-[#fdda7a] uppercase tracking-wider block">
                    Concurrency Guarantee
                  </span>
                  <p className="font-bold text-white text-[14px]">Row-Level ACID Locks</p>
                  <p className="text-[12px] text-white/50 leading-relaxed">
                    Uses MySQL <code className="text-[#c084fc]">SELECT ... FOR UPDATE</code> transactions to prevent overselling under extreme concurrency.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                  <span className="text-[11px] font-bold text-[#fdda7a] uppercase tracking-wider block">
                    Session Authentication
                  </span>
                  <p className="font-bold text-white text-[14px]">Cryptographic JWT + HttpOnly</p>
                  <p className="text-[12px] text-white/50 leading-relaxed">
                    Tokens are cryptographically signed with HMAC-SHA256, strictly expiring after 8 hours with 15-minute idle auto-locks.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                  <span className="text-[11px] font-bold text-[#fdda7a] uppercase tracking-wider block">
                    Abuse Prevention
                  </span>
                  <p className="font-bold text-white text-[14px]">Express Rate Limiting</p>
                  <p className="text-[12px] text-white/50 leading-relaxed">
                    Strict limits on authentication endpoints (max 10 attempts/15min) and booking creation to stop bot spam.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* Create / Edit Event Modal */}
      {/* ========================================================================= */}
      {isEventModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
        >
          <div className="relative w-full max-w-xl rounded-[28px] border border-white/10 bg-[#0d0d12] p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 id="modal-title" className="text-[20px] font-bold text-white">
                {editingEvent ? `Edit Summit: ${editingEvent.title}` : 'Create New Summit'}
              </h2>
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                aria-label="Close modal"
                className="p-1 rounded-lg text-white/40 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div role="alert" className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[12px] font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitEvent} className="space-y-4 text-[12px]">
              <div className="space-y-1">
                <label className="block font-bold text-white/70 uppercase">Summit Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141419] border border-white/10 text-[13px] text-white focus:border-[#9e6ce8] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-white/70 uppercase">Description</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141419] border border-white/10 text-[13px] text-white focus:border-[#9e6ce8] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-white/70 uppercase">Location / Venue *</label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141419] border border-white/10 text-[13px] text-white focus:border-[#9e6ce8] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-white/70 uppercase">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141419] border border-white/10 text-[13px] text-white focus:border-[#9e6ce8] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-white/70 uppercase">Total Seat Capacity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formSeats}
                    onChange={(e) => setFormSeats(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141419] border border-white/10 text-[13px] text-white focus:border-[#9e6ce8] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-white/70 uppercase">Base Price (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141419] border border-white/10 text-[13px] text-white focus:border-[#9e6ce8] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-white/70 uppercase">Image URL</label>
                <input
                  type="url"
                  value={formImg}
                  onChange={(e) => setFormImg(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141419] border border-white/10 text-[13px] text-white focus:border-[#9e6ce8] outline-none"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-white/60 hover:text-white font-bold text-[13px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-white hover:bg-[#fdda7a] text-black font-extrabold text-[13px] shadow-lg transition-transform hover:scale-105 cursor-pointer"
                >
                  {editingEvent ? 'Save Changes' : 'Create Summit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Two-Step Safe Delete Confirmation Modal */}
      {/* ========================================================================= */}
      {deletingEvent && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
        >
          <div className="w-full max-w-md rounded-[28px] border border-rose-500/30 bg-[#0d0d12] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <ShieldAlert className="w-6 h-6 flex-shrink-0" />
              <h2 className="text-[20px] font-bold text-white">Permanent Deletion Safety Check</h2>
            </div>
            <p className="text-[13px] text-white/60 leading-relaxed">
              You are requesting to permanently delete <strong className="text-white">{deletingEvent.title}</strong> and all linked attendee ticket registrations. This cannot be undone.
            </p>

            <div className="space-y-1.5 p-3 rounded-xl bg-white/[0.03] border border-white/10 text-[12px]">
              <label htmlFor="confirm-delete-input" className="block text-white/70 font-semibold">
                Type <strong className="text-rose-400 font-mono">DELETE</strong> below to unlock confirmation:
              </label>
              <input
                id="confirm-delete-input"
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 rounded-lg bg-[#141419] border border-white/15 text-white font-mono text-center tracking-widest text-[14px] focus:border-rose-400 outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeletingEvent(null);
                  setDeleteConfirmationText('');
                }}
                className="px-5 py-2.5 rounded-full text-white/60 hover:text-white font-bold text-[13px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmationText.trim().toUpperCase() !== 'DELETE'}
                onClick={handleConfirmDelete}
                className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-extrabold text-[13px] transition-all cursor-pointer"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Attendee Booking Details Modal */}
      {/* ========================================================================= */}
      {viewingPass && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="w-full max-w-lg rounded-[28px] border border-white/15 bg-[#0f0f14] p-6 space-y-6 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[12px] font-extrabold text-[#c084fc] bg-[#8617d0]/20 border border-[#8617d0]/40 px-2.5 py-0.5 rounded-full">
                    Pass #{viewingPass.ticket_code || formatTicketCode(viewingPass.event_id, viewingPass.id)}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3" />
                    Confirmed Pass
                  </span>
                </div>
                <h3 className="text-[20px] font-bold text-white tracking-tight">
                  Attendee Registration Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingPass(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Attendee Info Card */}
            <div className="p-4 rounded-[20px] bg-white/[0.03] border border-white/10 space-y-3">
              <span className="text-[11px] font-bold text-[#fdda7a] uppercase tracking-wider block">
                Attendee Contact Information
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
                <div>
                  <span className="text-[11px] text-white/40 block">Full Name</span>
                  <span className="font-bold text-white text-[15px]">{viewingPass.name}</span>
                </div>
                <div>
                  <span className="text-[11px] text-white/40 block">Email Address</span>
                  <span className="font-semibold text-white/90 break-all">{viewingPass.email}</span>
                </div>
                <div>
                  <span className="text-[11px] text-white/40 block">Mobile Phone</span>
                  <span className="font-semibold text-white/90">{viewingPass.mobile || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-white/40 block">Booked On</span>
                  <span className="font-mono text-white/70 text-[12px]">
                    {new Date(viewingPass.booking_date).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Summit & Pass Details */}
            <div className="p-4 rounded-[20px] bg-[#8617d0]/10 border border-[#8617d0]/30 space-y-3">
              <span className="text-[11px] font-bold text-[#c084fc] uppercase tracking-wider block">
                Conference & Pass Reservation
              </span>
              <div className="space-y-1.5">
                <div className="font-bold text-white text-[16px]">
                  {viewingPass.event_title}
                </div>
                {viewingPass.event_location && (
                  <div className="text-[12px] text-white/60 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#fdda7a] flex-shrink-0" />
                    <span>{viewingPass.event_location}</span>
                  </div>
                )}
                {viewingPass.event_date && (
                  <div className="text-[12px] text-white/60 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#9e6ce8] flex-shrink-0" />
                    <span>{new Date(viewingPass.event_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[13px]">
                <div>
                  <span className="text-[11px] text-white/40 block">Tier Category</span>
                  <span className="font-bold text-[#fdda7a]">{viewingPass.category_name || 'Standard Pass'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-white/40 block">Seats Reserved</span>
                  <span className="font-bold text-white text-center block">{viewingPass.quantity} Ticket(s)</span>
                </div>
                <div>
                  <span className="text-[11px] text-white/40 block">Total Amount</span>
                  <span className="font-black text-emerald-400 text-[16px]">
                    ${parseFloat(viewingPass.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Close Button */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setViewingPass(null)}
                className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-[13px] transition-colors cursor-pointer"
              >
                Close Pass Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
