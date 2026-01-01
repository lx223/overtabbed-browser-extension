import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tabService } from './tabService';

describe('TabService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllTabs', () => {
    it('returns all tabs mapped to Tab type', async () => {
      const mockChromeTabs = [
        { id: 1, windowId: 1, index: 0, title: 'Tab 1', url: 'https://test.com', pinned: false, active: true, highlighted: false, incognito: false, selected: false, autoDiscardable: true },
        { id: 2, windowId: 1, index: 1, title: 'Tab 2', url: 'https://example.com', pinned: true, active: false, highlighted: false, incognito: false, selected: false, autoDiscardable: true },
      ];

      vi.mocked(chrome.tabs.query).mockImplementation((_query, callback) => {
        callback?.(mockChromeTabs as chrome.tabs.Tab[]);
        return Promise.resolve(mockChromeTabs as chrome.tabs.Tab[]);
      });

      const tabs = await tabService.getAllTabs();

      expect(tabs).toHaveLength(2);
      expect(tabs[0].id).toBe(1);
      expect(tabs[0].title).toBe('Tab 1');
      expect(tabs[1].id).toBe(2);
      expect(tabs[1].pinned).toBe(true);
      expect(chrome.tabs.query).toHaveBeenCalledWith({}, expect.any(Function));
    });

    it('returns empty array when no tabs', async () => {
      vi.mocked(chrome.tabs.query).mockImplementation((_query, callback) => {
        callback?.([]);
        return Promise.resolve([]);
      });

      const tabs = await tabService.getAllTabs();
      expect(tabs).toHaveLength(0);
    });
  });

  describe('getTabsByWindow', () => {
    it('queries tabs by windowId', async () => {
      const mockChromeTabs = [
        { id: 1, windowId: 100, index: 0, title: 'Tab 1', pinned: false, active: true, highlighted: false, incognito: false, selected: false, autoDiscardable: true },
      ];

      vi.mocked(chrome.tabs.query).mockImplementation((_query, callback) => {
        callback?.(mockChromeTabs as chrome.tabs.Tab[]);
        return Promise.resolve(mockChromeTabs as chrome.tabs.Tab[]);
      });

      const tabs = await tabService.getTabsByWindow(100);

      expect(tabs).toHaveLength(1);
      expect(chrome.tabs.query).toHaveBeenCalledWith({ windowId: 100 }, expect.any(Function));
    });
  });

  describe('pinTab', () => {
    it('updates tab with pinned: true', async () => {
      vi.mocked(chrome.tabs.update).mockImplementation((_tabId, _updateInfo, callback) => {
        callback?.({} as chrome.tabs.Tab);
        return Promise.resolve({} as chrome.tabs.Tab);
      });

      await tabService.pinTab(1);

      expect(chrome.tabs.update).toHaveBeenCalledWith(1, { pinned: true }, expect.any(Function));
    });
  });

  describe('unpinTab', () => {
    it('updates tab with pinned: false', async () => {
      vi.mocked(chrome.tabs.update).mockImplementation((_tabId, _updateInfo, callback) => {
        callback?.({} as chrome.tabs.Tab);
        return Promise.resolve({} as chrome.tabs.Tab);
      });

      await tabService.unpinTab(1);

      expect(chrome.tabs.update).toHaveBeenCalledWith(1, { pinned: false }, expect.any(Function));
    });
  });

  describe('closeTab', () => {
    it('removes tab', async () => {
      vi.mocked(chrome.tabs.remove).mockImplementation((_tabId, callback) => {
        callback?.();
        return Promise.resolve();
      });

      await tabService.closeTab(1);

      expect(chrome.tabs.remove).toHaveBeenCalledWith(1, expect.any(Function));
    });
  });

  describe('activateTab', () => {
    it('updates tab with active: true', async () => {
      vi.mocked(chrome.tabs.update).mockImplementation((_tabId, _updateInfo, callback) => {
        callback?.({} as chrome.tabs.Tab);
        return Promise.resolve({} as chrome.tabs.Tab);
      });

      await tabService.activateTab(1);

      expect(chrome.tabs.update).toHaveBeenCalledWith(1, { active: true }, expect.any(Function));
    });
  });

  describe('moveTab', () => {
    it('moves tab to new index', async () => {
      vi.mocked(chrome.tabs.move).mockImplementation((_tabId, _moveProps, callback) => {
        callback?.({} as chrome.tabs.Tab);
        return Promise.resolve({} as chrome.tabs.Tab);
      });

      await tabService.moveTab(1, 5);

      expect(chrome.tabs.move).toHaveBeenCalledWith(1, { index: 5, windowId: undefined }, expect.any(Function));
    });

    it('moves tab to specific window', async () => {
      vi.mocked(chrome.tabs.move).mockImplementation((_tabId, _moveProps, callback) => {
        callback?.({} as chrome.tabs.Tab);
        return Promise.resolve({} as chrome.tabs.Tab);
      });

      await tabService.moveTab(1, 0, 200);

      expect(chrome.tabs.move).toHaveBeenCalledWith(1, { index: 0, windowId: 200 }, expect.any(Function));
    });
  });

  describe('toggleMuteTab', () => {
    it('unmutes a muted tab', async () => {
      vi.mocked(chrome.tabs.get).mockImplementation((_tabId, callback) => {
        callback?.({ mutedInfo: { muted: true } } as chrome.tabs.Tab);
      });
      vi.mocked(chrome.tabs.update).mockImplementation((_tabId, _updateInfo, callback) => {
        callback?.({} as chrome.tabs.Tab);
        return Promise.resolve({} as chrome.tabs.Tab);
      });

      await tabService.toggleMuteTab(1);

      expect(chrome.tabs.update).toHaveBeenCalledWith(1, { muted: false }, expect.any(Function));
    });

    it('mutes an unmuted tab', async () => {
      vi.mocked(chrome.tabs.get).mockImplementation((_tabId, callback) => {
        callback?.({ mutedInfo: { muted: false } } as chrome.tabs.Tab);
      });
      vi.mocked(chrome.tabs.update).mockImplementation((_tabId, _updateInfo, callback) => {
        callback?.({} as chrome.tabs.Tab);
        return Promise.resolve({} as chrome.tabs.Tab);
      });

      await tabService.toggleMuteTab(1);

      expect(chrome.tabs.update).toHaveBeenCalledWith(1, { muted: true }, expect.any(Function));
    });
  });

  describe('discardTab', () => {
    it('discards tab', async () => {
      vi.mocked(chrome.tabs.discard).mockImplementation((_tabId, callback) => {
        callback?.({} as chrome.tabs.Tab);
        return Promise.resolve({} as chrome.tabs.Tab);
      });

      await tabService.discardTab(1);

      expect(chrome.tabs.discard).toHaveBeenCalledWith(1, expect.any(Function));
    });
  });

  describe('duplicateTab', () => {
    it('duplicates tab', async () => {
      vi.mocked(chrome.tabs.duplicate).mockImplementation((_tabId, callback) => {
        callback?.({} as chrome.tabs.Tab);
        return Promise.resolve({} as chrome.tabs.Tab);
      });

      await tabService.duplicateTab(1);

      expect(chrome.tabs.duplicate).toHaveBeenCalledWith(1, expect.any(Function));
    });
  });
});

