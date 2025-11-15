/**
 * Background service worker for the extension
 * Handles extension lifecycle and tab/group/window events
 */

import { create } from '@bufbuild/protobuf';
import { BrowserEventMessage_EventType as Event, BrowserEventMessageSchema } from '@/generated/event_pb';
import { eventBus } from '@/utils/EventBus';

// Tab events
chrome.tabs.onUpdated.addListener((_tabId, changeInfo) => {
  if (changeInfo.status === 'complete' || changeInfo.title || changeInfo.pinned !== undefined) {
    eventBus.emit(create(BrowserEventMessageSchema, { type: Event.EVENT_TAB_UPDATED }));
  }
  if (changeInfo.groupId !== undefined) {
    eventBus.emit(create(BrowserEventMessageSchema, { type: Event.EVENT_TAB_GROUP_CHANGED }));
  }
});

chrome.tabs.onCreated.addListener(() => {
  eventBus.emit(create(BrowserEventMessageSchema, { type: Event.EVENT_TAB_CREATED }));
});

chrome.tabs.onRemoved.addListener(() => {
  eventBus.emit(create(BrowserEventMessageSchema, { type: Event.EVENT_TAB_REMOVED }));
});

chrome.tabs.onMoved.addListener(() => {
  eventBus.emit(create(BrowserEventMessageSchema, { type: Event.EVENT_TAB_MOVED }));
});

chrome.tabs.onAttached.addListener(() => {
  eventBus.emit(create(BrowserEventMessageSchema, { type: Event.EVENT_TAB_ATTACHED }));
});

chrome.tabs.onDetached.addListener(() => {
  eventBus.emit(create(BrowserEventMessageSchema, { type: Event.EVENT_TAB_DETACHED }));
});

chrome.tabs.onActivated.addListener(() => {
  eventBus.emit(create(BrowserEventMessageSchema, { type: Event.EVENT_TAB_ACTIVATED }));
});

chrome.tabs.onHighlighted.addListener(() => {
  eventBus.emit(create(BrowserEventMessageSchema, { type: Event.EVENT_TAB_HIGHLIGHTED }));
});

chrome.tabs.onReplaced.addListener(() => {
  eventBus.emit(create(BrowserEventMessageSchema, { type: Event.EVENT_TAB_REPLACED }));
});

// Tab group events
chrome.tabGroups.onCreated.addListener(() => {
  eventBus.emit(create(BrowserEventMessageSchema, { type: Event.EVENT_TAB_GROUP_CREATED }));
});

chrome.tabGroups.onUpdated.addListener(() => {
  eventBus.emit(create(BrowserEventMessageSchema, { type: Event.EVENT_TAB_GROUP_UPDATED }));
});

chrome.tabGroups.onRemoved.addListener(() => {
  eventBus.emit(create(BrowserEventMessageSchema, { type: Event.EVENT_TAB_GROUP_REMOVED }));
});

chrome.tabGroups.onMoved.addListener(() => {
  eventBus.emit(create(BrowserEventMessageSchema, { type: Event.EVENT_TAB_GROUP_MOVED }));
});

// Window events
chrome.windows.onCreated.addListener(() => {
  eventBus.emit(create(BrowserEventMessageSchema, { type: Event.EVENT_WINDOW_CREATED }));
});

chrome.windows.onRemoved.addListener(() => {
  eventBus.emit(create(BrowserEventMessageSchema, { type: Event.EVENT_WINDOW_REMOVED }));
});

chrome.windows.onFocusChanged.addListener(() => {
  eventBus.emit(create(BrowserEventMessageSchema, { type: Event.EVENT_WINDOW_FOCUS_CHANGED }));
});

chrome.windows.onBoundsChanged.addListener(() => {
  eventBus.emit(create(BrowserEventMessageSchema, { type: Event.EVENT_WINDOW_BOUNDS_CHANGED }));
});

// Extension lifecycle
chrome.runtime.onInstalled.addListener(() => {
  console.log('OverTabbed extension installed');
});

chrome.action.onClicked.addListener(async () => {
  const extensionUrl = chrome.runtime.getURL('index.html');
  const tabs = await chrome.tabs.query({ url: extensionUrl });

  if (tabs.length > 0) {
    const existingTab = tabs[0];
    await chrome.tabs.update(existingTab.id!, { active: true });
    if (existingTab.windowId) {
      await chrome.windows.update(existingTab.windowId, { focused: true });
    }
  } else {
    chrome.tabs.create({
      url: extensionUrl,
    });
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'open-extensions-page') {
    const extensionUrl = chrome.runtime.getURL('index.html');
    const tabs = await chrome.tabs.query({ url: extensionUrl });

    if (tabs.length > 0) {
      const existingTab = tabs[0];
      await chrome.tabs.update(existingTab.id!, { active: true });
      if (existingTab.windowId) {
        await chrome.windows.update(existingTab.windowId, { focused: true });
      }
    } else {
      chrome.tabs.create({
        url: extensionUrl,
      });
    }
  }
});
