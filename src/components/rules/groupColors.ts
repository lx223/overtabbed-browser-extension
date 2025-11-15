export const GROUP_COLORS = ['grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'] as const;

export function getColorHex(color: string): string {
  const colors: Record<string, string> = {
    grey: '#6b7280',
    blue: '#3b82f6',
    red: '#ef4444',
    yellow: '#eab308',
    green: '#22c55e',
    pink: '#ec4899',
    purple: '#8b5cf6',
    cyan: '#06b6d4',
    orange: '#f97316',
  };
  return colors[color] || '#6b7280';
}



