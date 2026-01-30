import { useCallback } from 'react';
import { tabService } from '@/services/tabService';
import { groupService } from '@/services/groupService';
import type { Tab } from '@/utils/tab';

export function useWorkspaceActions() {
  /**
   * Sort all tabs across all windows by URL
   */
  const sortAllTabs = useCallback(async (tabs: Tab[]) => {
    const tabsByWindow = tabs.reduce((acc, tab) => {
      if (!acc[tab.windowId]) {
        acc[tab.windowId] = [];
      }
      acc[tab.windowId].push(tab);
      return acc;
    }, {} as Record<number, Tab[]>);

    for (const [windowId, windowTabs] of Object.entries(tabsByWindow)) {
      const sortedTabs = [...windowTabs].sort((a, b) => {
        const urlA = (a.url || '').toLowerCase();
        const urlB = (b.url || '').toLowerCase();

        if (urlA !== urlB) {
          return urlA.localeCompare(urlB);
        }

        const titleA = (a.title || '').toLowerCase();
        const titleB = (b.title || '').toLowerCase();
        return titleA.localeCompare(titleB);
      });

      for (let i = 0; i < sortedTabs.length; i++) {
        const tab = sortedTabs[i];
        if (tab.index !== i) {
          await tabService.moveTab(tab.id, i, Number(windowId));
        }
      }
    }
  }, []);

  /**
   * Group ungrouped tabs by domain
   */
  const groupByDomain = useCallback(async (tabs: Tab[]) => {
    const ungroupedTabs = tabs.filter((tab) => tab.groupId === -1);

    const tabsByDomain = ungroupedTabs.reduce((acc, tab) => {
      try {
        const url = new URL(tab.url || '');
        const domain = url.hostname;

        if (!acc[domain]) {
          acc[domain] = [];
        }
        acc[domain].push(tab);
      } catch {
        // Skip invalid URLs
      }
      return acc;
    }, {} as Record<string, Tab[]>);

    for (const [domain, domainTabs] of Object.entries(tabsByDomain)) {
      if (domainTabs.length > 1) {
        const tabIds = domainTabs.map((t) => t.id);
        const groupId = await groupService.createGroup(tabIds);
        await groupService.updateGroup(groupId, { title: domain });
      }
    }
  }, []);

  /**
   * Find and return duplicate tabs (tabs with identical URLs)
   */
  const findDuplicateTabs = useCallback((tabs: Tab[]): number[] => {
    const urlMap = new Map<string, number[]>();

    tabs.forEach((tab) => {
      if (tab.url) {
        const existing = urlMap.get(tab.url) || [];
        existing.push(tab.id);
        urlMap.set(tab.url, existing);
      }
    });

    const duplicateTabIds: number[] = [];
    urlMap.forEach((tabIds) => {
      if (tabIds.length > 1) {
        // Keep the first tab, mark the rest as duplicates
        duplicateTabIds.push(...tabIds.slice(1));
      }
    });

    return duplicateTabIds;
  }, []);

  /**
   * Close duplicate tabs
   */
  const closeDuplicateTabs = useCallback(async (tabIds: number[]) => {
    for (const tabId of tabIds) {
      await tabService.closeTab(tabId);
    }
  }, []);

  return {
    sortAllTabs,
    groupByDomain,
    findDuplicateTabs,
    closeDuplicateTabs,
  };
}
