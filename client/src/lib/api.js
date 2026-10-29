const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const API_BASE = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl.replace(/\/+$/, '') : `${rawApiUrl.replace(/\/+$/, '')}/api`)
  : '/api';

/**
 * Custom API Error class with error code and details
 */
export class ApiError extends Error {
  constructor(message, code = 'API_ERROR', status = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const token = localStorage.getItem('summitra_admin_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorInfo = data.error || {};
    throw new ApiError(
      errorInfo.message || `Request failed with status ${response.status}`,
      errorInfo.code || 'UNKNOWN_ERROR',
      response.status,
      errorInfo.details || null
    );
  }

  return data;
}

export const api = {
  // Events
  getEvents: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.set('q', params.q);
    if (params.location) searchParams.set('location', params.location);
    if (params.from) searchParams.set('from', params.from);
    if (params.to) searchParams.set('to', params.to);
    if (params.page) searchParams.set('page', params.page);
    if (params.limit) searchParams.set('limit', params.limit);
    const qs = searchParams.toString();
    return request(`/events${qs ? `?${qs}` : ''}`);
  },

  getEventById: (id) => request(`/events/${id}`),

  createEvent: (data) => request('/events', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  updateEvent: (id, data) => request(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  deleteEvent: (id) => request(`/events/${id}`, {
    method: 'DELETE'
  }),

  getEventBookings: (eventId) => request(`/events/${eventId}/bookings`),

  // Bookings
  createBooking: (bookingData, idempotencyKey = null) => {
    const headers = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    return request('/bookings', {
      method: 'POST',
      headers,
      body: JSON.stringify(bookingData)
    });
  },

  getBookingById: (id, email = '') => {
    const qs = email ? `?email=${encodeURIComponent(email)}` : '';
    return request(`/bookings/${id}${qs}`);
  },

  getAllBookings: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.eventId) searchParams.set('eventId', params.eventId);
    if (params.search) searchParams.set('search', params.search);
    const qs = searchParams.toString();
    return request(`/bookings${qs ? `?${qs}` : ''}`);
  },

  // Auth
  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),

  logout: () => request('/auth/logout', { method: 'POST' }),

  getMe: () => request('/auth/me'),

  // Health
  getHealth: () => request('/health')
};
