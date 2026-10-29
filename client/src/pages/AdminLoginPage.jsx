import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Shield, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';

export function AdminLoginPage() {
  const [email, setEmail] = useState('admin@summitra.com');
  const [password, setPassword] = useState('adminpassword');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await api.login({ email, password });
      if (response.token) {
        localStorage.setItem('summitra_admin_token', response.token);
      }
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid administrator email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main id="main-content" className="max-w-md mx-auto px-4 py-20 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface-raised/20 border border-brand-purple/40 text-brand-light mb-2 shadow-[0_0_25px_rgba(134,23,208,0.3)]">
          <Shield className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
          Admin Control Center
        </h1>
        <p className="text-sm text-text-tertiary">
          Authenticate to manage events, ticket tiers, and view real-time attendee bookings.
        </p>
      </div>

      <div className="p-8 rounded-3xl border border-surface-border bg-surface-card space-y-6 shadow-2xl">
        {/* Quick Demo Credentials helper badge */}
        <div className="p-3.5 rounded-xl bg-surface-subtle border border-surface-border text-xs text-text-tertiary flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="font-bold text-text-primary block flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-light" />
              Demo Credentials Pre-filled:
            </span>
            <span className="font-mono">admin@summitra.com / adminpassword</span>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-feedback-error/20 border border-feedback-error text-red-200 text-xs font-semibold flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="admin-email" className="block text-xs font-bold text-text-primary uppercase tracking-wider">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-tertiary absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-subtle border border-surface-border text-sm text-text-primary focus-visible:ring-2 focus-visible:ring-brand-light"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="admin-password" className="block text-xs font-bold text-text-primary uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-tertiary absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-subtle border border-surface-border text-sm text-text-primary focus-visible:ring-2 focus-visible:ring-brand-light"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-surface-raised hover:bg-surface-strong text-text-primary font-bold text-sm shadow-[0_4px_20px_rgba(134,23,208,0.4)] transition-all duration-fast transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-brand-light min-h-[44px]"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In as Administrator'}
          </button>
        </form>
      </div>
    </main>
  );
}
