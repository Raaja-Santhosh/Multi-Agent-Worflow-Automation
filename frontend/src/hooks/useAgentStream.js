import { useState, useEffect, useRef, useCallback } from 'react';

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/task-runs';

export default function useAgentStream(runId) {
  const [events, setEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);

  const connect = useCallback(() => {
    if (!runId) return;

    if (wsRef.current) {
      wsRef.current.close();
    }

    setEvents([]);
    setError(null);

    const wsUrl = `${WS_BASE_URL}/${runId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setEvents((prev) => [...prev, payload]);
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setError('Connection error occurred.');
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      if (!event.wasClean) {
        setError(`Connection closed unexpectedly (code: ${event.code})`);
      }
    };
  }, [runId]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (runId) {
      connect();
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [runId, connect]);

  return {
    events,
    isConnected,
    error,
    connect,
    disconnect,
  };
}
