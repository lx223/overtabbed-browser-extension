import { useState, useEffect, useCallback } from 'react';
import { windowService } from '@/services/windowService';
import type { Window } from '@/utils/window';
import { BrowserEventMessage_EventType as Event, type BrowserEventMessage } from '@/generated/event_pb';
import { eventBus } from '@/utils/EventBus';

export function useWindows() {
  const [windows, setWindows] = useState<Window[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadWindows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allWindows = await windowService.getAllWindows();
      setWindows(allWindows);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load windows');
      setError(error);
      console.error('Failed to load windows:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWindows();

    const eventHandler = (message: BrowserEventMessage) => {
      if (
        message.type === Event.EVENT_WINDOW_CREATED ||
        message.type === Event.EVENT_WINDOW_REMOVED ||
        message.type === Event.EVENT_WINDOW_FOCUS_CHANGED ||
        message.type === Event.EVENT_WINDOW_BOUNDS_CHANGED
      ) {
        loadWindows();
      }
    };

    const unsubscribe = eventBus.subscribe(eventHandler);

    return () => {
      unsubscribe();
    };
  }, [loadWindows]);

  return {
    windows,
    loading,
    error,
    refresh: loadWindows,
  };
}
