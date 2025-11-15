export type { Tab, Tab_MutedInfo } from '@/generated/tab_pb';
export { TabSchema, Tab_TabStatusSchema, Tab_MutedInfoSchema, Tab_TabStatus } from '@/generated/tab_pb';
import { create } from '@bufbuild/protobuf';
import type { Tab, Tab_MutedInfo } from '@/generated/tab_pb';
import { TabSchema, Tab_MutedInfoSchema, Tab_TabStatus } from '@/generated/tab_pb';

function chromeTabStatusToProtoStatus(status: chrome.tabs.TabStatus | undefined): Tab_TabStatus | undefined {
  if (!status) return undefined;
  const statusMap: Record<string, Tab_TabStatus> = {
    loading: Tab_TabStatus.LOADING,
    complete: Tab_TabStatus.COMPLETE,
  };
  return statusMap[status] ?? Tab_TabStatus.UNSPECIFIED;
}

export function createTabFromChrome(chromeTab: chrome.tabs.Tab): Tab {
  const mutedInfo: Tab_MutedInfo | undefined = chromeTab.mutedInfo
    ? create(Tab_MutedInfoSchema, {
        muted: chromeTab.mutedInfo.muted ?? false,
        reason: chromeTab.mutedInfo.reason,
        extensionId: chromeTab.mutedInfo.extensionId,
      })
    : undefined;

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
    highlighted: chromeTab.highlighted ?? false,
    discarded: chromeTab.discarded ?? false,
    audible: chromeTab.audible,
    mutedInfo,
    status: chromeTabStatusToProtoStatus(chromeTab.status as chrome.tabs.TabStatus | undefined),
  });
}

