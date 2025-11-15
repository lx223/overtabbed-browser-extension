import { TAB_GROUP_EVENTS, type TabGroupEventMessage } from '@/utils/eventTypes';
import { eventBus } from '@/utils/EventBus';

chrome.tabGroups.onCreated.addListener((group) => {
  const message: TabGroupEventMessage = {
    type: TAB_GROUP_EVENTS.CREATED,
    group,
  };
  eventBus.emit(message);
});

chrome.tabGroups.onUpdated.addListener((group) => {
  const message: TabGroupEventMessage = {
    type: TAB_GROUP_EVENTS.UPDATED,
    group,
  };
  eventBus.emit(message);
});

chrome.tabGroups.onRemoved.addListener((group) => {
  const message: TabGroupEventMessage = {
    type: TAB_GROUP_EVENTS.REMOVED,
    group,
  };
  eventBus.emit(message);
});

chrome.tabGroups.onMoved.addListener((group) => {
  const message: TabGroupEventMessage = {
    type: TAB_GROUP_EVENTS.MOVED,
    group,
  };
  eventBus.emit(message);
});

