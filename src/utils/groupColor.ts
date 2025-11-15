import { Group_GroupColor } from '@/utils/group';

export const getGroupColor = (color: Group_GroupColor): string => {
  const colorMap: Record<Group_GroupColor, string> = {
    [Group_GroupColor.UNSPECIFIED]: '#64748b',
    [Group_GroupColor.GREY]: '#64748b',
    [Group_GroupColor.BLUE]: '#3b82f6',
    [Group_GroupColor.RED]: '#ef4444',
    [Group_GroupColor.YELLOW]: '#eab308',
    [Group_GroupColor.GREEN]: '#22c55e',
    [Group_GroupColor.PINK]: '#ec4899',
    [Group_GroupColor.PURPLE]: '#a855f7',
    [Group_GroupColor.CYAN]: '#06b6d4',
    [Group_GroupColor.ORANGE]: '#f97316',
  };
  return colorMap[color] || colorMap[Group_GroupColor.GREY];
};



