/**
 * Service for managing browser tabs
 * Follows SOLID principles by separating concerns
 */
import type { Tab } from '@/utils/tab';
import { createTabFromChrome } from '@/utils/tab';

class TabService {
  /**
   * Get all tabs across all windows
   */
  async getAllTabs(): Promise<Tab[]> {
    return new Promise((resolve) => {
      chrome.tabs.query({}, (tabs) => {
        resolve(tabs.map(createTabFromChrome));
      });
    });
  }

  /**
   * Get tabs for a specific window
   */
  async getTabsByWindow(windowId: number): Promise<Tab[]> {
    return new Promise((resolve) => {
      chrome.tabs.query({ windowId }, (tabs) => {
        resolve(tabs.map(createTabFromChrome));
      });
    });
  }

  /**
   * Pin a tab
   */
  async pinTab(tabId: number): Promise<void> {
    return new Promise((resolve) => {
      chrome.tabs.update(tabId, { pinned: true }, () => {
        resolve();
      });
    });
  }

  /**
   * Unpin a tab
   */
  async unpinTab(tabId: number): Promise<void> {
    return new Promise((resolve) => {
      chrome.tabs.update(tabId, { pinned: false }, () => {
        resolve();
      });
    });
  }

  /**
   * Close a tab
   */
  async closeTab(tabId: number): Promise<void> {
    return new Promise((resolve) => {
      chrome.tabs.remove(tabId, () => {
        resolve();
      });
    });
  }

  /**
   * Activate a tab
   */
  async activateTab(tabId: number): Promise<void> {
    return new Promise((resolve) => {
      chrome.tabs.update(tabId, { active: true }, () => {
        resolve();
      });
    });
  }

  /**
   * Move a tab to a new position
   */
  async moveTab(tabId: number, newIndex: number, windowId?: number): Promise<void> {
    return new Promise((resolve) => {
      chrome.tabs.move(tabId, { index: newIndex, windowId }, () => {
        resolve();
      });
    });
  }

  /**
   * Mute/unmute a tab
   */
  async toggleMuteTab(tabId: number): Promise<void> {
    return new Promise((resolve) => {
      chrome.tabs.get(tabId, (tab) => {
        if (tab) {
          chrome.tabs.update(tabId, { muted: !tab.mutedInfo?.muted }, () => {
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Discard a tab (unload it from memory)
   */
  async discardTab(tabId: number): Promise<void> {
    return new Promise((resolve) => {
      chrome.tabs.discard(tabId, () => {
        resolve();
      });
    });
  }

  /**
   * Duplicate a tab
   */
  async duplicateTab(tabId: number): Promise<void> {
    return new Promise((resolve) => {
      chrome.tabs.duplicate(tabId, () => {
        resolve();
      });
    });
  }
}

export const tabService = new TabService();

