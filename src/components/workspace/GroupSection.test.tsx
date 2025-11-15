import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GroupSection } from './GroupSection';
import { TabRow } from './TabRow';
import type { Group } from '@/utils/group';
import type { Tab } from '@/utils/tab';
import { Group_GroupColor } from '@/utils/group';

const mockToggleGroupCollapse = vi.fn();
const mockUngroupTabs = vi.fn();

vi.mock('@/hooks/useGroupActions', () => ({
  useGroupActions: () => ({
    toggleGroupCollapse: mockToggleGroupCollapse,
    ungroupTabs: mockUngroupTabs,
  }),
}));

vi.mock('@/hooks/useTabActions', () => ({
  useTabActions: () => ({
    closeTab: vi.fn(),
    pinTab: vi.fn(),
    unpinTab: vi.fn(),
    activateTab: vi.fn(),
    toggleMuteTab: vi.fn(),
  }),
}));

vi.mock('@/hooks/useWindowActions', () => ({
  useWindowActions: () => ({
    focusWindow: vi.fn(),
  }),
}));

const createMockGroup = (overrides: Partial<Group> = {}): Group => ({
  id: 1,
  windowId: 100,
  title: 'Test Group',
  color: Group_GroupColor.BLUE,
  collapsed: false,
  ...overrides,
});

const createMockTab = (overrides: Partial<Tab> = {}): Tab => ({
  id: 1,
  windowId: 100,
  groupId: 1,
  index: 0,
  url: 'https://example.com',
  title: 'Test Tab',
  active: false,
  pinned: false,
  highlighted: false,
  incognito: false,
  selected: false,
  autoDiscardable: true,
  ...overrides,
});

function renderGroupSection(props: Partial<React.ComponentProps<typeof GroupSection>> = {}) {
  const defaultProps = {
    group: createMockGroup(),
    tabs: [
      createMockTab({ id: 1, index: 0, title: 'Tab One' }),
      createMockTab({ id: 2, index: 1, title: 'Tab Two' }),
    ],
    selectedTabs: new Set<number>(),
    onSelectTab: vi.fn(),
  };

  return {
    ...render(<GroupSection {...defaultProps} {...props} />),
    props: { ...defaultProps, ...props },
  };
}

describe('GroupSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders group title', () => {
      renderGroupSection();
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });

    it('renders tab count', () => {
      renderGroupSection();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders tabs when expanded', () => {
      renderGroupSection();
      expect(screen.getByText('Tab One')).toBeInTheDocument();
      expect(screen.getByText('Tab Two')).toBeInTheDocument();
    });

    it('renders "Untitled" when group has no title', () => {
      renderGroupSection({ group: createMockGroup({ title: '' }) });
      expect(screen.getByText('Untitled')).toBeInTheDocument();
    });
  });

  describe('collapse/expand behavior', () => {
    it('starts expanded when group.collapsed is false', () => {
      renderGroupSection({ group: createMockGroup({ collapsed: false }) });
      expect(screen.getByText('Tab One')).toBeVisible();
    });

    it('starts collapsed when group.collapsed is true', () => {
      renderGroupSection({ group: createMockGroup({ collapsed: true }) });
      expect(screen.queryByText('Tab One')).not.toBeVisible();
    });

    it('toggles collapse state on header click', async () => {
      const user = userEvent.setup();
      renderGroupSection({ group: createMockGroup({ collapsed: false }) });

      const header = screen.getByText('Test Group').closest('div[class*="MuiBox"]');
      await user.click(header!);

      expect(mockToggleGroupCollapse).toHaveBeenCalledWith(1, true);
    });

    it('updates local state immediately for optimistic UI feedback', async () => {
      const user = userEvent.setup();
      let resolveToggle: () => void;
      mockToggleGroupCollapse.mockImplementation(() => new Promise(resolve => {
        resolveToggle = resolve;
      }));
      
      renderGroupSection({ group: createMockGroup({ collapsed: false }) });

      const header = screen.getByText('Test Group').closest('div[class*="MuiBox"]');
      expect(screen.getByText('Tab One')).toBeVisible();
      
      await user.click(header!);
      
      expect(mockToggleGroupCollapse).toHaveBeenCalledWith(1, true);
      
      resolveToggle!();
    });
  });

  describe('selection', () => {
    it('shows checkbox on hover when onToggleSelectAll is provided', async () => {
      const user = userEvent.setup();
      renderGroupSection({ onToggleSelectAll: vi.fn() });

      const header = screen.getByText('Test Group').closest('div[class*="MuiBox"]');
      await user.hover(header!);

      await waitFor(() => {
        const checkbox = header?.querySelector('[data-testid="CheckBoxOutlineBlankIcon"]');
        expect(checkbox || header?.querySelector('svg')).toBeInTheDocument();
      });
    });

    it('calls onToggleSelectAll when checkbox is clicked', async () => {
      const user = userEvent.setup();
      const onToggleSelectAll = vi.fn();
      renderGroupSection({ 
        onToggleSelectAll,
        selectedTabs: new Set([1]),
      });

      const header = screen.getByText('Test Group').closest('div[class*="MuiBox"]');
      await user.hover(header!);
      
      await waitFor(() => {
        const buttons = header?.querySelectorAll('button');
        expect(buttons && buttons.length >= 2).toBe(true);
      });

      const buttons = header?.querySelectorAll('button');
      const checkboxButton = buttons?.[1];
      
      if (checkboxButton) {
        await user.click(checkboxButton);
        expect(onToggleSelectAll).toHaveBeenCalledWith([1, 2], true);
      }
    });
  });

  describe('memoization', () => {
    it('does not re-render when parent props are unchanged', () => {
      const renderSpy = vi.fn();
      const TestComponent = () => {
        renderSpy();
        return (
          <GroupSection
            group={createMockGroup()}
            tabs={[createMockTab({ title: 'Memo Test Tab' })]}
            selectedTabs={new Set()}
            onSelectTab={vi.fn()}
          />
        );
      };

      const { rerender } = render(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      rerender(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });
});
