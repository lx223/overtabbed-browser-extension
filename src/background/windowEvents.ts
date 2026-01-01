import { WINDOW_EVENTS, type WindowEventMessage } from '@/utils/eventTypes';
import { eventBus } from '@/utils/EventBus';

chrome.windows.onCreated.addListener((window) => {
  const message: WindowEventMessage = {
    type: WINDOW_EVENTS.CREATED,
    window,
  };
  eventBus.emit(message);
});

chrome.windows.onRemoved.addListener((windowId) => {
  const message: WindowEventMessage = {
    type: WINDOW_EVENTS.REMOVED,
    windowId,
  };
  eventBus.emit(message);
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  const message: WindowEventMessage = {
    type: WINDOW_EVENTS.FOCUS_CHANGED,
    windowId,
  };
  eventBus.emit(message);
});

chrome.windows.onBoundsChanged.addListener((window) => {
  const message: WindowEventMessage = {
    type: WINDOW_EVENTS.BOUNDS_CHANGED,
    window,
  };
  eventBus.emit(message);
});

