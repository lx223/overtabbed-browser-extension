import { useCallback } from 'react';
import { windowService } from '@/services/windowService';
import { tabService } from '@/services/tabService';
import type { Tab } from '@/utils/tab';

export function useWindowActions() {

  const createWindow = useCallback(async (url?: string) => {
    const window = await windowService.createWindow(url);
    return window;
  }, []);

  const closeWindow = useCallback(async (windowId: number) => {
    await windowService.closeWindow(windowId);
  }, []);

  const focusWindow = useCallback(async (windowId: number) => {
    await windowService.focusWindow(windowId);
  }, []);

  const sortTabsInWindow = useCallback(async (windowId: number, tabs: Tab[]) => {
    const windowTabs = tabs.filter(tab => tab.windowId === windowId);
    
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
        await tabService.moveTab(tab.id, i, windowId);
      }
    }
  }, []);

  return {
    createWindow,
    closeWindow,
    focusWindow,
    sortTabsInWindow,
  };
}

