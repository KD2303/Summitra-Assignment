import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Shield, Lock, Mail, AlertCircle, Eye, EyeOff, KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both administrator email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.login({ email: email.trim(), password });
      if (response.token) {
        localStorage.setItem('summitra_admin_token', response.token);
      }
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your administrator credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@summitra.com');
    setPassword('adminpassword');
    setError('');
  };

  return (
    <main id="main-content" className="max-w-md mx-auto px-4 py-16 sm:py-24 space-y-8">
      {/* Back to public site */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Summitra</span>
        </Link>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#fdda7a] px-2.5 py-1 rounded-full bg-[#fdda7a]/10 border border-[#fdda7a]/20">
          Admin Portal
        </span>
      </div>

      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#8617d0]/20 border border-[#8617d0]/40 text-[#c084fc] mb-2 shadow-[0_0_25px_rgba(134,23,208,0.3)]">
          <Shield className="w-7 h-7" />
        </div>
        <h1 className="text-[28px] sm:text-[32px] font-extrabold text-white tracking-tight">
          Admin <span className="text-[#fdda7a]">Control Center</span>
        </h1>
        <p className="text-[13px] text-white/50 leading-relaxed max-w-sm mx-auto">
          Authorized personnel only. Authenticate to manage inventory, ticket categories, and live reservations.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-[28px] border border-white/10 bg-[#0d0d12] space-y-6 shadow-2xl">
        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[12px] font-semibold flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="admin-email" className="block text-[11px] font-bold text-white/70 uppercase tracking-wider">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@summitra.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#141419] border border-white/10 text-[14px] text-white placeholder:text-white/30 focus:border-[#9e6ce8] focus:outline-none focus:ring-1 focus:ring-[#9e6ce8] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="admin-password" className="block text-[11px] font-bold text-white/70 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-11 pr-11 py-3 rounded-xl bg-[#141419] border border-white/10 text-[14px] text-white placeholder:text-white/30 focus:border-[#9e6ce8] focus:outline-none focus:ring-1 focus:ring-[#9e6ce8] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Secure Login Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 px-6 rounded-full text-[14px] font-extrabold transition-all duration-300 shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
              isSubmitting
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-white hover:bg-[#fdda7a] text-black shadow-[0_8px_30px_rgba(253,218,122,0.25)] hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Admin Portal'}</span>
            <span className="w-6 h-6 rounded-full bg-[#8617d0] text-white flex items-center justify-center">
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </form>

        {/* Quick Demo Helper (Controlled Fill) */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-white/50">
          <span>Testing evaluation mode</span>
          <button
            type="button"
            onClick={handleFillDemo}
            className="inline-flex items-center gap-1.5 text-[#fdda7a] hover:text-white font-bold transition-colors cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Use Demo Admin</span>
          </button>
        </div>
      </div>

      {/* Security Assurance Footer */}
      <div className="text-center text-[11px] text-white/40 space-y-1">
        <p>Protected by IP rate limiting, bcrypt cryptographic hashing &amp; 8-hour JWT session expiration.</p>
      </div>
    </main>
  );
}
