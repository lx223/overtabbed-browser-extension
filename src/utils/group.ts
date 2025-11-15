export type { Group } from '@/generated/group_pb';
export { GroupSchema, Group_GroupColorSchema, Group_GroupColor } from '@/generated/group_pb';
import { create } from '@bufbuild/protobuf';
import type { Group } from '@/generated/group_pb';
import { GroupSchema, Group_GroupColor } from '@/generated/group_pb';

function chromeColorToProtoColor(color: chrome.tabGroups.Color): Group_GroupColor {
  const colorMap: Record<string, Group_GroupColor> = {
    grey: Group_GroupColor.GREY,
    blue: Group_GroupColor.BLUE,
    red: Group_GroupColor.RED,
    yellow: Group_GroupColor.YELLOW,
    green: Group_GroupColor.GREEN,
    pink: Group_GroupColor.PINK,
    purple: Group_GroupColor.PURPLE,
    cyan: Group_GroupColor.CYAN,
    orange: Group_GroupColor.ORANGE,
  };
  return colorMap[color] ?? Group_GroupColor.UNSPECIFIED;
}

export function createGroupFromChrome(
  chromeGroup: chrome.tabGroups.TabGroup,
  tabIds: number[] = []
): Group {
  return create(GroupSchema, {
    id: chromeGroup.id,
    windowId: chromeGroup.windowId,
    title: chromeGroup.title,
    color: chromeColorToProtoColor(chromeGroup.color as chrome.tabGroups.Color),
    collapsed: chromeGroup.collapsed ?? false,
    tabIds,
  });
}

