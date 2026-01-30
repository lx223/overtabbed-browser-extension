import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
    Box, Typography, TextField, InputAdornment, IconButton, Tooltip, Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { WindowSection } from './WindowSection';
import { QuickActions } from './QuickActions';
import { ConfirmDialog } from '@/components/common';
import { useWindows } from '@/hooks/useWindows';
import { useTabs } from '@/hooks/useTabs';
import { useGroups } from '@/hooks/useGroups';
import { useTabActions } from '@/hooks/useTabActions';
import { useWindowActions } from '@/hooks/useWindowActions';
import { useWorkspaceActions } from '@/hooks/useWorkspaceActions';
import { fuzzyMatch } from '@/utils/fuzzySearch';
import { searchFieldSx } from '@/theme/formStyles';

export const WorkspacePage: React.FC = () => {
    const { windows, loading: windowsLoading } = useWindows();
    const { tabs: allTabs, loading: tabsLoading } = useTabs();
    const { groups: allGroups, loading: groupsLoading } = useGroups();
    const { closeTab } = useTabActions();
    const { sortTabsInWindow } = useWindowActions();
    const { sortAllTabs, groupByDomain, findDuplicateTabs, closeDuplicateTabs } = useWorkspaceActions();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTabs, setSelectedTabs] = useState<Set<number>>(new Set());
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);
    const [showDedupConfirm, setShowDedupConfirm] = useState(false);
    const [duplicateTabIds, setDuplicateTabIds] = useState<number[]>([]);
    const previousTabIdsRef = useRef<Set<number>>(new Set());

    const loading = windowsLoading || tabsLoading || groupsLoading;

    const currentTabIds = useMemo(() => new Set(allTabs.map((t) => t.id)), [allTabs]);

    const filteredTabIds = useMemo(() => {
        if (!searchQuery.trim()) return new Set(allTabs.map((t) => t.id));
        return new Set(
            allTabs
                .filter((tab) => fuzzyMatch(searchQuery, tab.title || '') || fuzzyMatch(searchQuery, tab.url || ''))
                .map((t) => t.id)
        );
    }, [allTabs, searchQuery]);

    const flatFilteredTabs = useMemo(() => allTabs.filter((t) => filteredTabIds.has(t.id)), [allTabs, filteredTabIds]);

    React.useLayoutEffect(() => {
        if (previousTabIdsRef.current.size > 0) {
            const removedTabIds = new Set([...previousTabIdsRef.current].filter((id) => !currentTabIds.has(id)));
            if (removedTabIds.size > 0) {
                setSelectedTabs((prev) => {
                    const validSelection = new Set([...prev].filter((id) => currentTabIds.has(id)));
                    return validSelection.size === prev.size ? prev : validSelection;
                });
            }
        }
        previousTabIdsRef.current = currentTabIds;
    }, [currentTabIds]);

    const handleSelectTab = useCallback((tabId: number, event: React.MouseEvent) => {
        event.stopPropagation();
        const tabIndex = flatFilteredTabs.findIndex((t) => t.id === tabId);

        setSelectedTabs((prev) => {
            const newSelection = new Set(prev);
            if (event.shiftKey && lastSelectedIndex !== null) {
                const [start, end] = [Math.min(lastSelectedIndex, tabIndex), Math.max(lastSelectedIndex, tabIndex)];
                for (let i = start; i <= end; i++) newSelection.add(flatFilteredTabs[i].id);
            } else {
                newSelection.has(tabId) ? newSelection.delete(tabId) : newSelection.add(tabId);
            }
            return newSelection;
        });
        setLastSelectedIndex(tabIndex);
    }, [flatFilteredTabs, lastSelectedIndex]);

    const handleSelectAll = useCallback(() => {
        setSelectedTabs(new Set(flatFilteredTabs.map((t) => t.id)));
        setLastSelectedIndex(flatFilteredTabs.length - 1);
    }, [flatFilteredTabs]);

    const handleDeselectAll = useCallback(() => {
        setSelectedTabs(new Set());
        setLastSelectedIndex(null);
    }, []);

    const handleToggleSelectAllInWindow = useCallback((tabIds: number[], selectAll: boolean) => {
        setSelectedTabs((prev) => {
            const newSelection = new Set(prev);
            tabIds.forEach((id) => selectAll ? newSelection.add(id) : newSelection.delete(id));
            return newSelection;
        });
    }, []);

    const confirmBulkClose = useCallback(async () => {
        for (const tabId of selectedTabs) await closeTab(tabId);
        setSelectedTabs(new Set());
        setLastSelectedIndex(null);
        setShowCloseConfirm(false);
    }, [selectedTabs, closeTab]);

    const handleSortTabs = useCallback(async (windowId: number) => {
        await sortTabsInWindow(windowId, allTabs);
    }, [sortTabsInWindow, allTabs]);

    const handleSortAll = useCallback(async () => {
        await sortAllTabs(allTabs);
    }, [sortAllTabs, allTabs]);

    const handleGroupByDomain = useCallback(async () => {
        await groupByDomain(allTabs);
    }, [groupByDomain, allTabs]);

    const handleDedup = useCallback(() => {
        const duplicates = findDuplicateTabs(allTabs);
        if (duplicates.length === 0) {
            return;
        }
        setDuplicateTabIds(duplicates);
        setShowDedupConfirm(true);
    }, [findDuplicateTabs, allTabs]);

    const confirmDedup = useCallback(async () => {
        await closeDuplicateTabs(duplicateTabIds);
        setDuplicateTabIds([]);
        setShowDedupConfirm(false);
    }, [duplicateTabIds, closeDuplicateTabs]);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if ((e.ctrlKey || e.metaKey) && e.key === 'a' && !['INPUT', 'TEXTAREA'].includes(target.tagName)) {
                e.preventDefault();
                handleSelectAll();
            }
            if (e.key === 'Escape') {
                setSelectedTabs(new Set());
                setLastSelectedIndex(null);
            }
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedTabs.size > 0 && target.tagName !== 'INPUT') {
                e.preventDefault();
                setShowCloseConfirm(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSelectAll, selectedTabs.size]);

    const selectedCount = selectedTabs.size;

    if (loading) {
        return (
            <Box sx={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)' }}>
                <Typography sx={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Loading...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: 'calc(100vh - 56px)', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            <Box sx={{ position: 'sticky', top: 48, zIndex: 90, backgroundColor: 'var(--bg-base)', px: { xs: 2, sm: 3, md: 4 }, pt: 3, pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                        Workspace
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {windows.length} window{windows.length !== 1 ? 's' : ''} · {allTabs.length} tab{allTabs.length !== 1 ? 's' : ''}
                    </Typography>
                </Box>

                <QuickActions
                    onSort={handleSortAll}
                    onGroup={handleGroupByDomain}
                    onDedup={handleDedup}
                    disabled={allTabs.length === 0}
                />

                <TextField
                    fullWidth
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 18, color: 'var(--text-muted)' }} />
                                </InputAdornment>
                            ),
                            endAdornment: searchQuery && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchQuery('')} sx={{ color: 'var(--text-muted)' }}>
                                        <CloseIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        },
                    }}
                    sx={searchFieldSx}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, py: 1 }}>
                    {selectedCount > 0 && (
                        <Typography sx={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', flex: 1 }}>
                            {selectedCount} selected
                        </Typography>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
                        {selectedCount > 0 && (
                            <Button
                                size="small"
                                onClick={() => setShowCloseConfirm(true)}
                                sx={{ color: 'var(--accent-danger)', textTransform: 'none', minWidth: 0, fontSize: '0.75rem' }}
                            >
                                Close
                            </Button>
                        )}
                        <Tooltip title="Select all">
                            <Button size="small" onClick={handleSelectAll} sx={{ color: 'var(--text-tertiary)', textTransform: 'none', minWidth: 0, fontSize: '0.75rem' }}>
                                Select all
                            </Button>
                        </Tooltip>
                        <Tooltip title="Deselect all">
                            <Button size="small" onClick={handleDeselectAll} sx={{ color: 'var(--text-tertiary)', textTransform: 'none', minWidth: 0, fontSize: '0.75rem' }}>
                                Deselect all
                            </Button>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pb: 3, minHeight: '200px' }}>
                {windows.map((win) => (
                    <WindowSection
                        key={win.id}
                        window={win}
                        tabs={allTabs.filter((t) => t.windowId === win.id && filteredTabIds.has(t.id))}
                        groups={allGroups.filter((g) => g.windowId === win.id)}
                        selectedTabs={selectedTabs}
                        searchQuery={searchQuery}
                        onSelectTab={handleSelectTab}
                        onToggleSelectAll={handleToggleSelectAllInWindow}
                        onSortTabs={handleSortTabs}
                    />
                ))}

                {flatFilteredTabs.length === 0 && (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                        <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            {searchQuery ? 'No results' : 'No tabs'}
                        </Typography>
                    </Box>
                )}
            </Box>

            <ConfirmDialog
                open={showCloseConfirm}
                title={`Close ${selectedCount} tab${selectedCount !== 1 ? 's' : ''}?`}
                confirmLabel="Close"
                cancelLabel="Cancel"
                confirmColor="error"
                onConfirm={confirmBulkClose}
                onCancel={() => setShowCloseConfirm(false)}
            />

            <ConfirmDialog
                open={showDedupConfirm}
                title={`Close ${duplicateTabIds.length} duplicate tab${duplicateTabIds.length !== 1 ? 's' : ''}?`}
                confirmLabel="Close Duplicates"
                cancelLabel="Cancel"
                confirmColor="error"
                onConfirm={confirmDedup}
                onCancel={() => setShowDedupConfirm(false)}
            />
        </Box>
    );
};


