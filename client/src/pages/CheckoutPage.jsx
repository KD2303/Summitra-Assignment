import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { socket } from '../lib/socket';
import {
  Clock,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Lock,
  Ticket,
  User,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';

export function CheckoutPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // State passed from details page
  const passedState = location.state || {};
  const [event, setEvent] = useState(passedState.event || null);
  const [category, setCategory] = useState(passedState.category || null);
  const [quantity, setQuantity] = useState(passedState.quantity || 1);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Seat Lock & TTL State (5 minutes)
  const [lockId, setLockId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 300s = 5 min
  const [lockError, setLockError] = useState(null);
  const idempotencyKeyRef = useRef(`summitra_idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);

  // Fetch event details if not passed via state
  const { data: eventData } = useQuery({
    queryKey: ['event', id],
    queryFn: () => api.getEventById(id),
    enabled: !event
  });

  useEffect(() => {
    if (eventData?.event && !event) {
      setEvent(eventData.event);
    }
  }, [eventData, event]);

  // Request seat hold from Socket.IO server on mount
  useEffect(() => {
    if (!id || !quantity) return;

    socket.emit('seats:lock', { eventId: id, quantity }, (response) => {
      if (response?.error) {
        setLockError(response.error);
      } else if (response?.lockId) {
        setLockId(response.lockId);
        const remainingSeconds = Math.max(0, Math.floor((response.expiresAt - Date.now()) / 1000));
        setTimeLeft(remainingSeconds || 300);
      }
    });

    return () => {
      if (lockId) {
        socket.emit('seats:unlock', { lockId });
      }
    };
  }, [id, quantity]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const unitPrice = category ? parseFloat(category.price) : (event ? parseFloat(event.price) : 0);
  const totalAmount = unitPrice * quantity;

  // Validate form fields
  const validateForm = () => {
    const errs = {};
    if (!name.trim() || name.trim().length < 2) {
      errs.name = 'Please enter your full name (minimum 2 characters)';
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      errs.email = 'Please provide a valid email address';
    }
    if (!mobile.trim() || mobile.trim().length < 7) {
      errs.mobile = 'Please provide a valid mobile number (min 7 digits)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    if (timeLeft <= 0) {
      setLockError('Your seat reservation has expired. Please refresh the page to re-reserve.');
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const payload = {
        eventId: Number(id),
        categoryId: category ? Number(category.id) : null,
        name: name.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        quantity: Number(quantity),
        lockId
      };

      const booking = await api.createBooking(payload, idempotencyKeyRef.current);

      // Navigate to success screen
      navigate(`/booking/${booking.id}/success`, {
        state: { booking }
      });
    } catch (err) {
      // Navigate to failure screen with actionable error
      navigate('/booking/failed', {
        state: {
          eventId: id,
          eventTitle: event?.title,
          code: err.code || 'BOOKING_FAILED',
          message: err.message || 'The requested seats could not be confirmed.'
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isExpiringSoon = timeLeft > 0 && timeLeft <= 60;

  return (
    <main id="main-content" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Navigation with Steps */}
      <div className="flex items-center justify-between">
        <Link
          to={`/events/${id}`}
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-white/60 hover:text-white transition-colors p-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Event Details</span>
        </Link>

        <div className="flex items-center gap-2 text-[12px] text-white/40">
          <span className="text-[#fdda7a] font-bold">Step 2 of 2</span>
          <span>• Checkout & Pass Issuance</span>
        </div>
      </div>

      {/* Seat Reservation Countdown Timer Banner */}
      <div
        role="timer"
        aria-live="polite"
        className={`p-4 sm:p-5 rounded-[20px] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 shadow-xl ${
          timeLeft <= 0
            ? 'bg-rose-500/10 border-rose-500/40 text-rose-200'
            : isExpiringSoon
            ? 'bg-amber-500/10 border-amber-500/40 text-amber-200 animate-pulse'
            : 'bg-[#0d0d12] border-[#8617d0]/40 text-white'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
              timeLeft <= 0
                ? 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                : isExpiringSoon
                ? 'bg-amber-500/20 border-amber-500/30 text-[#fdda7a]'
                : 'bg-[#8617d0]/20 border-[#8617d0]/40 text-[#fdda7a]'
            }`}
          >
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-[15px] block text-white">
              {timeLeft <= 0
                ? 'Seat Hold Expired'
                : isExpiringSoon
                ? 'Seats Expiring Soon!'
                : 'Seats Temporarily Held For You'}
            </span>
            <span className="text-[12px] text-white/50">
              {timeLeft <= 0
                ? 'Please return to the summit details page to renew your reservation.'
                : 'Complete checkout before the 5-minute timer expires to guarantee admission.'}
            </span>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center flex-shrink-0 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block sm:mb-0.5">
            Hold Timer
          </span>
          <div className="px-3.5 py-1 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-[22px] sm:text-[26px] font-extrabold text-[#fdda7a] tracking-wider leading-none">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Error Summary if form validation fails or lock error */}
      {(Object.keys(errors).length > 0 || lockError) && (
        <div
          role="alert"
          tabIndex={-1}
          className="p-4 sm:p-5 rounded-[20px] bg-rose-500/10 border border-rose-500/30 text-rose-200 space-y-2 text-[13px]"
        >
          <div className="flex items-center gap-2 font-bold text-rose-300">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>Please resolve the following before continuing:</span>
          </div>
          {lockError && <p className="font-medium text-rose-200">{lockError}</p>}
          {Object.keys(errors).length > 0 && (
            <ul className="list-disc pl-6 space-y-1 text-white/80">
              {Object.entries(errors).map(([field, msg]) => (
                <li key={field}>
                  <a href={`#field-${field}`} className="underline hover:text-white">
                    {msg}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Main Grid: Form + Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="p-6 sm:p-8 rounded-[28px] border border-white/10 bg-[#0d0d12] space-y-6 shadow-2xl"
          >
            <div className="space-y-1 pb-4 border-b border-white/10">
              <h1 className="text-[24px] sm:text-[28px] font-bold text-white tracking-tight leading-tight">
                Attendee <span className="text-[#fdda7a]">Information</span>
              </h1>
              <p className="text-[13px] text-white/50 leading-relaxed">
                Enter ticket recipient details. Official summit passes and QR entry credentials will be issued to this email.
              </p>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="field-name" className="block text-[11px] font-bold text-white/70 uppercase tracking-wider">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="field-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'error-name' : undefined}
                  className={`w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#141419] border text-[14px] text-white placeholder:text-white/30 focus:border-[#9e6ce8] focus:outline-none focus:ring-1 focus:ring-[#9e6ce8] transition-all ${
                    errors.name ? 'border-rose-500 ring-1 ring-rose-500' : 'border-white/10'
                  }`}
                />
              </div>
              {errors.name && (
                <p id="error-name" className="text-[12px] text-rose-400 font-semibold mt-1">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="field-email" className="block text-[11px] font-bold text-white/70 uppercase tracking-wider">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="field-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'error-email' : undefined}
                  className={`w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#141419] border text-[14px] text-white placeholder:text-white/30 focus:border-[#9e6ce8] focus:outline-none focus:ring-1 focus:ring-[#9e6ce8] transition-all ${
                    errors.email ? 'border-rose-500 ring-1 ring-rose-500' : 'border-white/10'
                  }`}
                />
              </div>
              {errors.email && (
                <p id="error-email" className="text-[12px] text-rose-400 font-semibold mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Mobile Phone Field */}
            <div className="space-y-2">
              <label htmlFor="field-mobile" className="block text-[11px] font-bold text-white/70 uppercase tracking-wider">
                Mobile Number <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="field-mobile"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 98765 43210"
                  aria-invalid={Boolean(errors.mobile)}
                  aria-describedby={errors.mobile ? 'error-mobile' : undefined}
                  className={`w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#141419] border text-[14px] text-white placeholder:text-white/30 focus:border-[#9e6ce8] focus:outline-none focus:ring-1 focus:ring-[#9e6ce8] transition-all ${
                    errors.mobile ? 'border-rose-500 ring-1 ring-rose-500' : 'border-white/10'
                  }`}
                />
              </div>
              {errors.mobile && (
                <p id="error-mobile" className="text-[12px] text-rose-400 font-semibold mt-1">
                  {errors.mobile}
                </p>
              )}
            </div>

            {/* Submit Button with Signature Summitra Pill Styling */}
            <button
              type="submit"
              disabled={isSubmitting || timeLeft <= 0}
              className={`w-full py-4 px-6 rounded-full text-[15px] font-extrabold transition-all duration-300 shadow-xl flex items-center justify-center gap-3 cursor-pointer ${
                isSubmitting || timeLeft <= 0
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                  : 'bg-white hover:bg-[#fdda7a] text-black shadow-[0_8px_30px_rgba(253,218,122,0.25)] hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Confirming Reservation...'
                  : `Confirm ${quantity} Ticket${quantity > 1 ? 's' : ''} for $${totalAmount.toFixed(2)}`}
              </span>
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  isSubmitting || timeLeft <= 0 ? 'bg-zinc-700 text-zinc-500' : 'bg-[#8617d0] text-white'
                }`}
              >
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          </form>
        </div>

        {/* Right 1 Col: Order Summary Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 p-6 sm:p-7 rounded-[28px] border border-white/10 bg-[#0d0d12] space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-white tracking-tight">
                Order Summary
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#8617d0]/20 border border-[#8617d0]/40 text-[#c084fc]">
                <Zap className="w-3 h-3 text-[#fdda7a]" />
                <span>Held</span>
              </span>
            </div>

            <div className="space-y-4 text-[13px]">
              <div>
                <span className="text-[11px] text-white/50 block font-bold uppercase tracking-wider">Summit</span>
                <p className="font-bold text-white text-[14px] leading-snug mt-1">
                  {event?.title || 'Selected Summit'}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-white/50 block font-bold uppercase tracking-wider">Tier Pass</span>
                <p className="font-bold text-[#fdda7a] text-[13px] mt-0.5">
                  {category?.name || 'Standard Pass'}
                </p>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <span className="text-white/60">Quantity</span>
                <span className="font-bold text-white text-[14px]">{quantity} Ticket{quantity > 1 ? 's' : ''}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white/60">Price per ticket</span>
                <span className="font-bold text-white text-[14px]">${unitPrice.toFixed(2)}</span>
              </div>

              <div className="border-t border-white/10 pt-4 flex justify-between items-baseline">
                <span className="text-[13px] uppercase font-bold tracking-wider text-white/70">Total Amount</span>
                <span className="text-[26px] sm:text-[30px] font-extrabold text-[#fdda7a] tracking-tight">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Security Guarantee Box with Proper 16px Rounded Corners */}
            <div className="p-4 rounded-[16px] bg-white/[0.03] border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-[12px]">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>ACID Concurrency Protected</span>
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed">
                Simulated instant checkout for Summitra assignment. No real credit card required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
