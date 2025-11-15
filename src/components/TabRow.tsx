import React, { useCallback } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CloseIcon from '@mui/icons-material/Close';
import PushPinIcon from '@mui/icons-material/PushPin';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import type { Tab } from '@/utils/tab';
import { getMatchIndices } from '@/utils/fuzzySearch';
import { useDrag, type DragItem, type DropTarget } from '@/contexts/DragContext';
import { useTabActions } from '@/hooks/useTabActions';
import { useWindowActions } from '@/hooks/useWindowActions';

export interface TabRowProps {
  tab: Tab;
  isSelected: boolean;
  searchQuery?: string;
  onSelect: (tabId: number, event: React.MouseEvent) => void;
  onDrop?: (dragItem: DragItem, target: DropTarget) => void;
  isLastInList?: boolean;
}

const HighlightedText: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  if (!query || !text) return <>{text}</>;

  const indices = new Set(getMatchIndices(query, text));
  if (indices.size === 0) return <>{text}</>;

  return (
    <>
      {text.split('').map((char, i) =>
        indices.has(i) ? (
          <Box
            key={i}
            component="span"
            sx={{ color: 'var(--accent-primary)', fontWeight: 600 }}
          >
            {char}
          </Box>
        ) : (
          <span key={i}>{char}</span>
        )
      )}
    </>
  );
};

