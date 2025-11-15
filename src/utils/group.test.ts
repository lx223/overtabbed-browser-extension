import { describe, it, expect } from 'vitest';
import { createGroupFromChrome, Group_GroupColor } from './group';

describe('createGroupFromChrome', () => {
  it('creates a Group from Chrome tab group with all properties', () => {
    const chromeGroup: chrome.tabGroups.TabGroup = {
      id: 1,
      windowId: 100,
      title: 'Work',
      color: 'blue',
      collapsed: false,
    };

    const group = createGroupFromChrome(chromeGroup);

    expect(group.id).toBe(1);
    expect(group.windowId).toBe(100);
    expect(group.title).toBe('Work');
    expect(group.color).toBe(Group_GroupColor.BLUE);
    expect(group.collapsed).toBe(false);
  });

  it('creates a Group with collapsed state', () => {
    const chromeGroup: chrome.tabGroups.TabGroup = {
      id: 2,
      windowId: 100,
      title: 'Personal',
      color: 'green',
      collapsed: true,
    };

    const group = createGroupFromChrome(chromeGroup);

    expect(group.id).toBe(2);
    expect(group.collapsed).toBe(true);
  });

  it('maps all Chrome colors correctly', () => {
    const colorMappings: Array<{ chrome: chrome.tabGroups.Color; proto: Group_GroupColor }> = [
      { chrome: 'grey', proto: Group_GroupColor.GREY },
      { chrome: 'blue', proto: Group_GroupColor.BLUE },
      { chrome: 'red', proto: Group_GroupColor.RED },
      { chrome: 'yellow', proto: Group_GroupColor.YELLOW },
      { chrome: 'green', proto: Group_GroupColor.GREEN },
      { chrome: 'pink', proto: Group_GroupColor.PINK },
      { chrome: 'purple', proto: Group_GroupColor.PURPLE },
      { chrome: 'cyan', proto: Group_GroupColor.CYAN },
      { chrome: 'orange', proto: Group_GroupColor.ORANGE },
    ];

    colorMappings.forEach(({ chrome: chromeColor, proto: protoColor }) => {
      const chromeGroup: chrome.tabGroups.TabGroup = {
        id: 1,
        windowId: 100,
        color: chromeColor,
        collapsed: false,
      };

      const group = createGroupFromChrome(chromeGroup);
      expect(group.color).toBe(protoColor);
    });
  });

  it('handles group with empty title', () => {
    const chromeGroup: chrome.tabGroups.TabGroup = {
      id: 3,
      windowId: 100,
      title: '',
      color: 'grey',
      collapsed: false,
    };

    const group = createGroupFromChrome(chromeGroup);
    expect(group.title).toBe('');
  });

  it('handles group with undefined title', () => {
    const chromeGroup: chrome.tabGroups.TabGroup = {
      id: 4,
      windowId: 100,
      color: 'grey',
      collapsed: false,
    };

    const group = createGroupFromChrome(chromeGroup);
    expect(group.title).toBeUndefined();
  });
});
