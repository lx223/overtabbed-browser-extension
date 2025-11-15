import { useState, useEffect, useCallback, useRef } from 'react';
import { groupService } from '@/services/groupService';
import type { Group } from '@/utils/group';
import { BrowserEventMessage_EventType as Event, type BrowserEventMessage } from '@/generated/event_pb';
import { eventBus } from '@/utils/EventBus';

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const loadingRef = useRef(false);

  const loadGroups = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      setError(null);
      const allGroups = await groupService.getAllGroups();
      setGroups(allGroups);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load groups');
      setError(error);
      console.error('Failed to load groups:', err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadGroups();

    const eventHandler = (message: BrowserEventMessage) => {
      if (
        message.type === Event.EVENT_TAB_GROUP_CREATED ||
        message.type === Event.EVENT_TAB_GROUP_UPDATED ||
        message.type === Event.EVENT_TAB_GROUP_REMOVED ||
        message.type === Event.EVENT_TAB_GROUP_MOVED ||
        message.type === Event.EVENT_TAB_GROUP_CHANGED ||
        message.type === Event.EVENT_TAB_MOVED
      ) {
        loadGroups();
      }
    };

    const unsubscribe = eventBus.subscribe(eventHandler);

    return () => {
      unsubscribe();
    };
  }, [loadGroups]);

  return {
    groups,
    loading,
    error,
    refresh: loadGroups,
  };
}