export const TabRow: React.FC<TabRowProps> = React.memo(({ tab, isSelected, searchQuery = '', onSelect, onDrop, isLastInList = false }) => {
  const { dragItem, startDrag, setDropTarget, endDrag, dropTarget } = useDrag();
  const { closeTab, pinTab, unpinTab, activateTab, toggleMuteTab } = useTabActions();
  const { focusWindow } = useWindowActions();

  const handleClick = (e: React.MouseEvent) => {
    onSelect(tab.id, e);
  };

  const handleClose = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    await closeTab(tab.id);
  }, [tab.id, closeTab]);

  const handleTogglePin = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tab.pinned) {
      await unpinTab(tab.id);
    } else {
      await pinTab(tab.id);
    }
  }, [tab.id, tab.pinned, pinTab, unpinTab]);

  const handleNavigate = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    await activateTab(tab.id);
    if (tab.windowId) {
      await focusWindow(tab.windowId);
    }
  }, [tab.id, tab.windowId, activateTab, focusWindow]);

  const handleToggleMute = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleMuteTab(tab.id);
  }, [tab.id, toggleMuteTab]);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'tab',
      id: tab.id,
      windowId: tab.windowId,
      groupId: tab.groupId,
      index: tab.index,
    }));
    startDrag({
      type: 'tab',
      id: tab.id,
      windowId: tab.windowId,
      groupId: tab.groupId,
      index: tab.index,
    });
  }, [tab, startDrag]);

  const handleDragEnd = useCallback(() => {
    endDrag();
  }, [endDrag]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dragItem && dragItem.type === 'tab' && dragItem.id !== tab.id) {
      const rect = e.currentTarget.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const isBottomHalf = e.clientY > midY;

      if (isLastInList && isBottomHalf) {
        setDropTarget({
          type: 'tab',
          id: tab.id,
          windowId: tab.windowId,
          index: tab.index + 1,
        });
      } else {
        setDropTarget({
          type: 'tab',
          id: tab.id,
          windowId: tab.windowId,
          index: tab.index,
        });
      }
    }
  }, [dragItem, tab, setDropTarget, isLastInList]);

  const handleDragLeave = useCallback(() => {
    if (dropTarget?.type === 'tab' && dropTarget?.id === tab.id) {
      setDropTarget(null);
    }
  }, [dropTarget, tab.id, setDropTarget]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragItem && onDrop && dragItem.id !== tab.id) {
      const rect = e.currentTarget.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const isBottomHalf = e.clientY > midY;

      onDrop(dragItem, {
        type: 'tab',
        id: tab.id,
        windowId: tab.windowId,
        index: isLastInList && isBottomHalf ? tab.index + 1 : tab.index,
      });
    }
    endDrag();
  }, [dragItem, tab, onDrop, endDrag, isLastInList]);

  const isMuted = tab.mutedInfo?.muted ?? false;
  const isDragging = dragItem?.type === 'tab' && dragItem?.id === tab.id;
  const isDropTargetTop = dropTarget?.type === 'tab' && dropTarget?.id === tab.id && dropTarget?.index === tab.index;
  const isDropTargetBottom = isLastInList && dropTarget?.type === 'tab' && dropTarget?.id === tab.id && dropTarget?.index === tab.index + 1;

  return (
    <Box
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 0.75,
        px: 1,
        cursor: 'grab',
        borderRadius: 1,
        backgroundColor: isSelected ? 'var(--bg-selection)' : 'transparent',
        opacity: isDragging ? 0.5 : 1,
        borderTop: isDropTargetTop ? '2px solid var(--accent-primary)' : '2px solid transparent',
        borderBottom: isDropTargetBottom ? '2px solid var(--accent-primary)' : '2px solid transparent',
        transition: 'border-color 0.15s, opacity 0.15s',
        '&:hover': {
          backgroundColor: isSelected ? 'var(--bg-selection-hover)' : 'var(--bg-hover)',
          '& .close-btn': { opacity: 1 },
          '& .pin-btn': { opacity: 1 },
          '& .navigate-btn': { opacity: 1 },
          '& .mute-btn': { opacity: 1 },
          '& .drag-handle': { opacity: 1 },
        },
      }}
    >
      <DragIndicatorIcon
        className="drag-handle"
        sx={{
          fontSize: 14,
          color: 'var(--text-muted)',
          opacity: 0,
          flexShrink: 0,
          cursor: 'grab',
          mr: -0.5,
        }}
      />
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
        className="mute-btn"
        size="small"
        onClick={handleToggleMute}
        sx={{
          opacity: 0,
          p: 0.25,
          color: 'var(--text-muted)',
          flexShrink: 0,
          '&:hover': { color: 'var(--accent-primary)', backgroundColor: 'transparent' },
        }}
      >
        {isMuted ? <VolumeOffIcon sx={{ fontSize: 14 }} /> : <VolumeUpIcon sx={{ fontSize: 14 }} />}
      </IconButton>
      <IconButton
        className="navigate-btn"
        size="small"
        onClick={handleNavigate}
        sx={{
          opacity: 0,
          p: 0.25,
          color: 'var(--text-muted)',
          flexShrink: 0,
          '&:hover': { color: 'var(--accent-primary)', backgroundColor: 'transparent' },
        }}
      >
        <OpenInNewIcon sx={{ fontSize: 14 }} />
      </IconButton>
      {tab.pinned ? (
        <IconButton
          size="small"
          onClick={handleTogglePin}
          sx={{
            p: 0.25,
            color: 'var(--text-muted)',
            flexShrink: 0,
            '&:hover': { color: 'var(--text-primary)', backgroundColor: 'transparent' },
          }}
        >
          <PushPinIcon sx={{ fontSize: 14 }} />
        </IconButton>
      ) : (
        <IconButton
          className="pin-btn"
          size="small"
          onClick={handleTogglePin}
          sx={{
            opacity: 0,
            p: 0.25,
            color: 'var(--text-muted)',
            flexShrink: 0,
            '&:hover': { color: 'var(--text-primary)', backgroundColor: 'transparent' },
          }}
        >
          <PushPinIcon sx={{ fontSize: 14 }} />
        </IconButton>
      )}
      <IconButton
        className="close-btn"
        size="small"
        onClick={handleClose}
        sx={{
          opacity: 0,
          p: 0.25,
          color: 'var(--text-muted)',
          '&:hover': { color: 'var(--accent-danger)', backgroundColor: 'transparent' },
        }}
      >
        <CloseIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </Box>
  );
});
