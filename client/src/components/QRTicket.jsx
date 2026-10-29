import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { Download, Calendar, MapPin, Ticket, ShieldCheck } from 'lucide-react';

export function QRTicket({ booking }) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const ticketRef = useRef(null);

  const formattedDate = booking.event_date
    ? new Date(booking.event_date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  useEffect(() => {
    async function generateQR() {
      try {
        const qrPayload = JSON.stringify({
          ticketId: booking.id,
          eventId: booking.event_id,
          attendee: booking.name,
          email: booking.email,
          qty: booking.quantity,
          verified: true
        });

        const url = await QRCode.toDataURL(qrPayload, {
          width: 320,
          margin: 1.5,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
        setQrCodeDataUrl(url);
      } catch (err) {
        console.error('Failed to generate QR ticket:', err);
      }
    }

    if (booking?.id) {
      generateQR();
    }
  }, [booking]);

  const handleDownloadTicket = async () => {
    if (!ticketRef.current) return;
    try {
      setIsExporting(true);
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: '#0a0a0e',
        useCORS: true
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Summitra-Ticket-${booking.id}.png`;
      link.click();
    } catch (err) {
      console.error('Error exporting ticket PNG:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Ticket Container (Exportable) */}
      <div
        ref={ticketRef}
        className="relative max-w-xl mx-auto rounded-3xl overflow-hidden border border-surface-border bg-gradient-to-b from-[#13131a] to-[#09090c] p-8 shadow-2xl text-text-primary"
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-surface-raised/20 rounded-full blur-3xl pointer-events-none" />

        {/* Ticket Header */}
        <div className="flex items-center justify-between border-b border-surface-border/60 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-raised flex items-center justify-center">
              <Ticket className="w-5 h-5 text-text-primary" />
            </div>
            <div>
              <span className="font-extrabold tracking-wider text-xs uppercase text-brand-light block">
                Official Summit Pass
              </span>
              <span className="font-bold text-lg text-text-primary">
                Summitra Pass #{booking.id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-feedback-success/15 border border-feedback-success/30 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Confirmed
          </div>
        </div>

        {/* Event Title */}
        <h3 className="font-extrabold text-[20px] sm:text-[24px] text-white tracking-tight mb-4">
          {booking.event_title || 'Summitra Event Pass'}
        </h3>

        {/* Event Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-[13px]">
          <div className="space-y-1">
            <span className="text-[11px] text-white/50 flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-[#fdda7a]" />
              Date & Time
            </span>
            <p className="font-bold text-white">{formattedDate || 'Scheduled Event'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-white/50 flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-[#c084fc]" />
              Venue & Location
            </span>
            <p className="font-bold text-white truncate">{booking.event_location || 'Official Venue'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-white/50 font-bold uppercase tracking-wider block">Attendee Name</span>
            <p className="font-bold text-white">{booking.name}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-white/50 font-bold uppercase tracking-wider block">Tier & Quantity</span>
            <p className="font-bold text-[#fdda7a]">
              {booking.category_name || 'Standard'} • {booking.quantity} Ticket{booking.quantity > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Cutout notch effect */}
        <div className="relative border-t-2 border-dashed border-white/10 my-6">
          <div className="absolute -left-12 -top-4 w-8 h-8 rounded-full bg-[#000000]" />
          <div className="absolute -right-12 -top-4 w-8 h-8 rounded-full bg-[#000000]" />
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
          <div className="text-center sm:text-left space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-white/50 font-bold block">
              Scan at Entrance
            </span>
            <p className="text-[12px] text-white/60 max-w-[240px] leading-relaxed">
              Present this verified QR ticket to admission staff at entry turnstiles.
            </p>
            <p className="text-[11px] font-mono text-[#c084fc] pt-2">
              REF: {booking.idempotency_key ? booking.idempotency_key.slice(0, 16) : `TKT-${booking.id}`}
            </p>
          </div>

          {/* QR Code Image with accessible fallback */}
          <div className="p-3 bg-white rounded-2xl shadow-lg flex-shrink-0">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt={`QR code verification pass for booking #${booking.id}, attendee ${booking.name}`}
                className="w-32 h-32 block"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-200 animate-pulse rounded-lg" />
            )}
          </div>
        </div>
      </div>

      {/* Download Action Button */}
      <div className="text-center">
        <button
          type="button"
          onClick={handleDownloadTicket}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white hover:bg-[#fdda7a] text-black font-extrabold text-[14px] shadow-[0_8px_30px_rgba(253,218,122,0.25)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#8617d0]" />
          <span>{isExporting ? 'Generating PNG...' : 'Download Pass (PNG)'}</span>
        </button>
      </div>
    </div>
  );
}
