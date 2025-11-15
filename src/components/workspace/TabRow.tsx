import React, { useCallback } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PushPinIcon from '@mui/icons-material/PushPin';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import type { Tab } from '@/utils/tab';
import { HighlightedText } from '@/components/common';
import { useTabActions } from '@/hooks/useTabActions';
import { useWindowActions } from '@/hooks/useWindowActions';

export interface TabRowProps {
    tab: Tab;
    isSelected: boolean;
    searchQuery?: string;
    onSelect: (tabId: number, event: React.MouseEvent) => void;
}

const actionBtnSx = {
    p: 0.25,
    color: 'var(--text-muted)',
    flexShrink: 0,
    '&:hover': { backgroundColor: 'transparent' },
};

export const TabRow: React.FC<TabRowProps> = React.memo(({ tab, isSelected, searchQuery = '', onSelect }) => {
    const { closeTab, pinTab, unpinTab, activateTab, toggleMuteTab } = useTabActions();
    const { focusWindow } = useWindowActions();

    const handleClose = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation();
        await closeTab(tab.id);
    }, [tab.id, closeTab]);

    const handleTogglePin = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation();
        tab.pinned ? await unpinTab(tab.id) : await pinTab(tab.id);
    }, [tab.id, tab.pinned, pinTab, unpinTab]);

    const handleNavigate = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation();
        await activateTab(tab.id);
        if (tab.windowId) await focusWindow(tab.windowId);
    }, [tab.id, tab.windowId, activateTab, focusWindow]);

    const handleToggleMute = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation();
        await toggleMuteTab(tab.id);
    }, [tab.id, toggleMuteTab]);

    const isMuted = tab.mutedInfo?.muted ?? false;

    return (
        <Box
            onClick={(e) => onSelect(tab.id, e)}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 0.75,
                px: 1,
                cursor: 'pointer',
                borderRadius: 1,
                backgroundColor: isSelected ? 'var(--bg-selection)' : 'transparent',
                '&:hover': {
                    backgroundColor: isSelected ? 'var(--bg-selection-hover)' : 'var(--bg-hover)',
                    '& .action-btn': { opacity: 1 },
                },
            }}
        >
            <Box
                component="img"
                src={tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect fill="%23374151" width="16" height="16" rx="2"/></svg>'}
                sx={{ width: 16, height: 16, borderRadius: 0.5, flexShrink: 0 }}
                onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect fill="%23374151" width="16" height="16" rx="2"/></svg>';
                }}
            />
            <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <Typography
                    variant="body2"
                    sx={{
                        color: tab.active ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: tab.active ? 500 : 400,
                        fontSize: '0.8125rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    <HighlightedText text={tab.title || 'New Tab'} query={searchQuery} />
                </Typography>
                <Typography
                    variant="caption"
                    sx={{
                        color: 'var(--text-muted)',
                        fontSize: '0.65rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                    }}
                >
                    <HighlightedText text={tab.url || ''} query={searchQuery} />
                </Typography>
            </Box>
            <IconButton
                className="action-btn"
                size="small"
                onClick={handleToggleMute}
                sx={{ ...actionBtnSx, opacity: 0, '&:hover': { ...actionBtnSx['&:hover'], color: 'var(--accent-primary)' } }}
            >
                {isMuted ? <VolumeOffIcon sx={{ fontSize: 14 }} /> : <VolumeUpIcon sx={{ fontSize: 14 }} />}
            </IconButton>
            <IconButton
                className="action-btn"
                size="small"
                onClick={handleNavigate}
                sx={{ ...actionBtnSx, opacity: 0, '&:hover': { ...actionBtnSx['&:hover'], color: 'var(--accent-primary)' } }}
            >
                <OpenInNewIcon sx={{ fontSize: 14 }} />
            </IconButton>
            <IconButton
                className={tab.pinned ? '' : 'action-btn'}
                size="small"
                onClick={handleTogglePin}
                sx={{ ...actionBtnSx, opacity: tab.pinned ? 1 : 0, '&:hover': { ...actionBtnSx['&:hover'], color: 'var(--text-primary)' } }}
            >
                <PushPinIcon sx={{ fontSize: 14 }} />
            </IconButton>
            <IconButton
                className="action-btn"
                size="small"
                onClick={handleClose}
                sx={{ ...actionBtnSx, opacity: 0, '&:hover': { ...actionBtnSx['&:hover'], color: 'var(--accent-danger)' } }}
            >
                <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
        </Box>
    );
});

