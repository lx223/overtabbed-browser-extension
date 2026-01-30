import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TopBar } from './TopBar';
import type { TabType } from '@/App';

const mockSetMode = vi.fn();
let mockMode = 'auto';

vi.mock('@/theme/ThemeContext', () => ({
    useTheme: () => ({
        mode: mockMode,
        setMode: mockSetMode,
        resolvedMode: 'dark',
    }),
}));

function renderTopBar(props: Partial<{ activeTab: TabType; onTabChange: (tab: TabType) => void }> = {}) {
    const defaultProps = {
        activeTab: 'workspace' as TabType,
        onTabChange: vi.fn(),
    };
    return {
        ...render(<TopBar {...defaultProps} {...props} />),
        onTabChange: props.onTabChange ?? defaultProps.onTabChange,
    };
}

describe('TopBar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockMode = 'auto';
    });

    describe('rendering', () => {
        it('renders the app title', () => {
            renderTopBar();
            expect(screen.getByText('Overtabbed')).toBeInTheDocument();
        });

        it('renders both navigation tabs', () => {
            renderTopBar();
            expect(screen.getByRole('tab', { name: /workspace/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /rules/i })).toBeInTheDocument();
        });

        it('renders all theme mode toggle buttons', () => {
            renderTopBar();
            expect(screen.getByRole('button', { name: /light mode/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /auto mode/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /dark mode/i })).toBeInTheDocument();
        });

        it('shows workspace tab as selected when activeTab is workspace', () => {
            renderTopBar({ activeTab: 'workspace' });
            const workspaceTab = screen.getByRole('tab', { name: /workspace/i });
            expect(workspaceTab).toHaveAttribute('aria-selected', 'true');
        });

        it('shows rules tab as selected when activeTab is rules', () => {
            renderTopBar({ activeTab: 'rules' });
            const rulesTab = screen.getByRole('tab', { name: /rules/i });
            expect(rulesTab).toHaveAttribute('aria-selected', 'true');
        });
    });

    describe('tab navigation', () => {
        it('calls onTabChange with "rules" when Rules tab is clicked', async () => {
            const user = userEvent.setup();
            const { onTabChange } = renderTopBar({ activeTab: 'workspace' });

            await user.click(screen.getByRole('tab', { name: /rules/i }));

            expect(onTabChange).toHaveBeenCalledWith('rules');
        });

        it('calls onTabChange with "workspace" when Workspace tab is clicked', async () => {
            const user = userEvent.setup();
            const { onTabChange } = renderTopBar({ activeTab: 'rules' });

            await user.click(screen.getByRole('tab', { name: /workspace/i }));

            expect(onTabChange).toHaveBeenCalledWith('workspace');
        });
    });

    describe('theme mode toggle', () => {
        it('calls setMode with "light" when light mode button is clicked', async () => {
            mockMode = 'dark';
            const user = userEvent.setup();
            renderTopBar();

            await user.click(screen.getByRole('button', { name: /light mode/i }));

            expect(mockSetMode).toHaveBeenCalledWith('light');
        });

        it('calls setMode with "auto" when auto mode button is clicked', async () => {
            mockMode = 'light';
            const user = userEvent.setup();
            renderTopBar();

            await user.click(screen.getByRole('button', { name: /auto mode/i }));

            expect(mockSetMode).toHaveBeenCalledWith('auto');
        });

        it('calls setMode with "dark" when dark mode button is clicked', async () => {
            mockMode = 'light';
            const user = userEvent.setup();
            renderTopBar();

            await user.click(screen.getByRole('button', { name: /dark mode/i }));

            expect(mockSetMode).toHaveBeenCalledWith('dark');
        });
    });

    describe('accessibility', () => {
        it('has proper tablist role for navigation tabs', () => {
            renderTopBar();
            expect(screen.getByRole('tablist')).toBeInTheDocument();
        });

        it('has proper group role for theme toggle buttons', () => {
            renderTopBar();
            const toggleGroup = screen.getByRole('group');
            expect(toggleGroup).toBeInTheDocument();
            expect(within(toggleGroup).getByRole('button', { name: /light mode/i })).toBeInTheDocument();
        });
    });
});

