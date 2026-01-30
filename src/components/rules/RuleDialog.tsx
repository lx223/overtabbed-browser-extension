import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
} from '@mui/material';
import {
  SubjectMatchField,
  SubjectMatchOperator,
  ConditionType,
  ConditionOperator,
  TimeUnit,
  ActionType,
} from '@/utils/rule';
import { selectStyles, textFieldStyles } from '@/theme/formStyles';
import type { RuleFormState } from './useRuleForm';
import { GROUP_COLORS, getColorHex } from './groupColors';

export interface RuleDialogProps {
  open: boolean;
  editingRule: ReturnType<typeof import('./useRuleForm').useRuleForm>['editingRule'];
  formState: RuleFormState;
  onClose: () => void;
  onSave: () => void;
  onFieldChange: <K extends keyof RuleFormState>(field: K, value: RuleFormState[K]) => void;
}

export const RuleDialog: React.FC<RuleDialogProps> = ({
  open,
  editingRule,
  formState,
  onClose,
  onSave,
  onFieldChange,
}) => {
  const needsTimeUnit = formState.conditionType === ConditionType.TAB_AGE || formState.conditionType === ConditionType.TAB_INACTIVE_DURATION;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            backgroundColor: 'var(--dialog-bg)',
            borderRadius: 2,
            boxShadow: 'var(--shadow-lg)',
          },
        },
      }}
    >
      <DialogTitle sx={{ color: 'var(--text-primary)', fontWeight: 500, pb: 1 }}>
        {editingRule ? 'Edit Rule' : 'Create New Rule'}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Rule Name"
            value={formState.ruleName}
            onChange={(e) => onFieldChange('ruleName', e.target.value)}
            fullWidth
            size="small"
            placeholder="e.g., Close old YouTube tabs"
            sx={textFieldStyles}
          />

          <Box>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', mb: 1.5 }}>
              When tabs match
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel sx={{ color: 'var(--text-tertiary)' }}>Field</InputLabel>
                <Select
                  value={formState.subjectField}
                  onChange={(e) => onFieldChange('subjectField', e.target.value as SubjectMatchField)}
                  label="Field"
                  sx={selectStyles}
                >
                  <MenuItem value={SubjectMatchField.URL}>URL</MenuItem>
                  <MenuItem value={SubjectMatchField.TITLE}>Title</MenuItem>
                  <MenuItem value={SubjectMatchField.DOMAIN}>Domain</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ color: 'var(--text-tertiary)' }}>Operator</InputLabel>
                <Select
                  value={formState.subjectOperator}
                  onChange={(e) => onFieldChange('subjectOperator', e.target.value as SubjectMatchOperator)}
                  label="Operator"
                  sx={selectStyles}
                >
                  <MenuItem value={SubjectMatchOperator.CONTAINS}>contains</MenuItem>
                  <MenuItem value={SubjectMatchOperator.EQUALS}>equals</MenuItem>
                  <MenuItem value={SubjectMatchOperator.STARTS_WITH}>starts with</MenuItem>
                  <MenuItem value={SubjectMatchOperator.ENDS_WITH}>ends with</MenuItem>
                  <MenuItem value={SubjectMatchOperator.REGEX}>matches regex</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size="small"
                placeholder="Value"
                value={formState.subjectValue}
                onChange={(e) => onFieldChange('subjectValue', e.target.value)}
                sx={{
                  flex: 1,
                  minWidth: 150,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    '& fieldset': { borderColor: 'var(--input-border)' },
                  },
                }}
              />
            </Box>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', mb: 1.5 }}>
              And condition is met
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel sx={{ color: 'var(--text-tertiary)' }}>Condition</InputLabel>
                <Select
                  value={formState.conditionType}
                  onChange={(e) => onFieldChange('conditionType', e.target.value as ConditionType)}
                  label="Condition"
                  sx={selectStyles}
                >
                  <MenuItem value={ConditionType.TAB_AGE}>Tab age</MenuItem>
                  <MenuItem value={ConditionType.TAB_INACTIVE_DURATION}>Inactive duration</MenuItem>
                  <MenuItem value={ConditionType.TAB_COUNT_EXCEEDS}>Tab count exceeds</MenuItem>
                  <MenuItem value={ConditionType.TAB_DUPLICATE}>Is duplicate</MenuItem>
                </Select>
              </FormControl>
              {formState.conditionType !== ConditionType.TAB_DUPLICATE && (
                <>
                  <FormControl size="small" sx={{ minWidth: 80 }}>
                    <InputLabel sx={{ color: 'var(--text-tertiary)' }}>Op</InputLabel>
                    <Select
                      value={formState.conditionOperator}
                      onChange={(e) => onFieldChange('conditionOperator', e.target.value as ConditionOperator)}
                      label="Op"
                      sx={selectStyles}
                    >
                      <MenuItem value={ConditionOperator.GREATER_THAN}>&gt;</MenuItem>
                      <MenuItem value={ConditionOperator.LESS_THAN}>&lt;</MenuItem>
                      <MenuItem value={ConditionOperator.EQUALS}>=</MenuItem>
                      <MenuItem value={ConditionOperator.GREATER_THAN_OR_EQUALS}>&gt;=</MenuItem>
                      <MenuItem value={ConditionOperator.LESS_THAN_OR_EQUALS}>&lt;=</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    size="small"
                    type="number"
                    value={formState.conditionValue}
                    onChange={(e) => onFieldChange('conditionValue', parseInt(e.target.value) || 0)}
                    sx={{
                      width: 80,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'var(--input-bg)',
                        color: 'var(--text-primary)',
                        '& fieldset': { borderColor: 'var(--input-border)' },
                      },
                    }}
                  />
                  {needsTimeUnit && (
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <InputLabel sx={{ color: 'var(--text-tertiary)' }}>Unit</InputLabel>
                      <Select
                        value={formState.conditionTimeUnit}
                        onChange={(e) => onFieldChange('conditionTimeUnit', e.target.value as TimeUnit)}
                        label="Unit"
                        sx={selectStyles}
                      >
                        <MenuItem value={TimeUnit.MINUTES}>minutes</MenuItem>
                        <MenuItem value={TimeUnit.HOURS}>hours</MenuItem>
                        <MenuItem value={TimeUnit.DAYS}>days</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                </>
              )}
            </Box>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', mb: 1.5 }}>
              Then perform action
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel sx={{ color: 'var(--text-tertiary)' }}>Action</InputLabel>
                <Select
                  value={formState.actionType}
                  onChange={(e) => onFieldChange('actionType', e.target.value as ActionType)}
                  label="Action"
                  sx={selectStyles}
                >
                  <MenuItem value={ActionType.CLOSE}>Close tabs</MenuItem>
                  <MenuItem value={ActionType.MOVE_TO_GROUP}>Move to group</MenuItem>
                  <MenuItem value={ActionType.PIN}>Pin tabs</MenuItem>
                  <MenuItem value={ActionType.UNPIN}>Unpin tabs</MenuItem>
                  <MenuItem value={ActionType.DISCARD}>Discard tabs</MenuItem>
                  <MenuItem value={ActionType.MUTE}>Mute tabs</MenuItem>
                </Select>
              </FormControl>
              {formState.actionType === ActionType.MOVE_TO_GROUP && (
                <>
                  <TextField
                    size="small"
                    placeholder="Group name"
                    value={formState.actionGroupName}
                    onChange={(e) => onFieldChange('actionGroupName', e.target.value)}
                    sx={{
                      flex: 1,
                      minWidth: 120,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'var(--input-bg)',
                        color: 'var(--text-primary)',
                        '& fieldset': { borderColor: 'var(--input-border)' },
                      },
                    }}
                  />
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel sx={{ color: 'var(--text-tertiary)' }}>Color</InputLabel>
                    <Select
                      value={formState.actionGroupColor}
                      onChange={(e) => onFieldChange('actionGroupColor', e.target.value)}
                      label="Color"
                      sx={selectStyles}
                    >
                      {GROUP_COLORS.map((color) => (
                        <MenuItem key={color} value={color}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: getColorHex(color),
                              }}
                            />
                            {color}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button
          onClick={onClose}
          sx={{ color: 'var(--text-tertiary)', textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          disabled={!formState.ruleName.trim()}
          sx={{
            backgroundColor: 'var(--accent-primary)',
            color: 'white',
            textTransform: 'none',
            '&:hover': { backgroundColor: 'var(--accent-primary-hover)' },
            '&.Mui-disabled': { backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)' },
          }}
        >
          {editingRule ? 'Save Changes' : 'Create Rule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

