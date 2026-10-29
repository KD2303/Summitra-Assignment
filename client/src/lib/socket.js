import { io } from 'socket.io-client';

const getSocketUrl = () => {
  const rawSocket = (import.meta.env.VITE_SOCKET_URL || '').trim();
  if (rawSocket) return rawSocket.replace(/\/+$/, '');

  const rawApi = (import.meta.env.VITE_API_URL || '').trim();
  if (rawApi) {
    try {
      const parsed = new URL(rawApi, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');
      return parsed.origin;
    } catch (e) {
      // ignore
    }
  }

  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return window.location.origin;
  }

  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  // Connected to Socket.IO server
});

socket.on('disconnect', (reason) => {
  // Disconnected
});
