import { useState, useEffect, useCallback } from 'react';
import { groupService } from '@/services/groupService';
import type { Group } from '@/utils/group';
import { TAB_GROUP_EVENTS } from '@/utils/eventTypes';
import { eventBus } from '@/utils/EventBus';

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allGroups = await groupService.getAllGroups();
      setGroups(allGroups);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load groups');
      setError(error);
      console.error('Failed to load groups:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();

    const eventHandler = (message: any) => {
      if (
        message.type === TAB_GROUP_EVENTS.CREATED ||
        message.type === TAB_GROUP_EVENTS.UPDATED ||
        message.type === TAB_GROUP_EVENTS.REMOVED ||
        message.type === TAB_GROUP_EVENTS.MOVED
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

