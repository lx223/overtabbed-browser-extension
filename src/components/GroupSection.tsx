import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Box, Typography, IconButton, Collapse, Tooltip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import { TabRow } from './TabRow';
import { getGroupColor } from '@/utils/groupColor';
import type { Tab } from '@/utils/tab';
import type { Group } from '@/utils/group';
import { useDrag, type DragItem, type DropTarget } from '@/contexts/DragContext';
import { useGroupActions } from '@/hooks/useGroupActions';

export interface GroupSectionProps {
  group: Group;
  tabs: Tab[];
  selectedTabs: Set<number>;
  searchQuery?: string;
  onSelectTab: (tabId: number, event: React.MouseEvent) => void;
  onDrop?: (dragItem: DragItem, target: DropTarget) => void;
  onToggleSelectAll?: (tabIds: number[], selectAll: boolean) => void;
}

export const GroupSection: React.FC<GroupSectionProps> = ({
  group, tabs, selectedTabs, searchQuery = '', onSelectTab, onDrop, onToggleSelectAll,
}) => {
  const [isExpanded, setIsExpanded] = useState(!group.collapsed);
  const [isHovered, setIsHovered] = useState(false);
  const groupColor = getGroupColor(group.color);
  const { dragItem, startDrag, setDropTarget, endDrag, dropTarget } = useDrag();
  const { ungroupTabs, toggleGroupCollapse } = useGroupActions();

  const groupTabIds = useMemo(() => tabs.map(t => t.id), [tabs]);
  const selectedInGroup = useMemo(() => groupTabIds.filter(id => selectedTabs.has(id)).length, [groupTabIds, selectedTabs]);
  const allSelectedInGroup = selectedInGroup === groupTabIds.length && groupTabIds.length > 0;
  const someSelectedInGroup = selectedInGroup > 0 && selectedInGroup < groupTabIds.length;

  const handleToggleSelectAll = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSelectAll) {
      onToggleSelectAll(groupTabIds, !allSelectedInGroup);
    }
  }, [onToggleSelectAll, groupTabIds, allSelectedInGroup]);

  useEffect(() => {
    setIsExpanded(!group.collapsed);
  }, [group.collapsed]);

  const handleUngroup = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    await ungroupTabs(tabs.map(t => t.id));
  }, [tabs, ungroupTabs]);

  const groupIndex = useMemo(() => {
    if (tabs.length === 0) return 0;
    return Math.min(...tabs.map(t => t.index));
  }, [tabs]);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'group',
      id: group.id,
      windowId: group.windowId,
      index: groupIndex,
    }));
    startDrag({
      type: 'group',
      id: group.id,
      windowId: group.windowId,
      index: groupIndex,
    });
  }, [group, groupIndex, startDrag]);

  const handleDragEnd = useCallback(() => {
    endDrag();
  }, [endDrag]);

  const handleDragOverHeader = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dragItem) {
      const isSameGroup = dragItem.type === 'group' && dragItem.id === group.id;
      if (!isSameGroup) {
        if (dragItem.type === 'group') {
          const rect = e.currentTarget.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          const isBottomHalf = e.clientY > midY;
          setDropTarget({
            type: 'group',
            id: group.id,
            windowId: group.windowId,
            index: isBottomHalf ? groupIndex + 1 : groupIndex,
          });
        } else if (dragItem.type === 'tab' && dragItem.groupId !== group.id) {
          setDropTarget({
            type: 'group',
            id: group.id,
            windowId: group.windowId,
          });
        }
      }
    }
  }, [dragItem, group, groupIndex, setDropTarget]);

  const handleDragLeave = useCallback(() => {
    if (dropTarget?.type === 'group' && dropTarget?.id === group.id) {
      setDropTarget(null);
    }
  }, [dropTarget, group.id, setDropTarget]);

  const handleDropOnHeader = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragItem && onDrop) {
      const isSameGroup = dragItem.type === 'group' && dragItem.id === group.id;
      const isTabInThisGroup = dragItem.type === 'tab' && dragItem.groupId === group.id;
      if (!isSameGroup && !isTabInThisGroup) {
        const rect = e.currentTarget.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const isBottomHalf = e.clientY > midY;
        onDrop(dragItem, {
          type: 'group',
          id: group.id,
          windowId: group.windowId,
          index: isBottomHalf ? groupIndex + 1 : groupIndex,
        });
      }
    }
    endDrag();
  }, [dragItem, group, groupIndex, onDrop, endDrag]);

  const isDragging = dragItem?.type === 'group' && dragItem?.id === group.id;
  const isDropTargetForGroup = dropTarget?.type === 'group' && dropTarget?.id === group.id && dragItem?.type === 'group';
  const isDropTargetForTab = dropTarget?.type === 'group' && dropTarget?.id === group.id && dragItem?.type === 'tab';
  const isDropTargetTop = isDropTargetForGroup && dropTarget?.index === groupIndex;
  const isDropTargetBottom = isDropTargetForGroup && dropTarget?.index === groupIndex + 1;

  return (
    <Box sx={{ mb: 0.5 }}>
      <Box
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOverHeader}
        onDragLeave={handleDragLeave}
        onDrop={handleDropOnHeader}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={async () => {
          const newExpanded = !isExpanded;
          setIsExpanded(newExpanded);
          await toggleGroupCollapse(group.id, !newExpanded);
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          py: 0.5,
          px: 0.5,
          cursor: 'grab',
          borderRadius: 1,
          opacity: isDragging ? 0.5 : 1,
          borderTop: isDropTargetTop ? '2px solid var(--accent-primary)' : '2px solid transparent',
          borderBottom: isDropTargetBottom ? '2px solid var(--accent-primary)' : '2px solid transparent',
          transition: 'border-color 0.15s, opacity 0.15s',
          '&:hover': {
            backgroundColor: 'var(--bg-hover)',
            '& .ungroup-btn': { opacity: 1 },
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
          }}
        />
        <IconButton size="small" sx={{ p: 0, color: 'var(--text-muted)' }}>
          {isExpanded ? <ExpandMoreIcon sx={{ fontSize: 18 }} /> : <ChevronRightIcon sx={{ fontSize: 18 }} />}
        </IconButton>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: groupColor, flexShrink: 0 }} />
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', flex: 1 }}>
          {group.title || 'Untitled'}
        </Typography>
        {(isHovered || selectedInGroup > 0) && onToggleSelectAll && (
          <Tooltip title={allSelectedInGroup ? 'Deselect all' : 'Select all'}>
            <IconButton
              size="small"
              onClick={handleToggleSelectAll}
              sx={{
                p: 0.25,
                color: allSelectedInGroup || someSelectedInGroup ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                opacity: isHovered || selectedInGroup > 0 ? 1 : 0,
                transition: 'opacity 0.15s',
                '&:hover': { color: 'var(--accent-primary)' },
              }}
            >
              {allSelectedInGroup ? (
                <CheckBoxIcon sx={{ fontSize: 16 }} />
              ) : someSelectedInGroup ? (
                <IndeterminateCheckBoxIcon sx={{ fontSize: 16 }} />
              ) : (
                <CheckBoxOutlineBlankIcon sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          </Tooltip>
        )}
        <Typography sx={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {tabs.length}
        </Typography>
        <IconButton
          className="ungroup-btn"
          size="small"
          onClick={handleUngroup}
          sx={{
            opacity: 0,
            p: 0.25,
            color: 'var(--text-muted)',
            flexShrink: 0,
            '&:hover': { color: 'var(--accent-primary)', backgroundColor: 'transparent' },
          }}
        >
          <UnfoldMoreIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>
      <Collapse in={isExpanded}>
        <Box sx={{ pl: 2 }}>
          {isDropTargetForTab && (
            <Box sx={{ borderTop: '2px solid var(--accent-primary)', mb: -0.25 }} />
          )}
          {tabs.map((tab, index) => (
            <TabRow
              key={tab.id}
              tab={tab}
              isSelected={selectedTabs.has(tab.id)}
              searchQuery={searchQuery}
              onSelect={onSelectTab}
              onDrop={onDrop}
              isLastInList={index === tabs.length - 1}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};
