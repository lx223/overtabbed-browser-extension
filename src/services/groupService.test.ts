import { describe, it, expect, vi, beforeEach } from 'vitest';
import { groupService } from './groupService';
import { Group_GroupColor } from '@/utils/group';

describe('GroupService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllGroups', () => {
    it('returns all groups with tab IDs', async () => {
      const mockGroups: chrome.tabGroups.TabGroup[] = [
        { id: 1, windowId: 100, title: 'Work', color: 'blue', collapsed: false },
        { id: 2, windowId: 100, title: 'Personal', color: 'green', collapsed: true },
      ];

      vi.mocked(chrome.tabGroups.query).mockImplementation((_query, callback) => {
        callback?.(mockGroups);
        return Promise.resolve(mockGroups);
      });

      vi.mocked(chrome.tabs.query).mockImplementation((query, callback) => {
        if (query.groupId === 1) {
          callback?.([
            { id: 10, windowId: 100, groupId: 1, index: 0 } as chrome.tabs.Tab,
            { id: 11, windowId: 100, groupId: 1, index: 1 } as chrome.tabs.Tab,
          ]);
        } else if (query.groupId === 2) {
          callback?.([{ id: 20, windowId: 100, groupId: 2, index: 0 } as chrome.tabs.Tab]);
        }
        return Promise.resolve([]);
      });

      const groups = await groupService.getAllGroups();

      expect(groups).toHaveLength(2);
      expect(groups[0].title).toBe('Work');
      expect(groups[0].color).toBe(Group_GroupColor.BLUE);
      expect(groups[0].tabIds).toEqual([10, 11]);
      expect(groups[1].title).toBe('Personal');
      expect(groups[1].tabIds).toEqual([20]);
    });
  });

  describe('getTabsInGroup', () => {
    it('returns tabs for a specific group', async () => {
      vi.mocked(chrome.tabs.query).mockImplementation((_query, callback) => {
        callback?.([
          { id: 1, windowId: 100, groupId: 5, index: 0, title: 'Tab 1', pinned: false, active: true, highlighted: false, incognito: false, selected: false, autoDiscardable: true } as chrome.tabs.Tab,
        ]);
        return Promise.resolve([]);
      });

      const tabs = await groupService.getTabsInGroup(5);

      expect(tabs).toHaveLength(1);
      expect(chrome.tabs.query).toHaveBeenCalledWith({ groupId: 5 }, expect.any(Function));
    });
  });

  describe('createGroup', () => {
    it('creates a group from tab IDs', async () => {
      vi.mocked(chrome.tabs.group).mockImplementation((_options, callback) => {
        callback?.(99);
        return Promise.resolve(99);
      });

      const groupId = await groupService.createGroup([1, 2, 3]);

      expect(groupId).toBe(99);
      expect(chrome.tabs.group).toHaveBeenCalledWith({ tabIds: [1, 2, 3] }, expect.any(Function));
    });

    it('throws error for empty tab array', async () => {
      await expect(groupService.createGroup([])).rejects.toThrow('Cannot create group with no tabs');
    });
  });

  describe('ungroupTabs', () => {
    it('ungroups specified tabs', async () => {
      vi.mocked(chrome.tabs.ungroup).mockImplementation((_tabIds, callback) => {
        callback?.();
        return Promise.resolve();
      });

      await groupService.ungroupTabs([1, 2]);

      expect(chrome.tabs.ungroup).toHaveBeenCalledWith([1, 2], expect.any(Function));
    });

    it('does nothing for empty array', async () => {
      await groupService.ungroupTabs([]);
      expect(chrome.tabs.ungroup).not.toHaveBeenCalled();
    });
  });

  describe('updateGroup', () => {
    it('updates group properties', async () => {
      vi.mocked(chrome.tabGroups.update).mockImplementation((_groupId, _props, callback) => {
        callback?.({} as chrome.tabGroups.TabGroup);
        return Promise.resolve({} as chrome.tabGroups.TabGroup);
      });

      await groupService.updateGroup(1, {
        title: 'New Title',
        color: 'red',
        collapsed: true,
      });

      expect(chrome.tabGroups.update).toHaveBeenCalledWith(
        1,
        { title: 'New Title', color: 'red', collapsed: true },
        expect.any(Function)
      );
    });
  });

  describe('moveGroupToWindow', () => {
    it('moves group to specified window', async () => {
      vi.mocked(chrome.tabGroups.move).mockImplementation((_groupId, _props, callback) => {
        callback?.({} as chrome.tabGroups.TabGroup);
        return Promise.resolve({} as chrome.tabGroups.TabGroup);
      });

      await groupService.moveGroupToWindow(1, 200, 5);

      expect(chrome.tabGroups.move).toHaveBeenCalledWith(1, { windowId: 200, index: 5 }, expect.any(Function));
    });

    it('uses -1 as default index', async () => {
      vi.mocked(chrome.tabGroups.move).mockImplementation((_groupId, _props, callback) => {
        callback?.({} as chrome.tabGroups.TabGroup);
        return Promise.resolve({} as chrome.tabGroups.TabGroup);
      });

      await groupService.moveGroupToWindow(1, 200);

      expect(chrome.tabGroups.move).toHaveBeenCalledWith(1, { windowId: 200, index: -1 }, expect.any(Function));
    });
  });

  describe('addTabToGroup', () => {
    it('adds tab to existing group', async () => {
      vi.mocked(chrome.tabs.get).mockImplementation((_tabId, callback) => {
        callback?.({ id: 5, groupId: -1 } as chrome.tabs.Tab);
      });
      vi.mocked(chrome.tabs.query).mockImplementation((_query, callback) => {
        callback?.([{ id: 10 } as chrome.tabs.Tab, { id: 11 } as chrome.tabs.Tab]);
        return Promise.resolve([]);
      });
      vi.mocked(chrome.tabs.group).mockImplementation((_options, callback) => {
        callback?.(1);
        return Promise.resolve(1);
      });

      await groupService.addTabToGroup(5, 1);

      expect(chrome.tabs.group).toHaveBeenCalledWith({ tabIds: [10, 11, 5] }, expect.any(Function));
    });

    it('does nothing if tab already in target group', async () => {
      vi.mocked(chrome.tabs.get).mockImplementation((_tabId, callback) => {
        callback?.({ id: 5, groupId: 1 } as chrome.tabs.Tab);
      });

      await groupService.addTabToGroup(5, 1);

      expect(chrome.tabs.group).not.toHaveBeenCalled();
    });
  });
});

