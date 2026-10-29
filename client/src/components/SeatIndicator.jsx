import React from 'react';
import { Users, AlertTriangle, XCircle, CheckCircle, Radio } from 'lucide-react';

/**
 * SeatIndicator
 * Accessible real-time seat availability component with live pulse and WCAG compliance.
 */
export function SeatIndicator({ availableSeats, totalSeats = 100, isLive = true }) {
  const seats = Math.max(0, Number(availableSeats) || 0);
  const total = Number(totalSeats) || 100;
  const ratio = seats / total;

  let badgeStyle = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
  let Icon = CheckCircle;
  let label = `${seats} seats remaining`;
  let pulseColor = 'bg-emerald-400';

  if (seats === 0) {
    badgeStyle = 'bg-zinc-800/80 border-zinc-700/80 text-zinc-400';
    Icon = XCircle;
    label = 'Sold out';
    pulseColor = '';
  } else if (ratio <= 0.2 || seats <= 10) {
    badgeStyle = 'bg-rose-500/15 border-rose-500/35 text-rose-300';
    Icon = AlertTriangle;
    label = `Only ${seats} seats left`;
    pulseColor = 'bg-rose-400';
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-bold border backdrop-blur-md shadow-sm transition-all duration-300 ${badgeStyle}`}
    >
      {/* Live beacon indicator */}
      {isLive && seats > 0 && (
        <span className="relative flex h-2 w-2 flex-shrink-0" aria-hidden="true">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseColor}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${pulseColor}`} />
        </span>
      )}

      <Icon className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
      <span className="tracking-tight">{label}</span>
    </div>
  );
}
