/**
 * Service for managing tab groups
 * Follows SOLID principles by separating concerns
 */
import type { Group } from '@/utils/group';
import { createGroupFromChrome } from '@/utils/group';
import type { Tab } from '@/utils/tab';
import { createTabFromChrome } from '@/utils/tab';

class GroupService {
  /**
   * Get all groups
   */
  async getAllGroups(): Promise<Group[]> {
    return new Promise((resolve) => {
      chrome.tabGroups.query({}, async (chromeGroups) => {
        const groups: Group[] = [];

        for (const chromeGroup of chromeGroups) {
          const tabs = await this.getTabsInGroup(chromeGroup.id);
          groups.push(createGroupFromChrome(chromeGroup, tabs.map(t => t.id)));
        }

        resolve(groups);
      });
    });
  }

  /**
   * Get tabs in a specific group
   */
  async getTabsInGroup(groupId: number): Promise<Tab[]> {
    return new Promise((resolve) => {
      chrome.tabs.query({ groupId }, (tabs) => {
        resolve(tabs.map(createTabFromChrome));
      });
    });
  }

  /**
   * Create a new group from tabs
   */
  async createGroup(tabIds: number[]): Promise<number> {
    return new Promise((resolve) => {
      // Chrome API requires at least one tab ID
      if (tabIds.length === 0) {
        throw new Error('Cannot create group with no tabs');
      }
      chrome.tabs.group({ tabIds: tabIds as [number, ...number[]] }, (groupId) => {
        resolve(groupId);
      });
    });
  }

  /**
   * Ungroup tabs
   */
  async ungroupTabs(tabIds: number[]): Promise<void> {
    return new Promise((resolve) => {
      if (tabIds.length === 0) {
        resolve();
        return;
      }
      chrome.tabs.ungroup(tabIds as [number, ...number[]], () => {
        resolve();
      });
    });
  }

  /**
   * Update group properties
   */
  async updateGroup(
    groupId: number,
    properties: {
      title?: string;
      color?: chrome.tabGroups.Color;
      collapsed?: boolean;
    }
  ): Promise<void> {
    return new Promise((resolve) => {
      chrome.tabGroups.update(groupId, properties, () => {
        resolve();
      });
    });
  }

  /**
   * Move group to a new window or position
   */
  async moveGroupToWindow(groupId: number, windowId: number, index?: number): Promise<void> {
    return new Promise((resolve) => {
      // Chrome API requires index to be a number
      // If not provided, use -1 to place at end
      const targetIndex = index !== undefined && typeof index === 'number' ? index : -1;
      chrome.tabGroups.move(groupId, { windowId, index: targetIndex }, () => {
        resolve();
      });
    });
  }

  /**
   * Add a tab to an existing group
   */
  async addTabToGroup(tabId: number, groupId: number): Promise<void> {
    return new Promise(async (resolve) => {
      // Get the tab to check if it's already in a group
      chrome.tabs.get(tabId, async (tab) => {
        if (chrome.runtime.lastError) {
          resolve();
          return;
        }

        // If tab is already in this group, do nothing
        if (tab.groupId === groupId) {
          resolve();
          return;
        }

        // Get current tabs in the target group
        const currentTabs = await this.getTabsInGroup(groupId);
        const currentTabIds = currentTabs.map(t => t.id);

        // If tab is in a different group, ungroup it first
        if (tab.groupId !== undefined && tab.groupId !== -1) {
          await this.ungroupTabs([tabId]);
        }

        // Add the new tab to the list
        const allTabIds = [...currentTabIds, tabId];

        // Group all tabs together (this will add the tab to the existing group)
        // Chrome API requires at least one tab ID
        if (allTabIds.length === 0) {
          resolve();
          return;
        }
        chrome.tabs.group({ tabIds: allTabIds as [number, ...number[]] }, () => {
          resolve();
        });
      });
    });
  }
}

export const groupService = new GroupService();

