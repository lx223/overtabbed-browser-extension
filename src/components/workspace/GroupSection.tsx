import React, { useState, useCallback, useMemo, memo, useRef, useLayoutEffect } from 'react';
import { Box, Typography, IconButton, Collapse, Tooltip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import { TabRow } from './TabRow';
import { getGroupColor } from '@/utils/groupColor';
import type { Tab } from '@/utils/tab';
import type { Group } from '@/utils/group';
import { useGroupActions } from '@/hooks/useGroupActions';

export interface GroupSectionProps {
  group: Group;
  tabs: Tab[];
  selectedTabs: Set<number>;
  searchQuery?: string;
  onSelectTab: (tabId: number, event: React.MouseEvent) => void;
  onToggleSelectAll?: (tabIds: number[], selectAll: boolean) => void;
}

const GroupSectionComponent: React.FC<GroupSectionProps> = ({
  group, tabs, selectedTabs, searchQuery = '', onSelectTab, onToggleSelectAll,
}) => {
  const [isExpanded, setIsExpanded] = useState(!group.collapsed);
  const [isHovered, setIsHovered] = useState(false);
  const groupColor = getGroupColor(group.color);
  const { ungroupTabs, toggleGroupCollapse } = useGroupActions();
  const isUserTogglingRef = useRef(false);

  const groupTabIds = useMemo(() => tabs.map(t => t.id), [tabs]);
  const selectedInGroup = useMemo(() => groupTabIds.filter(id => selectedTabs.has(id)).length, [groupTabIds, selectedTabs]);
  const allSelectedInGroup = selectedInGroup === groupTabIds.length && groupTabIds.length > 0;
  const someSelectedInGroup = selectedInGroup > 0 && !allSelectedInGroup;

  useLayoutEffect(() => {
    if (!isUserTogglingRef.current) {
      // Sync local state with prop changes (excluding user-initiated toggles)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsExpanded(!group.collapsed);
    }
    isUserTogglingRef.current = false;
  }, [group.collapsed]);

  const handleToggleSelectAll = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelectAll?.(groupTabIds, !allSelectedInGroup);
  }, [onToggleSelectAll, groupTabIds, allSelectedInGroup]);

  const handleUngroup = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    await ungroupTabs(tabs.map(t => t.id));
  }, [tabs, ungroupTabs]);

  const handleHeaderClick = async () => {
    const newExpanded = !isExpanded;
    isUserTogglingRef.current = true;
    setIsExpanded(newExpanded);
    await toggleGroupCollapse(group.id, !newExpanded);
    isUserTogglingRef.current = false;
  };

  const showCheckbox = (isHovered || selectedInGroup > 0) && onToggleSelectAll;
  const CheckboxIcon = allSelectedInGroup ? CheckBoxIcon : someSelectedInGroup ? IndeterminateCheckBoxIcon : CheckBoxOutlineBlankIcon;

  return (
    <Box sx={{ mb: 0.5 }}>
      <Box
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleHeaderClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          py: 0.5,
          px: 0.5,
          cursor: 'pointer',
          borderRadius: 1,
          userSelect: 'none',
          '&:hover': {
            backgroundColor: 'var(--bg-hover)',
            '& .ungroup-btn': { opacity: 1 },
          },
        }}
      >
        <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton size="small" sx={{ p: 0, color: 'var(--text-muted)', pointerEvents: 'none' }}>
            {isExpanded ? <ExpandMoreIcon sx={{ fontSize: 18 }} /> : <ChevronRightIcon sx={{ fontSize: 18 }} />}
          </IconButton>
        </Box>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: groupColor, flexShrink: 0 }} />
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', flex: 1, pointerEvents: 'none' }}>
          {group.title || 'Untitled'}
        </Typography>
        {showCheckbox && (
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
              <CheckboxIcon sx={{ fontSize: 16 }} />
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
          {tabs.map((tab) => (
            <TabRow
              key={tab.id}
              tab={tab}
              isSelected={selectedTabs.has(tab.id)}
              searchQuery={searchQuery}
              onSelect={onSelectTab}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export const GroupSection = memo(GroupSectionComponent);


