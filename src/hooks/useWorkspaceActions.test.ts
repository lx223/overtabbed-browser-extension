import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWorkspaceActions } from './useWorkspaceActions';
import { tabService } from '@/services/tabService';
import { groupService } from '@/services/groupService';
import type { Tab } from '@/utils/tab';

vi.mock('@/services/tabService', () => ({
  tabService: {
    moveTab: vi.fn(),
    closeTab: vi.fn(),
  },
}));

vi.mock('@/services/groupService', () => ({
  groupService: {
    createGroup: vi.fn(),
    updateGroup: vi.fn(),
  },
}));

const createMockTab = (overrides: Partial<Tab> = {}): Tab => ({
  id: 1,
  windowId: 100,
  groupId: -1,
  index: 0,
  url: 'https://example.com',
  title: 'Test Tab',
  active: false,
  pinned: false,
  highlighted: false,
  incognito: false,
  selected: false,
  autoDiscardable: true,
  ...overrides,
});

describe('useWorkspaceActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sortAllTabs', () => {
    it('sorts tabs by URL within each window', async () => {
      const { result } = renderHook(() => useWorkspaceActions());

      const tabs = [
        createMockTab({ id: 1, windowId: 100, index: 0, url: 'https://zebra.com', title: 'Zebra' }),
        createMockTab({ id: 2, windowId: 100, index: 1, url: 'https://apple.com', title: 'Apple' }),
        createMockTab({ id: 3, windowId: 100, index: 2, url: 'https://banana.com', title: 'Banana' }),
      ];

      await result.current.sortAllTabs(tabs);

      expect(tabService.moveTab).toHaveBeenCalledWith(2, 0, 100); // apple.com to index 0
      expect(tabService.moveTab).toHaveBeenCalledWith(3, 1, 100); // banana.com to index 1
    });

    it('sorts tabs across multiple windows independently', async () => {
      const { result } = renderHook(() => useWorkspaceActions());

      const tabs = [
        createMockTab({ id: 1, windowId: 100, index: 0, url: 'https://zebra.com' }),
        createMockTab({ id: 2, windowId: 100, index: 1, url: 'https://apple.com' }),
        createMockTab({ id: 3, windowId: 200, index: 0, url: 'https://yellow.com' }),
        createMockTab({ id: 4, windowId: 200, index: 1, url: 'https://blue.com' }),
      ];

      await result.current.sortAllTabs(tabs);

      expect(tabService.moveTab).toHaveBeenCalledWith(2, 0, 100); // apple.com in window 100
      expect(tabService.moveTab).toHaveBeenCalledWith(4, 0, 200); // blue.com in window 200
    });

    it('sorts by title when URLs are the same', async () => {
      const { result } = renderHook(() => useWorkspaceActions());

      const tabs = [
        createMockTab({ id: 1, windowId: 100, index: 0, url: 'https://example.com', title: 'Zebra' }),
        createMockTab({ id: 2, windowId: 100, index: 1, url: 'https://example.com', title: 'Apple' }),
      ];

      await result.current.sortAllTabs(tabs);

      expect(tabService.moveTab).toHaveBeenCalledWith(2, 0, 100);
    });

    it('does not move tabs already in correct position', async () => {
      const { result } = renderHook(() => useWorkspaceActions());

      const tabs = [
        createMockTab({ id: 1, windowId: 100, index: 0, url: 'https://apple.com' }),
        createMockTab({ id: 2, windowId: 100, index: 1, url: 'https://banana.com' }),
      ];

      await result.current.sortAllTabs(tabs);

      expect(tabService.moveTab).not.toHaveBeenCalled();
    });
  });

  describe('groupByDomain', () => {
    it('groups ungrouped tabs by domain', async () => {
      const { result } = renderHook(() => useWorkspaceActions());

      vi.mocked(groupService.createGroup).mockResolvedValue(1);

      const tabs = [
        createMockTab({ id: 1, groupId: -1, url: 'https://github.com/repo1' }),
        createMockTab({ id: 2, groupId: -1, url: 'https://github.com/repo2' }),
        createMockTab({ id: 3, groupId: -1, url: 'https://stackoverflow.com/question1' }),
      ];

      await result.current.groupByDomain(tabs);

      expect(groupService.createGroup).toHaveBeenCalledWith([1, 2]);
      expect(groupService.updateGroup).toHaveBeenCalledWith(1, { title: 'github.com' });
    });

    it('does not group already grouped tabs', async () => {
      const { result } = renderHook(() => useWorkspaceActions());

      const tabs = [
        createMockTab({ id: 1, groupId: 5, url: 'https://github.com/repo1' }),
        createMockTab({ id: 2, groupId: 5, url: 'https://github.com/repo2' }),
      ];

      await result.current.groupByDomain(tabs);

      expect(groupService.createGroup).not.toHaveBeenCalled();
    });

    it('does not create groups for single tabs', async () => {
      const { result } = renderHook(() => useWorkspaceActions());

      const tabs = [
        createMockTab({ id: 1, groupId: -1, url: 'https://github.com/repo1' }),
        createMockTab({ id: 2, groupId: -1, url: 'https://stackoverflow.com/question1' }),
      ];

      await result.current.groupByDomain(tabs);

      expect(groupService.createGroup).not.toHaveBeenCalled();
    });

    it('handles invalid URLs gracefully', async () => {
      const { result } = renderHook(() => useWorkspaceActions());

      const tabs = [
        createMockTab({ id: 1, groupId: -1, url: 'chrome://extensions' }),
        createMockTab({ id: 2, groupId: -1, url: 'invalid-url' }),
      ];

      await result.current.groupByDomain(tabs);

      expect(groupService.createGroup).not.toHaveBeenCalled();
    });
  });

  describe('findDuplicateTabs', () => {
    it('finds duplicate tabs with same URL', () => {
      const { result } = renderHook(() => useWorkspaceActions());

      const tabs = [
        createMockTab({ id: 1, url: 'https://example.com' }),
        createMockTab({ id: 2, url: 'https://example.com' }),
        createMockTab({ id: 3, url: 'https://github.com' }),
      ];

      const duplicates = result.current.findDuplicateTabs(tabs);

      expect(duplicates).toEqual([2]);
    });

    it('returns empty array when no duplicates', () => {
      const { result } = renderHook(() => useWorkspaceActions());

      const tabs = [
        createMockTab({ id: 1, url: 'https://example.com' }),
        createMockTab({ id: 2, url: 'https://github.com' }),
      ];

      const duplicates = result.current.findDuplicateTabs(tabs);

      expect(duplicates).toEqual([]);
    });

    it('keeps first tab and marks rest as duplicates', () => {
      const { result } = renderHook(() => useWorkspaceActions());

      const tabs = [
        createMockTab({ id: 1, url: 'https://example.com' }),
        createMockTab({ id: 2, url: 'https://example.com' }),
        createMockTab({ id: 3, url: 'https://example.com' }),
      ];

      const duplicates = result.current.findDuplicateTabs(tabs);

      expect(duplicates).toEqual([2, 3]);
      expect(duplicates).not.toContain(1);
    });

    it('handles tabs without URLs', () => {
      const { result } = renderHook(() => useWorkspaceActions());

      const tabs = [
        createMockTab({ id: 1, url: undefined }),
        createMockTab({ id: 2, url: undefined }),
      ];

      const duplicates = result.current.findDuplicateTabs(tabs);

      expect(duplicates).toEqual([]);
    });
  });

  describe('closeDuplicateTabs', () => {
    it('closes all specified duplicate tabs', async () => {
      const { result } = renderHook(() => useWorkspaceActions());

      await result.current.closeDuplicateTabs([2, 3, 4]);

      expect(tabService.closeTab).toHaveBeenCalledWith(2);
      expect(tabService.closeTab).toHaveBeenCalledWith(3);
      expect(tabService.closeTab).toHaveBeenCalledWith(4);
      expect(tabService.closeTab).toHaveBeenCalledTimes(3);
    });

    it('handles empty array', async () => {
      const { result } = renderHook(() => useWorkspaceActions());

      await result.current.closeDuplicateTabs([]);

      expect(tabService.closeTab).not.toHaveBeenCalled();
    });
  });
});
