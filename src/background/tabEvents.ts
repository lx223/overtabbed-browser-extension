import { TAB_EVENTS, type TabEventMessage } from '@/utils/eventTypes';
import { eventBus } from '@/utils/EventBus';

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete' || changeInfo.title || changeInfo.pinned !== undefined) {
    const message: TabEventMessage = {
      type: TAB_EVENTS.UPDATED,
      tabId,
      changeInfo,
    };
    eventBus.emit(message);
  }
});

chrome.tabs.onCreated.addListener((tab: chrome.tabs.Tab) => {
  const message: TabEventMessage = {
    type: TAB_EVENTS.CREATED,
    tab,
  };
  eventBus.emit(message);
});

chrome.tabs.onRemoved.addListener((tabId: number) => {
  const message: TabEventMessage = {
    type: TAB_EVENTS.REMOVED,
    tabId,
  };
  eventBus.emit(message);
});

chrome.tabs.onMoved.addListener((tabId, moveInfo) => {
  const message: TabEventMessage = {
    type: TAB_EVENTS.MOVED,
    tabId,
    moveInfo,
  };
  eventBus.emit(message);
});

chrome.tabs.onAttached.addListener((tabId, attachInfo) => {
  const message: TabEventMessage = {
    type: TAB_EVENTS.ATTACHED,
    tabId,
    attachInfo,
  };
  eventBus.emit(message);
});

chrome.tabs.onDetached.addListener((tabId, detachInfo) => {
  const message: TabEventMessage = {
    type: TAB_EVENTS.DETACHED,
    tabId,
    detachInfo,
  };
  eventBus.emit(message);
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  const message: TabEventMessage = {
    type: TAB_EVENTS.ACTIVATED,
    activeInfo,
  };
  eventBus.emit(message);
});

chrome.tabs.onHighlighted.addListener((highlightInfo) => {
  const message: TabEventMessage = {
    type: TAB_EVENTS.HIGHLIGHTED,
    highlightInfo,
  };
  eventBus.emit(message);
});

chrome.tabs.onReplaced.addListener((addedTabId: number, removedTabId: number) => {
  const message: TabEventMessage = {
    type: TAB_EVENTS.REPLACED,
    addedTabId,
    removedTabId,
  };
  eventBus.emit(message);
});

