import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socket } from '../lib/socket';

/**
 * Custom hook for real-time seat availability updates
 * Joins room `event:{eventId}` and listens for `seats:update`
 */
export function useSeats(eventId, initialSeats = 0) {
  const [availableSeats, setAvailableSeats] = useState(initialSeats);
  const [effectiveSeats, setEffectiveSeats] = useState(initialSeats);
  const [isLive, setIsLive] = useState(socket.connected);
  const [lastUpdated, setLastUpdated] = useState(null);
  const queryClient = useQueryClient();
  const eventIdRef = useRef(eventId);

  useEffect(() => {
    eventIdRef.current = eventId;
  }, [eventId]);

  useEffect(() => {
    setAvailableSeats(initialSeats);
    setEffectiveSeats(initialSeats);
  }, [initialSeats]);

  useEffect(() => {
    if (!eventId) return;

    // Join event room
    socket.emit('event:join', { eventId });

    // Track connection state
    const handleConnect = () => {
      setIsLive(true);
      socket.emit('event:join', { eventId: eventIdRef.current });
      // Refetch event query on reconnect to ensure fresh state
      queryClient.invalidateQueries({ queryKey: ['event', String(eventIdRef.current)] });
    };

    const handleDisconnect = () => {
      setIsLive(false);
    };

    // Listen for room seat updates
    const handleSeatsUpdate = (data) => {
      if (Number(data.eventId) === Number(eventIdRef.current)) {
        if (data.availableSeats !== undefined) {
          setAvailableSeats(data.availableSeats);
        }
        if (data.effectiveAvailableSeats !== undefined) {
          setEffectiveSeats(data.effectiveAvailableSeats);
        } else if (data.availableSeats !== undefined) {
          setEffectiveSeats(data.availableSeats);
        }
        setLastUpdated(new Date());

        // Also invalidate cached queries
        queryClient.invalidateQueries({ queryKey: ['event', String(eventIdRef.current)] });
        queryClient.invalidateQueries({ queryKey: ['events'] });
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('seats:update', handleSeatsUpdate);

    return () => {
      socket.emit('event:leave', { eventId });
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('seats:update', handleSeatsUpdate);
    };
  }, [eventId, queryClient]);

  return {
    availableSeats,
    effectiveSeats,
    isLive,
    lastUpdated
  };
}
