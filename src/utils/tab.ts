export type { Tab } from '@/generated/workspace_pb';
export { TabSchema } from '@/generated/workspace_pb';
import { create } from '@bufbuild/protobuf';
import type { Tab } from '@/generated/workspace_pb';
import { TabSchema } from '@/generated/workspace_pb';

export function createTabFromChrome(chromeTab: chrome.tabs.Tab): Tab {
  return create(TabSchema, {
    id: chromeTab.id!,
    windowId: chromeTab.windowId!,
    groupId: chromeTab.groupId,
    index: chromeTab.index!,
    url: chromeTab.url,
    title: chromeTab.title,
    favIconUrl: chromeTab.favIconUrl,
    pinned: chromeTab.pinned ?? false,
    active: chromeTab.active ?? false,
    muted: chromeTab.mutedInfo?.muted ?? false,
  });
}
