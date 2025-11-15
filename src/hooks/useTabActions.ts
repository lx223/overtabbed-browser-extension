import { useCallback } from 'react';
import { tabService } from '@/services/tabService';

export function useTabActions() {

  const pinTab = useCallback(async (tabId: number) => {
    await tabService.pinTab(tabId);
  }, []);

  const unpinTab = useCallback(async (tabId: number) => {
    await tabService.unpinTab(tabId);
  }, []);

  const closeTab = useCallback(async (tabId: number) => {
    await tabService.closeTab(tabId);
  }, []);

  const activateTab = useCallback(async (tabId: number) => {
    await tabService.activateTab(tabId);
  }, []);

  const toggleMuteTab = useCallback(async (tabId: number) => {
    await tabService.toggleMuteTab(tabId);
  }, []);

  const moveTab = useCallback(async (tabId: number, index: number, windowId?: number) => {
    await tabService.moveTab(tabId, index, windowId);
  }, []);

  return {
    pinTab,
    unpinTab,
    closeTab,
    activateTab,
    toggleMuteTab,
    moveTab,
  };
}

