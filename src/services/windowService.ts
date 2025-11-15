import type { Window } from '@/utils/window';
import { createWindowFromChrome } from '@/utils/window';

class WindowService {
  async getAllWindows(): Promise<Window[]> {
    return new Promise((resolve) => {
      chrome.windows.getAll({ populate: false }, (chromeWindows) => {
        resolve(chromeWindows.map(createWindowFromChrome));
      });
    });
  }

  async getWindow(windowId: number): Promise<Window | null> {
    return new Promise((resolve) => {
      chrome.windows.get(windowId, { populate: false }, (chromeWindow) => {
        if (chrome.runtime.lastError || !chromeWindow) {
          resolve(null);
          return;
        }
        resolve(createWindowFromChrome(chromeWindow));
      });
    });
  }

  async createWindow(url?: string): Promise<Window> {
    return new Promise((resolve) => {
      chrome.windows.create({ url }, (chromeWindow) => {
        if (!chromeWindow) {
          throw new Error('Failed to create window');
        }
        resolve(createWindowFromChrome(chromeWindow));
      });
    });
  }

  async closeWindow(windowId: number): Promise<void> {
    return new Promise((resolve) => {
      chrome.windows.remove(windowId, () => {
        resolve();
      });
    });
  }

  async focusWindow(windowId: number): Promise<void> {
    return new Promise((resolve) => {
      chrome.windows.update(windowId, { focused: true }, () => {
        resolve();
      });
    });
  }
}

export const windowService = new WindowService();

