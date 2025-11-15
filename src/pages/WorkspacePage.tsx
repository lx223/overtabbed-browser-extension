import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    IconButton,
    Tooltip,
    Button,
    Dialog,
    DialogTitle,
    DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { WindowSection } from '@/components/WindowSection';
import { useWindows } from '@/hooks/useWindows';
import { useTabs } from '@/hooks/useTabs';
import { useGroups } from '@/hooks/useGroups';
import { useTabActions } from '@/hooks/useTabActions';
import { useGroupActions } from '@/hooks/useGroupActions';
import { fuzzyMatch } from '@/utils/fuzzySearch';
import { DragProvider, type DragItem, type DropTarget } from '@/contexts/DragContext';

export const WorkspacePage: React.FC = () => {
    const { windows, loading: windowsLoading } = useWindows();
    const { tabs: allTabs, loading: tabsLoading } = useTabs();
    const { groups: allGroups, loading: groupsLoading } = useGroups();
    const { moveTab } = useTabActions();
    const { ungroupTabs, addTabToGroup, moveGroup } = useGroupActions();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTabs, setSelectedTabs] = useState<Set<number>>(new Set());
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);

    const loading = windowsLoading || tabsLoading || groupsLoading;

    const filteredTabIds = useMemo(() => {
        if (!searchQuery.trim()) return new Set(allTabs.map((t) => t.id));
        return new Set(
            allTabs
                .filter((tab) => fuzzyMatch(searchQuery, tab.title || '') || fuzzyMatch(searchQuery, tab.url || ''))
                .map((t) => t.id)
        );
    }, [allTabs, searchQuery]);

    const flatFilteredTabs = useMemo(() => allTabs.filter((t) => filteredTabIds.has(t.id)), [allTabs, filteredTabIds]);

    useEffect(() => {
        setSelectedTabs((prev) => {
            const currentTabIds = new Set(allTabs.map((t) => t.id));
            const validSelection = new Set([...prev].filter((id) => currentTabIds.has(id)));
            if (validSelection.size === prev.size) return prev;
            return validSelection;
        });
    }, [allTabs]);

    const handleSelectTab = useCallback(
        (tabId: number, event: React.MouseEvent) => {
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
        },
        [flatFilteredTabs, lastSelectedIndex]
    );

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
            if (selectAll) {
                tabIds.forEach((id) => newSelection.add(id));
            } else {
                tabIds.forEach((id) => newSelection.delete(id));
            }
            return newSelection;
        });
    }, []);

    const { closeTab } = useTabActions();
    const confirmBulkClose = useCallback(async () => {
        for (const tabId of selectedTabs) await closeTab(tabId);
        setSelectedTabs(new Set());
        setLastSelectedIndex(null);
        setShowCloseConfirm(false);
    }, [selectedTabs, closeTab]);

    const handleDrop = useCallback(async (dragItem: DragItem, target: DropTarget) => {
        if (dragItem.type === 'tab') {
            if (target.type === 'group') {
                await addTabToGroup(dragItem.id, target.id);
            } else if (target.type === 'tab') {
                const targetTab = allTabs.find(t => t.id === target.id);
                if (targetTab) {
                    if (dragItem.groupId && dragItem.groupId !== -1) {
                        await ungroupTabs([dragItem.id]);
                    }
                    await moveTab(dragItem.id, targetTab.index, targetTab.windowId);
                }
            } else if (target.type === 'window') {
                if (dragItem.groupId && dragItem.groupId !== -1) {
                    await ungroupTabs([dragItem.id]);
                }
                await moveTab(dragItem.id, -1, target.windowId);
            } else if (target.type === 'ungrouped-area') {
                if (dragItem.groupId && dragItem.groupId !== -1) {
                    await ungroupTabs([dragItem.id]);
                }
                if (dragItem.windowId !== target.windowId) {
                    await moveTab(dragItem.id, -1, target.windowId);
                }
            }
        } else if (dragItem.type === 'group') {
            if (target.type === 'window') {
                await moveGroup(dragItem.id, target.windowId, target.index);
            } else if (target.type === 'group') {
                const targetIndex = target.index !== undefined ? target.index : -1;
                await moveGroup(dragItem.id, target.windowId, targetIndex);
            }
        }
    }, [allTabs, moveTab, addTabToGroup, ungroupTabs, moveGroup]);

    useEffect(() => {
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
        <DragProvider>
            <Box sx={{ minHeight: 'calc(100vh - 56px)', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
                <Box
                    sx={{
                        position: 'sticky',
                        top: 48,
                        zIndex: 90,
                        backgroundColor: 'var(--bg-base)',
                        px: { xs: 2, sm: 3, md: 4 },
                        pt: 3,
                        pb: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                            Workspace
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {windows.length} window{windows.length !== 1 ? 's' : ''} · {allTabs.length} tab{allTabs.length !== 1 ? 's' : ''}
                        </Typography>
                    </Box>

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
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'var(--input-bg)',
                                borderRadius: 2,
                                color: 'var(--text-primary)',
                                fontSize: '0.875rem',
                                '& fieldset': { borderColor: 'var(--input-border)' },
                                '&:hover fieldset': { borderColor: 'var(--border-default)' },
                                '&.Mui-focused fieldset': { borderColor: 'var(--input-border-focus)', borderWidth: 1 },
                            },
                            '& .MuiInputBase-input::placeholder': { color: 'var(--text-muted)', opacity: 1 },
                        }}
                    />

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            mt: 2,
                            py: 1,
                        }}
                    >
                        {selectedCount > 0 && (<Typography sx={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', flex: 1 }}>
                            {selectedCount} selected
                        </Typography>)}

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
                            {selectedCount > 0 && (<Button
                                size="small"
                                onClick={() => setShowCloseConfirm(true)}
                                sx={{ color: 'var(--accent-danger)', textTransform: 'none', minWidth: 0, fontSize: '0.75rem' }}
                            >
                                Close
                            </Button>)}
                            <Tooltip title="Select all">
                                <Button
                                    size="small"
                                    onClick={handleSelectAll}
                                    sx={{ color: 'var(--text-tertiary)', textTransform: 'none', minWidth: 0, fontSize: '0.75rem' }}
                                >
                                    Select all
                                </Button>
                            </Tooltip>
                            <Tooltip title="Deselect all">
                                <Button
                                    size="small"
                                    onClick={handleDeselectAll}
                                    sx={{ color: 'var(--text-tertiary)', textTransform: 'none', minWidth: 0, fontSize: '0.75rem' }}
                                >
                                    Deselect all
                                </Button>
                            </Tooltip>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pb: 3 }}>
                    {windows.map((win) => (
                        <WindowSection
                            key={win.id}
                            window={win}
                            tabs={allTabs.filter((t) => t.windowId === win.id && filteredTabIds.has(t.id))}
                            groups={allGroups.filter((g) => g.windowId === win.id)}
                            selectedTabs={selectedTabs}
                            searchQuery={searchQuery}
                            onSelectTab={handleSelectTab}
                            onDrop={handleDrop}
                            onToggleSelectAll={handleToggleSelectAllInWindow}
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

                <Dialog
                    open={showCloseConfirm}
                    onClose={() => setShowCloseConfirm(false)}
                    slotProps={{ paper: { sx: { backgroundColor: 'var(--dialog-bg)', borderRadius: 2, minWidth: 320, boxShadow: 'var(--shadow-lg)' } } }}
                >
                    <DialogTitle sx={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 500, pb: 1 }}>
                        Close {selectedCount} tab{selectedCount !== 1 ? 's' : ''}?
                    </DialogTitle>
                    <DialogActions sx={{ p: 2, pt: 1 }}>
                        <Button onClick={() => setShowCloseConfirm(false)} sx={{ color: 'var(--text-tertiary)', textTransform: 'none' }}>
                            Cancel
                        </Button>
                        <Button onClick={confirmBulkClose} sx={{ color: 'var(--accent-danger)', textTransform: 'none' }}>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DragProvider>
    );
};
