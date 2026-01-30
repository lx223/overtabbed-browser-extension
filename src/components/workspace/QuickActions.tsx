import React from 'react';
import { Box, Button, Tooltip } from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import FilterListIcon from '@mui/icons-material/FilterList';

interface QuickActionsProps {
  onSort: () => void;
  onGroup: () => void;
  onDedup: () => void;
  disabled?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onSort,
  onGroup,
  onDedup,
  disabled = false,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        mb: 2,
        px: 2,
        py: 1.5,
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 1,
        border: '1px solid var(--border-subtle)',
      }}
    >
      <Tooltip title="Sort all tabs by URL">
        <Button
          size="small"
          disabled={disabled}
          onClick={onSort}
          startIcon={<SortIcon sx={{ fontSize: 18 }} />}
          sx={{
            color: 'var(--text-secondary)',
            textTransform: 'none',
            fontSize: '0.8125rem',
            fontWeight: 500,
            px: 1.5,
            py: 0.5,
            '&:hover': {
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-primary)',
            },
            '&:disabled': {
              color: 'var(--text-muted)',
            },
          }}
        >
          Sort
        </Button>
      </Tooltip>

      <Tooltip title="Group ungrouped tabs by domain">
        <Button
          size="small"
          disabled={disabled}
          onClick={onGroup}
          startIcon={<GroupWorkIcon sx={{ fontSize: 18 }} />}
          sx={{
            color: 'var(--text-secondary)',
            textTransform: 'none',
            fontSize: '0.8125rem',
            fontWeight: 500,
            px: 1.5,
            py: 0.5,
            '&:hover': {
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-primary)',
            },
            '&:disabled': {
              color: 'var(--text-muted)',
            },
          }}
        >
          Group
        </Button>
      </Tooltip>

      <Tooltip title="Remove duplicate tabs">
        <Button
          size="small"
          disabled={disabled}
          onClick={onDedup}
          startIcon={<FilterListIcon sx={{ fontSize: 18 }} />}
          sx={{
            color: 'var(--text-secondary)',
            textTransform: 'none',
            fontSize: '0.8125rem',
            fontWeight: 500,
            px: 1.5,
            py: 0.5,
            '&:hover': {
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-primary)',
            },
            '&:disabled': {
              color: 'var(--text-muted)',
            },
          }}
        >
          Dedup
        </Button>
      </Tooltip>
    </Box>
  );
};
