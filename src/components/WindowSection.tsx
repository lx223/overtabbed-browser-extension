import React, { useState, useCallback, useMemo } from 'react';
import { Box, Typography, IconButton, Collapse, Chip, Tooltip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import { TabRow } from './TabRow';
import { GroupSection } from './GroupSection';
import type { Window } from '@/utils/window';
import type { Tab } from '@/utils/tab';
import type { Group } from '@/utils/group';
import { useDrag, type DragItem, type DropTarget } from '@/contexts/DragContext';

export interface WindowSectionProps {
  window: Window;
  tabs: Tab[];
  groups: Group[];
  selectedTabs: Set<number>;
  searchQuery?: string;
  onSelectTab: (tabId: number, event: React.MouseEvent) => void;
  onDrop?: (dragItem: DragItem, target: DropTarget) => void;
  onToggleSelectAll?: (tabIds: number[], selectAll: boolean) => void;
}

type ListItem =
  | { type: 'group'; group: Group; tabs: Tab[]; index: number }
  | { type: 'tab'; tab: Tab; index: number };

export const WindowSection: React.FC<WindowSectionProps> = ({
  window, tabs, groups, selectedTabs, searchQuery = '', onSelectTab, onDrop, onToggleSelectAll,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const { dragItem, setDropTarget, endDrag, dropTarget } = useDrag();

  const windowTabIds = useMemo(() => tabs.map(t => t.id), [tabs]);
  const selectedInWindow = useMemo(() => windowTabIds.filter(id => selectedTabs.has(id)).length, [windowTabIds, selectedTabs]);
  const allSelectedInWindow = selectedInWindow === windowTabIds.length && windowTabIds.length > 0;
  const someSelectedInWindow = selectedInWindow > 0 && selectedInWindow < windowTabIds.length;

  const handleToggleSelectAll = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSelectAll) {
      onToggleSelectAll(windowTabIds, !allSelectedInWindow);
    }
  }, [onToggleSelectAll, windowTabIds, allSelectedInWindow]);

  const listItems = useMemo(() => {
    const groupedTabIds = new Set(groups.flatMap((g) => g.tabIds));
    const items: ListItem[] = [];

    for (const group of groups) {
      const groupTabs = tabs
        .filter((tab) => group.tabIds.includes(tab.id))
        .sort((a, b) => a.index - b.index);
      if (groupTabs.length > 0) {
        const minIndex = Math.min(...groupTabs.map(t => t.index));
        items.push({ type: 'group', group, tabs: groupTabs, index: minIndex });
      }
    }

    for (const tab of tabs) {
      if (!groupedTabIds.has(tab.id)) {
        items.push({ type: 'tab', tab, index: tab.index });
      }
    }

    return items.sort((a, b) => a.index - b.index);
  }, [groups, tabs]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragItem && dragItem.type === 'group') {
      if (dragItem.windowId !== window.id) {
        setDropTarget({
          type: 'window',
          id: window.id!,
          windowId: window.id!,
        });
      }
    }
  }, [dragItem, window.id, setDropTarget]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    const currentTarget = e.currentTarget as HTMLElement;
    if (relatedTarget && currentTarget.contains(relatedTarget)) {
      return;
    }
    if (dropTarget?.type === 'window' && dropTarget?.id === window.id) {
      setDropTarget(null);
    }
  }, [dropTarget, window.id, setDropTarget]);

  const handleDropOnWindow = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (dragItem && onDrop && dragItem.type === 'group') {
      const targetIndex = dropTarget?.type === 'window' && dropTarget?.windowId === window.id && dropTarget?.index !== undefined
        ? dropTarget.index
        : -1;
      onDrop(dragItem, {
        type: 'window',
        id: window.id!,
        windowId: window.id!,
        index: targetIndex,
      });
    }
    endDrag();
  }, [dragItem, window.id, dropTarget, onDrop, endDrag]);

  const handleDragOverEndZone = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dragItem && dragItem.type === 'tab') {
      setDropTarget({
        type: 'ungrouped-area',
        id: window.id!,
        windowId: window.id!,
      });
    }
  }, [dragItem, window.id, setDropTarget]);

  const handleDragLeaveEndZone = useCallback(() => {
    if (dropTarget?.type === 'ungrouped-area' && dropTarget?.id === window.id) {
      setDropTarget(null);
    }
  }, [dropTarget, window.id, setDropTarget]);

  const handleDropOnEndZone = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragItem && onDrop && dragItem.type === 'tab') {
      onDrop(dragItem, {
        type: 'ungrouped-area',
        id: window.id!,
        windowId: window.id!,
        index: -1,
      });
    }
    endDrag();
  }, [dragItem, window.id, onDrop, endDrag]);

  if (tabs.length === 0) return null;

  const isDropTargetWindow = dropTarget?.type === 'window' && dropTarget?.id === window.id && dragItem?.type === 'group';
  const isDropTargetEndZone = dropTarget?.type === 'ungrouped-area' && dropTarget?.id === window.id;

  return (
    <Box
      sx={{ mb: 2 }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDropOnWindow}
    >
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
          borderBottom: isDropTargetWindow ? '2px solid var(--accent-primary)' : '2px solid transparent',
          transition: 'border-color 0.15s',
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
                '& .MuiChip-label': {
                  px: 0.75,
                },
              }}
            />
          )}
          {window.incognito && (
            <Typography component="span" sx={{ ml: 1, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              incognito
            </Typography>
          )}
        </Box>
        {(isHovered || selectedInWindow > 0) && onToggleSelectAll && (
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
              {allSelectedInWindow ? (
                <CheckBoxIcon sx={{ fontSize: 18 }} />
              ) : someSelectedInWindow ? (
                <IndeterminateCheckBoxIcon sx={{ fontSize: 18 }} />
              ) : (
                <CheckBoxOutlineBlankIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>
        )}
        <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {tabs.length}
        </Typography>
      </Box>
      <Collapse in={isExpanded}>
        <Box sx={{ pl: 1.5, borderLeft: '1px solid var(--border-subtle)', ml: 1.25 }}>
          {listItems.map((item, idx) => {
            const isGroupDropZone = dragItem?.type === 'group' && idx > 0 && listItems[idx - 1].type === 'group' && item.type === 'group';
            const prevItem = idx > 0 ? listItems[idx - 1] : null;
            const dropZoneIndex = item.type === 'group' ? item.index : (prevItem?.type === 'group' ? prevItem.index + 1 : item.index);

            return (
              <React.Fragment key={item.type === 'group' ? `group-${item.group.id}` : `tab-${item.tab.id}`}>
                {isGroupDropZone && (
                  <Box
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.dataTransfer.dropEffect = 'move';
                      if (dragItem && dragItem.type === 'group' && item.type === 'group') {
                        const prevGroup = (prevItem as { type: 'group'; group: Group }).group;
                        const currentGroup = item.group;
                        if (dragItem.id !== prevGroup.id && dragItem.id !== currentGroup.id) {
                          setDropTarget({
                            type: 'window',
                            id: window.id!,
                            windowId: window.id!,
                            index: dropZoneIndex,
                          });
                        }
                      }
                    }}
                    onDragLeave={() => {
                      if (dropTarget?.type === 'window' && dropTarget?.windowId === window.id && dropTarget?.index === dropZoneIndex) {
                        setDropTarget(null);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (dragItem && onDrop && dragItem.type === 'group' && item.type === 'group') {
                        const prevGroup = (prevItem as { type: 'group'; group: Group }).group;
                        const currentGroup = item.group;
                        if (dragItem.id !== prevGroup.id && dragItem.id !== currentGroup.id) {
                          onDrop(dragItem, {
                            type: 'window',
                            id: window.id!,
                            windowId: window.id!,
                            index: dropZoneIndex,
                          });
                        }
                      }
                      endDrag();
                    }}
                    sx={{
                      height: 4,
                      borderTop: dropTarget?.type === 'window' && dropTarget?.windowId === window.id && dropTarget?.index === dropZoneIndex
                        ? '2px solid var(--accent-primary)'
                        : '2px solid transparent',
                      transition: 'border-color 0.15s',
                      mb: -0.5,
                    }}
                  />
                )}
                {item.type === 'group' ? (
                  <GroupSection
                    group={item.group}
                    tabs={item.tabs}
                    selectedTabs={selectedTabs}
                    searchQuery={searchQuery}
                    onSelectTab={onSelectTab}
                    onDrop={onDrop}
                    onToggleSelectAll={onToggleSelectAll}
                  />
                ) : (
                  <TabRow
                    tab={item.tab}
                    isSelected={selectedTabs.has(item.tab.id)}
                    searchQuery={searchQuery}
                    onSelect={onSelectTab}
                    onDrop={onDrop}
                    isLastInList={idx === listItems.length - 1 && item.type === 'tab'}
                  />
                )}
              </React.Fragment>
            );
          })}
          {dragItem?.type === 'tab' && (
            <Box
              onDragOver={handleDragOverEndZone}
              onDragLeave={handleDragLeaveEndZone}
              onDrop={handleDropOnEndZone}
              sx={{
                height: 24,
                display: 'flex',
                alignItems: 'center',
                borderTop: isDropTargetEndZone ? '2px solid var(--accent-primary)' : '2px solid transparent',
                transition: 'border-color 0.15s',
              }}
            >
              {listItems.length === 0 && (
                <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.75rem', px: 1 }}>
                  Drop here to ungroup
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};
