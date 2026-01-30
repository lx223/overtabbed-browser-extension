import React, { useState, useCallback, useMemo, memo } from 'react';
import { Box, Typography, IconButton, Collapse, Chip, Tooltip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import SortIcon from '@mui/icons-material/Sort';
import { TabRow } from './TabRow';
import { GroupSection } from './GroupSection';
import type { Window } from '@/utils/window';
import type { Tab } from '@/utils/tab';
import type { Group } from '@/utils/group';

export interface WindowSectionProps {
    window: Window;
    tabs: Tab[];
    groups: Group[];
    selectedTabs: Set<number>;
    searchQuery?: string;
    onSelectTab: (tabId: number, event: React.MouseEvent) => void;
    onToggleSelectAll?: (tabIds: number[], selectAll: boolean) => void;
    onSortTabs?: (windowId: number) => void;
}

type ListItem =
    | { type: 'group'; group: Group; tabs: Tab[]; index: number }
    | { type: 'tab'; tab: Tab; index: number };

const WindowSectionComponent: React.FC<WindowSectionProps> = ({
    window, tabs, groups, selectedTabs, searchQuery = '', onSelectTab, onToggleSelectAll, onSortTabs,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    const windowTabIds = useMemo(() => tabs.map(t => t.id), [tabs]);
    const selectedInWindow = useMemo(() => windowTabIds.filter(id => selectedTabs.has(id)).length, [windowTabIds, selectedTabs]);
    const allSelectedInWindow = selectedInWindow === windowTabIds.length && windowTabIds.length > 0;
    const someSelectedInWindow = selectedInWindow > 0 && !allSelectedInWindow;

    const listItems = useMemo(() => {
        const groupedTabIds = new Set(
            tabs
                .filter((tab) => tab.groupId !== undefined && tab.groupId !== -1)
                .map((tab) => tab.id)
        );
        const items: ListItem[] = [];

        for (const group of groups) {
            const groupTabs = tabs
                .filter((tab) => tab.groupId === group.id)
                .sort((a, b) => a.index - b.index);
            if (groupTabs.length > 0) {
                items.push({ type: 'group', group, tabs: groupTabs, index: Math.min(...groupTabs.map(t => t.index)) });
            }
        }

        for (const tab of tabs) {
            if (!groupedTabIds.has(tab.id)) {
                items.push({ type: 'tab', tab, index: tab.index });
            }
        }

        return items.sort((a, b) => a.index - b.index);
    }, [groups, tabs]);

    const handleToggleSelectAll = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleSelectAll?.(windowTabIds, !allSelectedInWindow);
    }, [onToggleSelectAll, windowTabIds, allSelectedInWindow]);

    const handleSortTabs = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onSortTabs?.(window.id);
    }, [onSortTabs, window.id]);

    if (tabs.length === 0) return null;

    const showCheckbox = (isHovered || selectedInWindow > 0) && onToggleSelectAll;
    const CheckboxIcon = allSelectedInWindow ? CheckBoxIcon : someSelectedInWindow ? IndeterminateCheckBoxIcon : CheckBoxOutlineBlankIcon;

    return (
        <Box sx={{ mb: 2 }}>
            <Box
                onClick={() => setIsExpanded(!isExpanded)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 0.75,
                    px: 0.5,
                    cursor: 'pointer',
                    borderRadius: 1,
                    '&:hover': { backgroundColor: 'var(--bg-hover)' },
                }}
            >
                <IconButton size="small" sx={{ p: 0, color: 'var(--text-tertiary)' }}>
                    {isExpanded ? <ExpandMoreIcon sx={{ fontSize: 20 }} /> : <ChevronRightIcon sx={{ fontSize: 20 }} />}
                </IconButton>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: window.focused ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                        }}
                    >
                        Window {window.id}
                    </Typography>
                    {window.focused && (
                        <Chip
                            label="active"
                            size="small"
                            sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                fontWeight: 500,
                                backgroundColor: 'var(--accent-primary)',
                                color: 'white',
                                '& .MuiChip-label': { px: 0.75 },
                            }}
                        />
                    )}
                    {window.incognito && (
                        <Typography component="span" sx={{ ml: 1, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            incognito
                        </Typography>
                    )}
                </Box>
                {onSortTabs && (
                    <Tooltip title="Sort tabs by URL and title">
                        <IconButton
                            size="small"
                            onClick={handleSortTabs}
                            sx={{
                                p: 0.25,
                                color: 'var(--text-tertiary)',
                                opacity: isHovered ? 1 : 0.7,
                                transition: 'opacity 0.15s',
                                '&:hover': { color: 'var(--accent-primary)' },
                            }}
                        >
                            <SortIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                )}
                {showCheckbox && (
                    <Tooltip title={allSelectedInWindow ? 'Deselect all' : 'Select all'}>
                        <IconButton
                            size="small"
                            onClick={handleToggleSelectAll}
                            sx={{
                                p: 0.25,
                                color: allSelectedInWindow || someSelectedInWindow ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                                opacity: isHovered || selectedInWindow > 0 ? 1 : 0,
                                transition: 'opacity 0.15s',
                                '&:hover': { color: 'var(--accent-primary)' },
                            }}
                        >
                            <CheckboxIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                )}
                <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {tabs.length}
                </Typography>
            </Box>
            <Collapse in={isExpanded}>
                <Box sx={{ pl: 1.5, borderLeft: '1px solid var(--border-subtle)', ml: 1.25 }}>
                    {listItems.map((item) => (
                        item.type === 'group' ? (
                            <GroupSection
                                key={`group-${item.group.id}`}
                                group={item.group}
                                tabs={item.tabs}
                                selectedTabs={selectedTabs}
                                searchQuery={searchQuery}
                                onSelectTab={onSelectTab}
                                onToggleSelectAll={onToggleSelectAll}
                            />
                        ) : (
                            <TabRow
                                key={`tab-${item.tab.id}`}
                                tab={item.tab}
                                isSelected={selectedTabs.has(item.tab.id)}
                                searchQuery={searchQuery}
                                onSelect={onSelectTab}
                            />
                        )
                    ))}
                </Box>
            </Collapse>
        </Box>
    );
};

export const WindowSection = memo(WindowSectionComponent);

