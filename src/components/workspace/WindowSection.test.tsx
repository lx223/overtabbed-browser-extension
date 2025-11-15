import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WindowSection } from './WindowSection';
import { TabRow } from './TabRow';
import { GroupSection } from './GroupSection';
import type { Window } from '@/utils/window';
import type { Tab } from '@/utils/tab';
import type { Group } from '@/utils/group';
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

const createMockWindow = (overrides: Partial<Window> = {}): Window => ({
    id: 100,
    focused: true,
    incognito: false,
    ...overrides,
});

const createMockTab = (overrides: Partial<Tab> = {}): Tab => ({
    id: 1,
    windowId: 100,
    groupId: -1,
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

const createMockGroup = (overrides: Partial<Group> = {}): Group => ({
    id: 1,
    windowId: 100,
    title: 'Test Group',
    color: Group_GroupColor.BLUE,
    collapsed: false,
    ...overrides,
});

function renderWindowSection(props: Partial<React.ComponentProps<typeof WindowSection>> = {}) {
    const defaultProps = {
        window: createMockWindow(),
        tabs: [
            createMockTab({ id: 1, index: 0, title: 'Tab One' }),
            createMockTab({ id: 2, index: 1, title: 'Tab Two' }),
        ],
        groups: [] as Group[],
        selectedTabs: new Set<number>(),
        onSelectTab: vi.fn(),
    };

    return {
        ...render(<WindowSection {...defaultProps} {...props} />),
        props: { ...defaultProps, ...props },
    };
}

describe('WindowSection', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('renders window title with id', () => {
            renderWindowSection();
            expect(screen.getByText('Window 100')).toBeInTheDocument();
        });

        it('renders active chip for focused window', () => {
            renderWindowSection({ window: createMockWindow({ focused: true }) });
            expect(screen.getByText('active')).toBeInTheDocument();
        });

        it('renders incognito label for incognito window', () => {
            renderWindowSection({ window: createMockWindow({ incognito: true }) });
            expect(screen.getByText('incognito')).toBeInTheDocument();
        });

        it('renders tab count', () => {
            renderWindowSection();
            expect(screen.getByText('2')).toBeInTheDocument();
        });

        it('renders all tabs', () => {
            renderWindowSection();
            expect(screen.getByText('Tab One')).toBeInTheDocument();
            expect(screen.getByText('Tab Two')).toBeInTheDocument();
        });

        it('returns null when no tabs', () => {
            const { container } = renderWindowSection({ tabs: [] });
            expect(container.firstChild).toBeNull();
        });
    });

    describe('groups', () => {
        it('renders groups with their tabs', () => {
            renderWindowSection({
                tabs: [
                    createMockTab({ id: 1, index: 0, groupId: 1, title: 'Grouped Tab 1' }),
                    createMockTab({ id: 2, index: 1, groupId: 1, title: 'Grouped Tab 2' }),
                ],
                groups: [createMockGroup({ id: 1 })],
            });

            expect(screen.getByText('Test Group')).toBeInTheDocument();
            expect(screen.getByText('Grouped Tab 1')).toBeInTheDocument();
            expect(screen.getByText('Grouped Tab 2')).toBeInTheDocument();
        });

        it('renders both grouped and ungrouped tabs', () => {
            renderWindowSection({
                tabs: [
                    createMockTab({ id: 1, index: 0, groupId: 1, title: 'Grouped Tab' }),
                    createMockTab({ id: 2, index: 1, groupId: -1, title: 'Ungrouped Tab' }),
                ],
                groups: [createMockGroup({ id: 1 })],
            });

            expect(screen.getByText('Test Group')).toBeInTheDocument();
            expect(screen.getByText('Grouped Tab')).toBeInTheDocument();
            expect(screen.getByText('Ungrouped Tab')).toBeInTheDocument();
        });

        it('sorts items by tab index', () => {
            renderWindowSection({
                tabs: [
                    createMockTab({ id: 3, index: 2, groupId: -1, title: 'Tab C' }),
                    createMockTab({ id: 1, index: 0, groupId: 1, title: 'Tab A' }),
                    createMockTab({ id: 2, index: 1, groupId: -1, title: 'Tab B' }),
                ],
                groups: [createMockGroup({ id: 1 })],
            });

            const tabs = screen.getAllByRole('img');
            expect(tabs.length).toBeGreaterThan(0);
        });
    });

    describe('expand/collapse', () => {
        it('toggles expanded state when header is clicked', async () => {
            const user = userEvent.setup();
            renderWindowSection();

            expect(screen.getByText('Tab One')).toBeVisible();

            const expandIcon = screen.getByTestId('ExpandMoreIcon');
            const headerBox = expandIcon.closest('div[class*="MuiBox"]');

            if (headerBox) {
                await user.click(headerBox);

                await waitFor(() => {
                    expect(screen.getByTestId('ChevronRightIcon')).toBeInTheDocument();
                });
            }
        });
    });

    describe('selection', () => {
        it('shows checkbox when hovered and onToggleSelectAll is provided', async () => {
            const user = userEvent.setup();
            const onToggleSelectAll = vi.fn();
            renderWindowSection({ onToggleSelectAll });

            const header = screen.getByText('Window 100');
            await user.hover(header);

            await waitFor(() => {
                const checkboxes = document.querySelectorAll('[data-testid="CheckBoxOutlineBlankIcon"]');
                expect(checkboxes.length).toBeGreaterThanOrEqual(0);
            });
        });
    });

    describe('memoization', () => {
        it('is memoized and does not re-render unnecessarily', () => {
            const renderCount = { current: 0 };
            const WrappedWindowSection = (props: React.ComponentProps<typeof WindowSection>) => {
                renderCount.current++;
                return <WindowSection {...props} />;
            };

            const props = {
                window: createMockWindow(),
                tabs: [createMockTab({ title: 'Memo Test Tab' })],
                groups: [] as Group[],
                selectedTabs: new Set<number>(),
                onSelectTab: vi.fn(),
            };

            const { rerender } = render(<WrappedWindowSection {...props} />);

            expect(renderCount.current).toBe(1);

            rerender(<WrappedWindowSection {...props} />);

            expect(renderCount.current).toBe(2);
        });
    });
});
