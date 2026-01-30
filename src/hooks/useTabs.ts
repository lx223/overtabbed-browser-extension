import { useState, useEffect, useCallback } from 'react';
import { tabService } from '@/services/tabService';
import type { Tab } from '@/utils/tab';
import { BrowserEventMessage_EventType as Event, type BrowserEventMessage } from '@/generated/event_pb';
import { eventBus } from '@/utils/EventBus';

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

    const eventHandler = (message: BrowserEventMessage) => {
      if (
        message.type === Event.EVENT_TAB_UPDATED ||
        message.type === Event.EVENT_TAB_CREATED ||
        message.type === Event.EVENT_TAB_REMOVED ||
        message.type === Event.EVENT_TAB_ATTACHED ||
        message.type === Event.EVENT_TAB_DETACHED ||
        message.type === Event.EVENT_TAB_MOVED ||
        message.type === Event.EVENT_TAB_GROUP_CHANGED
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
