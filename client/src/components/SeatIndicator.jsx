import React from 'react';
import { Users, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

/**
 * SeatIndicator
 * Accessible seat availability component.
 * Adheres to rule: Never convey seat status by color alone.
 * Uses icons + explicit textual labels + aria-live announcements.
 */
export function SeatIndicator({ availableSeats, totalSeats = 100, isLive = true }) {
  const seats = Math.max(0, Number(availableSeats) || 0);
  const total = Number(totalSeats) || 100;
  const ratio = seats / total;

  let badgeColor = 'bg-feedback-success/15 border-feedback-success/30 text-emerald-300';
  let Icon = CheckCircle;
  let label = `${seats} seats left`;

  if (seats === 0) {
    badgeColor = 'bg-surface-card border-surface-border text-text-tertiary';
    Icon = XCircle;
    label = 'Sold out';
  } else if (ratio <= 0.2 || seats <= 10) {
    badgeColor = 'bg-feedback-error/20 border-feedback-error/40 text-red-300';
    Icon = AlertTriangle;
    label = `Only ${seats} left`;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm transition-all duration-fast ${badgeColor}`}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
      <span>{label}</span>
      {isLive && seats > 0 && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-feedback-success animate-ping"
          title="Real-time live updates"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
