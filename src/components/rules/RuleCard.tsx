import React from 'react';
import { Box, Typography, Switch, IconButton, Card, Chip, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Rule } from '@/utils/rule';
import {
  getSubjectMatchFieldLabel,
  getSubjectMatchOperatorLabel,
  getConditionTypeLabel,
  getConditionOperatorLabel,
  getTimeUnitLabel,
  getActionTypeLabel,
  ConditionType,
  ActionType,
} from '@/utils/rule';

export interface RuleCardProps {
  rule: Rule;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const RuleCard: React.FC<RuleCardProps> = ({ rule, onToggle, onEdit, onDelete }) => {
  const getRuleSummary = () => {
    const parts: string[] = [];

    if (rule.subject?.matchers[0]) {
      const m = rule.subject.matchers[0];
      parts.push(
        `${getSubjectMatchFieldLabel(m.field)} ${getSubjectMatchOperatorLabel(m.operator)} "${m.value}"`
      );
    }

    if (rule.condition?.matchers[0]) {
      const m = rule.condition.matchers[0];
      const condLabel = getConditionTypeLabel(m.type);
      if (m.type === ConditionType.TAB_DUPLICATE) {
        parts.push(condLabel);
      } else {
        parts.push(
          `${condLabel} ${getConditionOperatorLabel(m.operator)} ${m.value} ${getTimeUnitLabel(m.timeUnit)}`
        );
      }
    }

    if (rule.action?.matchers[0]) {
      const m = rule.action.matchers[0];
      let actionLabel = getActionTypeLabel(m.type);
      if (m.type === ActionType.MOVE_TO_GROUP && m.params?.groupName) {
        actionLabel += ` "${m.params.groupName}"`;
      }
      parts.push(actionLabel);
    }

    return parts;
  };

  const summary = getRuleSummary();

  return (
    <Card
      sx={{
        p: 2,
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 2,
        opacity: rule.enabled ? 1 : 0.6,
        transition: 'all 0.15s ease',
        '&:hover': {
          borderColor: 'var(--border-default)',
          boxShadow: 'var(--shadow-sm)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Switch
              checked={rule.enabled}
              onChange={onToggle}
              size="small"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: 'var(--accent-primary)',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: 'var(--accent-primary)',
                },
              }}
            />
            <Typography
              sx={{
                fontWeight: 500,
                fontSize: '0.9375rem',
                color: 'var(--text-primary)',
              }}
            >
              {rule.name || 'Unnamed Rule'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ml: 5.5 }}>
            {summary.map((part, i) => (
              <Chip
                key={i}
                label={part}
                size="small"
                sx={{
                  backgroundColor: 'var(--bg-muted)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  height: 24,
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            ))}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={onEdit}
              sx={{ color: 'var(--text-tertiary)', '&:hover': { color: 'var(--accent-primary)' } }}
            >
              <EditIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={onDelete}
              sx={{ color: 'var(--text-tertiary)', '&:hover': { color: 'var(--accent-danger)' } }}
            >
              <DeleteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Card>
  );
};



