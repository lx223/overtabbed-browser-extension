export const TAB_EVENTS = {
  UPDATED: 'TAB_UPDATED',
  CREATED: 'TAB_CREATED',
  REMOVED: 'TAB_REMOVED',
  MOVED: 'TAB_MOVED',
  ATTACHED: 'TAB_ATTACHED',
  DETACHED: 'TAB_DETACHED',
  ACTIVATED: 'TAB_ACTIVATED',
  HIGHLIGHTED: 'TAB_HIGHLIGHTED',
  REPLACED: 'TAB_REPLACED',
} as const;

export type TabEventMessage =
  | {
    type: typeof TAB_EVENTS.UPDATED;
    tabId: number;
    changeInfo: chrome.tabs.OnUpdatedInfo;
  }
  | {
    type: typeof TAB_EVENTS.CREATED;
    tab: chrome.tabs.Tab;
  }
  | {
    type: typeof TAB_EVENTS.REMOVED;
    tabId: number;
  }
  | {
    type: typeof TAB_EVENTS.MOVED;
    tabId: number;
    moveInfo: chrome.tabs.OnMovedInfo;
  }
  | {
    type: typeof TAB_EVENTS.ATTACHED;
    tabId: number;
    attachInfo: chrome.tabs.OnAttachedInfo;
  }
  | {
    type: typeof TAB_EVENTS.DETACHED;
    tabId: number;
    detachInfo: chrome.tabs.OnDetachedInfo;
  }
  | {
    type: typeof TAB_EVENTS.ACTIVATED;
    activeInfo: chrome.tabs.OnActivatedInfo;
  }
  | {
    type: typeof TAB_EVENTS.HIGHLIGHTED;
    highlightInfo: chrome.tabs.OnHighlightedInfo;
  }
  | {
    type: typeof TAB_EVENTS.REPLACED;
    addedTabId: number;
    removedTabId: number;
  };

export const TAB_GROUP_EVENTS = {
  CREATED: 'TAB_GROUP_CREATED',
  UPDATED: 'TAB_GROUP_UPDATED',
  REMOVED: 'TAB_GROUP_REMOVED',
  MOVED: 'TAB_GROUP_MOVED',
} as const;

export const WINDOW_EVENTS = {
  CREATED: 'WINDOW_CREATED',
  REMOVED: 'WINDOW_REMOVED',
  FOCUS_CHANGED: 'WINDOW_FOCUS_CHANGED',
  BOUNDS_CHANGED: 'WINDOW_BOUNDS_CHANGED',
} as const;

export type TabGroupEventMessage =
  | {
    type: typeof TAB_GROUP_EVENTS.CREATED;
    group: chrome.tabGroups.TabGroup;
  }
  | {
    type: typeof TAB_GROUP_EVENTS.UPDATED;
    group: chrome.tabGroups.TabGroup;
  }
  | {
    type: typeof TAB_GROUP_EVENTS.REMOVED;
    group: chrome.tabGroups.TabGroup;
  }
  | {
    type: typeof TAB_GROUP_EVENTS.MOVED;
    group: chrome.tabGroups.TabGroup;
  };

export type WindowEventMessage =
  | {
    type: typeof WINDOW_EVENTS.CREATED;
    window: chrome.windows.Window;
  }
  | {
    type: typeof WINDOW_EVENTS.REMOVED;
    windowId: number;
  }
  | {
    type: typeof WINDOW_EVENTS.FOCUS_CHANGED;
    windowId: number;
  }
  | {
    type: typeof WINDOW_EVENTS.BOUNDS_CHANGED;
    window: chrome.windows.Window;
  };

