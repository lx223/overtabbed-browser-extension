import { useState, useEffect, useCallback } from 'react';
import { windowService } from '@/services/windowService';
import type { Window } from '@/utils/window';
import { WINDOW_EVENTS } from '@/utils/eventTypes';
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

    const eventHandler = (message: any) => {
      if (
        message.type === WINDOW_EVENTS.CREATED ||
        message.type === WINDOW_EVENTS.REMOVED ||
        message.type === WINDOW_EVENTS.FOCUS_CHANGED ||
        message.type === WINDOW_EVENTS.BOUNDS_CHANGED
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
