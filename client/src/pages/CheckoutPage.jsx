import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { socket } from '../lib/socket';
import {
  Clock,
  ShieldAlert,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Lock,
  Ticket,
  User,
  Mail,
  Phone
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
    <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Back button */}
      <div>
        <Link
          to={`/events/${id}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-text-tertiary hover:text-text-primary transition-colors focus-visible:ring-2 focus-visible:ring-brand-light rounded p-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Event Details
        </Link>
      </div>

      {/* Seat Reservation Countdown Timer Banner */}
      <div
        role="timer"
        aria-live="polite"
        className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-fast ${
          timeLeft <= 0
            ? 'bg-feedback-error/20 border-feedback-error text-red-200'
            : isExpiringSoon
            ? 'bg-feedback-warning/20 border-feedback-warning text-amber-200 animate-pulse'
            : 'bg-surface-card border-brand-purple/40 text-brand-light'
        }`}
      >
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 flex-shrink-0" />
          <div>
            <span className="font-bold text-sm block text-text-primary">
              {timeLeft <= 0
                ? 'Seat Hold Expired'
                : isExpiringSoon
                ? 'Seats Expiring Soon!'
                : 'Seats Temporarily Held For You'}
            </span>
            <span className="text-xs text-text-tertiary">
              {timeLeft <= 0
                ? 'Please return to the event page to renew reservation.'
                : 'Complete checkout before timer expires to guarantee admission.'}
            </span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <span className="font-mono text-2xl font-extrabold text-text-primary">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Error Summary if form validation fails */}
      {Object.keys(errors).length > 0 && (
        <div
          role="alert"
          tabIndex={-1}
          className="p-4 rounded-2xl bg-feedback-error/15 border border-feedback-error text-red-200 space-y-2 text-sm"
        >
          <div className="flex items-center gap-2 font-bold text-white">
            <AlertCircle className="w-5 h-5" />
            Please correct the errors below:
          </div>
          <ul className="list-disc pl-6 space-y-1">
            {Object.entries(errors).map(([field, msg]) => (
              <li key={field}>
                <a href={`#field-${field}`} className="underline hover:text-white">
                  {msg}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Grid: Form + Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} noValidate className="p-8 rounded-3xl border border-surface-border bg-surface-card space-y-6 shadow-xl">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                Attendee Information
              </h1>
              <p className="text-xs sm:text-sm text-text-tertiary">
                Enter ticket recipient information. Passes will be issued to this email.
              </p>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="field-name" className="block text-xs font-bold text-text-primary uppercase tracking-wider">
                Full Name <span className="text-feedback-error">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-text-tertiary absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                  className={`w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface-subtle border text-sm text-text-primary placeholder:text-text-tertiary/60 focus-visible:ring-2 focus-visible:ring-brand-light transition-colors ${
                    errors.name ? 'border-feedback-error' : 'border-surface-border'
                  }`}
                />
              </div>
              {errors.name && (
                <p id="error-name" className="text-xs text-feedback-error font-semibold">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="field-email" className="block text-xs font-bold text-text-primary uppercase tracking-wider">
                Email Address <span className="text-feedback-error">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-tertiary absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                  className={`w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface-subtle border text-sm text-text-primary placeholder:text-text-tertiary/60 focus-visible:ring-2 focus-visible:ring-brand-light transition-colors ${
                    errors.email ? 'border-feedback-error' : 'border-surface-border'
                  }`}
                />
              </div>
              {errors.email && (
                <p id="error-email" className="text-xs text-feedback-error font-semibold">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Mobile Phone Field */}
            <div className="space-y-2">
              <label htmlFor="field-mobile" className="block text-xs font-bold text-text-primary uppercase tracking-wider">
                Mobile Number <span className="text-feedback-error">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-text-tertiary absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="field-mobile"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  aria-invalid={Boolean(errors.mobile)}
                  aria-describedby={errors.mobile ? 'error-mobile' : undefined}
                  className={`w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface-subtle border text-sm text-text-primary placeholder:text-text-tertiary/60 focus-visible:ring-2 focus-visible:ring-brand-light transition-colors ${
                    errors.mobile ? 'border-feedback-error' : 'border-surface-border'
                  }`}
                />
              </div>
              {errors.mobile && (
                <p id="error-mobile" className="text-xs text-feedback-error font-semibold">
                  {errors.mobile}
                </p>
              )}
            </div>

            {/* Submit Button with specific label adhering to DESIGN.md tone rules */}
            <button
              type="submit"
              disabled={isSubmitting || timeLeft <= 0}
              className="w-full py-4 rounded-xl bg-surface-raised hover:bg-surface-strong disabled:opacity-40 disabled:cursor-not-allowed text-text-primary font-bold text-base shadow-[0_4px_25px_rgba(134,23,208,0.4)] transition-all duration-fast transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-brand-light min-h-[48px] flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              {isSubmitting
                ? 'Confirming Reservation...'
                : `Book ${quantity} Ticket${quantity > 1 ? 's' : ''} for $${totalAmount.toFixed(2)}`}
            </button>
          </form>
        </div>

        {/* Right 1 Col: Order Summary Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 p-6 rounded-3xl border border-surface-border bg-surface-card space-y-6 shadow-xl">
            <h2 className="text-lg font-bold text-text-primary border-b border-surface-border pb-4">
              Order Summary
            </h2>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-text-tertiary block font-semibold">Summit</span>
                <p className="font-bold text-text-primary leading-tight mt-0.5">
                  {event?.title || 'Selected Event'}
                </p>
              </div>

              <div>
                <span className="text-xs text-text-tertiary block font-semibold">Category</span>
                <p className="font-semibold text-brand-light">
                  {category?.name || 'Standard Pass'}
                </p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-text-tertiary">Quantity</span>
                <span className="font-bold text-text-primary">{quantity} Tickets</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-text-tertiary">Price per ticket</span>
                <span className="font-bold text-text-primary">${unitPrice.toFixed(2)}</span>
              </div>

              <div className="border-t border-surface-border pt-4 flex justify-between items-baseline">
                <span className="text-base font-bold text-text-primary">Total Amount</span>
                <span className="text-2xl font-extrabold text-text-primary">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border text-xs text-text-tertiary space-y-2">
              <div className="flex items-center gap-2 text-feedback-success font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                ACID Concurrency Protected
              </div>
              <p>Simulated instant checkout for Summitra assignment. No real payment required.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
