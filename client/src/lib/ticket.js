/**
 * Formats a unique, human-readable ticket pass code that combines
 * the unique event identifier and ticket pass sequence.
 * 
 * Example:
 * Event 1, Ticket 101 -> "EVT01-TKT-101"
 * Event 4, Ticket 502 -> "EVT04-TKT-502"
 */
export function formatTicketCode(eventId, bookingId) {
  if (!bookingId) return 'TKT-PENDING';
  const eStr = eventId !== undefined && eventId !== null ? String(eventId).padStart(2, '0') : '01';
  return `EVT${eStr}-TKT-${bookingId}`;
}
