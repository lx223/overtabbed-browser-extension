import { useState, useEffect, useCallback } from 'react';
import { tabService } from '@/services/tabService';
import type { Tab } from '@/utils/tab';
import { TAB_EVENTS } from '@/utils/eventTypes';
import { eventBus, type EventMessage } from '@/utils/EventBus';

export function useTabs() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTabs = useCallback(async () => {
    try {
      setError(null);
      const allTabs = await tabService.getAllTabs();
      setTabs(allTabs);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load tabs');
      setError(error);
      console.error('Failed to load tabs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTabs();

    const eventHandler = (message: EventMessage) => {
      if (
        message.type === TAB_EVENTS.UPDATED ||
        message.type === TAB_EVENTS.CREATED ||
        message.type === TAB_EVENTS.REMOVED ||
        message.type === TAB_EVENTS.ATTACHED ||
        message.type === TAB_EVENTS.DETACHED ||
        message.type === TAB_EVENTS.MOVED
      ) {
        loadTabs();
      }
    };

    const unsubscribe = eventBus.subscribe(eventHandler);

    return () => {
      unsubscribe();
    };
  }, [loadTabs]);

  return {
    tabs,
    loading,
    error,
    refresh: loadTabs,
  };
}

