import { describe, it, expect } from 'vitest';
import { createTabFromChrome, Tab_TabStatus } from './tab';

describe('createTabFromChrome', () => {
  it('creates a Tab from Chrome tab with all properties', () => {
    const chromeTab: chrome.tabs.Tab = {
      id: 1,
      windowId: 100,
      groupId: 5,
      index: 0,
      url: 'https://example.com',
      title: 'Example Page',
      favIconUrl: 'https://example.com/favicon.ico',
      pinned: true,
      active: true,
      highlighted: true,
      discarded: false,
      audible: true,
      status: 'complete',
      mutedInfo: {
        muted: true,
        reason: 'user',
      },
      incognito: false,
      selected: true,
      autoDiscardable: true,
    };

    const tab = createTabFromChrome(chromeTab);

    expect(tab.id).toBe(1);
    expect(tab.windowId).toBe(100);
    expect(tab.groupId).toBe(5);
    expect(tab.index).toBe(0);
    expect(tab.url).toBe('https://example.com');
    expect(tab.title).toBe('Example Page');
    expect(tab.favIconUrl).toBe('https://example.com/favicon.ico');
    expect(tab.pinned).toBe(true);
    expect(tab.active).toBe(true);
    expect(tab.highlighted).toBe(true);
    expect(tab.discarded).toBe(false);
    expect(tab.audible).toBe(true);
    expect(tab.status).toBe(Tab_TabStatus.COMPLETE);
    expect(tab.mutedInfo?.muted).toBe(true);
    expect(tab.mutedInfo?.reason).toBe('user');
  });

  it('handles tab with minimal properties', () => {
    const chromeTab: chrome.tabs.Tab = {
      id: 2,
      windowId: 100,
      index: 1,
      pinned: false,
      highlighted: false,
      incognito: false,
      selected: false,
      active: false,
      autoDiscardable: true,
    };

    const tab = createTabFromChrome(chromeTab);

    expect(tab.id).toBe(2);
    expect(tab.windowId).toBe(100);
    expect(tab.index).toBe(1);
    expect(tab.url).toBeUndefined();
    expect(tab.title).toBeUndefined();
    expect(tab.pinned).toBe(false);
    expect(tab.active).toBe(false);
    expect(tab.mutedInfo).toBeUndefined();
  });

  it('maps loading status correctly', () => {
    const chromeTab: chrome.tabs.Tab = {
      id: 3,
      windowId: 100,
      index: 0,
      status: 'loading',
      pinned: false,
      highlighted: false,
      incognito: false,
      selected: false,
      active: false,
      autoDiscardable: true,
    };

    const tab = createTabFromChrome(chromeTab);
    expect(tab.status).toBe(Tab_TabStatus.LOADING);
  });

  it('handles undefined status', () => {
    const chromeTab: chrome.tabs.Tab = {
      id: 4,
      windowId: 100,
      index: 0,
      pinned: false,
      highlighted: false,
      incognito: false,
      selected: false,
      active: false,
      autoDiscardable: true,
    };

    const tab = createTabFromChrome(chromeTab);
    expect(tab.status).toBeUndefined();
  });

  it('handles mutedInfo with extensionId', () => {
    const chromeTab: chrome.tabs.Tab = {
      id: 5,
      windowId: 100,
      index: 0,
      mutedInfo: {
        muted: true,
        reason: 'extension',
        extensionId: 'ext-123',
      },
      pinned: false,
      highlighted: false,
      incognito: false,
      selected: false,
      active: false,
      autoDiscardable: true,
    };

    const tab = createTabFromChrome(chromeTab);
    expect(tab.mutedInfo?.muted).toBe(true);
    expect(tab.mutedInfo?.reason).toBe('extension');
    expect(tab.mutedInfo?.extensionId).toBe('ext-123');
  });
});

