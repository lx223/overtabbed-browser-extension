import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGroups } from './useGroups';
import { eventBus } from '@/utils/EventBus';
import { BrowserEventMessage_EventType as Event } from '@/generated/event_pb';

vi.mock('@/services/groupService', () => ({
  groupService: {
    getAllGroups: vi.fn(),
  },
}));

import { groupService } from '@/services/groupService';

describe('useGroups', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(groupService.getAllGroups).mockResolvedValue([
      {
        id: 1,
        windowId: 100,
        title: 'Test Group',
        color: 0,
        collapsed: false,
      },
    ]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial load', () => {
    it('loads groups on mount', async () => {
      const { result } = renderHook(() => useGroups());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(groupService.getAllGroups).toHaveBeenCalledTimes(1);
      expect(result.current.groups).toHaveLength(1);
      expect(result.current.groups[0].title).toBe('Test Group');
    });

    it('sets loading state correctly', async () => {
      const { result } = renderHook(() => useGroups());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('handles errors', async () => {
      vi.mocked(groupService.getAllGroups).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useGroups());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe('API Error');
    });
  });

  describe('event handling - tab group events', () => {
    it('refreshes groups on TAB_GROUP_CREATED', async () => {
      const { result } = renderHook(() => useGroups());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      vi.mocked(groupService.getAllGroups).mockResolvedValue([
        { id: 1, windowId: 100, title: 'Test Group', color: 0, collapsed: false },
        { id: 2, windowId: 100, title: 'New Group', color: 1, collapsed: false },
      ]);

      act(() => {
        eventBus.emit({ type: Event.EVENT_TAB_GROUP_CREATED });
      });

      await waitFor(() => {
        expect(groupService.getAllGroups).toHaveBeenCalledTimes(2);
      });
    });

    it('refreshes groups on TAB_GROUP_UPDATED', async () => {
      const { result } = renderHook(() => useGroups());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        eventBus.emit({ type: Event.EVENT_TAB_GROUP_UPDATED });
      });

      await waitFor(() => {
        expect(groupService.getAllGroups).toHaveBeenCalledTimes(2);
      });
    });

    it('refreshes groups on TAB_GROUP_REMOVED', async () => {
      const { result } = renderHook(() => useGroups());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        eventBus.emit({ type: Event.EVENT_TAB_GROUP_REMOVED });
      });

      await waitFor(() => {
        expect(groupService.getAllGroups).toHaveBeenCalledTimes(2);
      });
    });

    it('refreshes groups on TAB_GROUP_MOVED', async () => {
      const { result } = renderHook(() => useGroups());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        eventBus.emit({ type: Event.EVENT_TAB_GROUP_MOVED });
      });

      await waitFor(() => {
        expect(groupService.getAllGroups).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('event handling - tab events affecting groups', () => {
    it('refreshes groups on TAB_GROUP_CHANGED', async () => {
      const { result } = renderHook(() => useGroups());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      vi.mocked(groupService.getAllGroups).mockResolvedValue([
        { id: 1, windowId: 100, title: 'Test Group', color: 0, collapsed: false },
      ]);

      act(() => {
        eventBus.emit({ type: Event.EVENT_TAB_GROUP_CHANGED });
      });

      await waitFor(() => {
        expect(groupService.getAllGroups).toHaveBeenCalledTimes(2);
      });
    });

    it('refreshes groups on TAB_MOVED', async () => {
      const { result } = renderHook(() => useGroups());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        eventBus.emit({ type: Event.EVENT_TAB_MOVED });
      });

      await waitFor(() => {
        expect(groupService.getAllGroups).toHaveBeenCalledTimes(2);
      });
    });

    it('does NOT refresh on TAB_UPDATED', async () => {
      const { result } = renderHook(() => useGroups());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCallCount = vi.mocked(groupService.getAllGroups).mock.calls.length;

      act(() => {
        eventBus.emit({ type: Event.EVENT_TAB_UPDATED });
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(groupService.getAllGroups).toHaveBeenCalledTimes(initialCallCount);
    });
  });

  describe('refresh function', () => {
    it('provides a refresh function that reloads groups', async () => {
      const { result } = renderHook(() => useGroups());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(groupService.getAllGroups).toHaveBeenCalledTimes(1);

      await act(async () => {
        await result.current.refresh();
      });

      expect(groupService.getAllGroups).toHaveBeenCalledTimes(2);
    });
  });

  describe('cleanup', () => {
    it('unsubscribes from events on unmount', async () => {
      const { result, unmount } = renderHook(() => useGroups());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCallCount = vi.mocked(groupService.getAllGroups).mock.calls.length;

      unmount();

      act(() => {
        eventBus.emit({ type: Event.EVENT_TAB_GROUP_CREATED });
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(groupService.getAllGroups).toHaveBeenCalledTimes(initialCallCount);
    });
  });

  describe('concurrent load prevention', () => {
    it('prevents concurrent loads', async () => {
      let resolveFirst: () => void;
      const firstPromise = new Promise<any[]>((resolve) => {
        resolveFirst = () => resolve([{ id: 1, windowId: 100, title: 'Group 1', color: 0, collapsed: false }]);
      });

      vi.mocked(groupService.getAllGroups)
        .mockReturnValueOnce(firstPromise)
        .mockResolvedValue([{ id: 2, windowId: 100, title: 'Group 2', color: 0, collapsed: false }]);

      const { result } = renderHook(() => useGroups());

      expect(result.current.loading).toBe(true);

      act(() => {
        eventBus.emit({ type: Event.EVENT_TAB_GROUP_CREATED });
      });

      resolveFirst!();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });
});
