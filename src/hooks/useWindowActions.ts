import { useCallback } from 'react';
import { windowService } from '@/services/windowService';

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

  return {
    createWindow,
    closeWindow,
    focusWindow,
  };
}

