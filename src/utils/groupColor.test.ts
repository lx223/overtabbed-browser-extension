import { describe, it, expect } from 'vitest';
import { getGroupColor } from './groupColor';
import { Group_GroupColor } from './group';

describe('getGroupColor', () => {
  it('returns correct color for each group color enum', () => {
    expect(getGroupColor(Group_GroupColor.GREY)).toBe('#64748b');
    expect(getGroupColor(Group_GroupColor.BLUE)).toBe('#3b82f6');
    expect(getGroupColor(Group_GroupColor.RED)).toBe('#ef4444');
    expect(getGroupColor(Group_GroupColor.YELLOW)).toBe('#eab308');
    expect(getGroupColor(Group_GroupColor.GREEN)).toBe('#22c55e');
    expect(getGroupColor(Group_GroupColor.PINK)).toBe('#ec4899');
    expect(getGroupColor(Group_GroupColor.PURPLE)).toBe('#a855f7');
    expect(getGroupColor(Group_GroupColor.CYAN)).toBe('#06b6d4');
    expect(getGroupColor(Group_GroupColor.ORANGE)).toBe('#f97316');
  });

  it('returns grey for unspecified color', () => {
    expect(getGroupColor(Group_GroupColor.UNSPECIFIED)).toBe('#64748b');
  });

  it('returns grey for unknown color value', () => {
    expect(getGroupColor(999 as Group_GroupColor)).toBe('#64748b');
  });

  it('returns valid hex colors', () => {
    const hexColorRegex = /^#[0-9a-f]{6}$/i;
    const colors = [
      Group_GroupColor.GREY,
      Group_GroupColor.BLUE,
      Group_GroupColor.RED,
      Group_GroupColor.YELLOW,
      Group_GroupColor.GREEN,
      Group_GroupColor.PINK,
      Group_GroupColor.PURPLE,
      Group_GroupColor.CYAN,
      Group_GroupColor.ORANGE,
    ];

    colors.forEach((color) => {
      expect(getGroupColor(color)).toMatch(hexColorRegex);
    });
  });
});

