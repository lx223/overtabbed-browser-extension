import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  Switch,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useRules } from '@/hooks/useRules';
import { useRuleActions } from '@/hooks/useRuleActions';
import {
  createRule,
  createSubject,
  createCondition,
  createAction,
  createSubjectMatcher,
  createConditionMatcher,
  createActionMatcher,
  createActionParams,
  SubjectType,
  SubjectMatchField,
  SubjectMatchOperator,
  ConditionType,
  ConditionOperator,
  TimeUnit,
  ActionType,
  JoinOperator,
  getSubjectMatchFieldLabel,
  getSubjectMatchOperatorLabel,
  getConditionTypeLabel,
  getConditionOperatorLabel,
  getTimeUnitLabel,
  getActionTypeLabel,
  type Rule,
} from '@/utils/rule';

const GROUP_COLORS = ['grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'];

export const RulesPage: React.FC = () => {
  const { rules, loading } = useRules();
  const { createRule: saveRule, updateRule, deleteRule, toggleRule } = useRuleActions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);

  const [ruleName, setRuleName] = useState('');
  const [subjectField, setSubjectField] = useState<SubjectMatchField>(SubjectMatchField.URL);
  const [subjectOperator, setSubjectOperator] = useState<SubjectMatchOperator>(SubjectMatchOperator.CONTAINS);
  const [subjectValue, setSubjectValue] = useState('');
  const [conditionType, setConditionType] = useState<ConditionType>(ConditionType.TAB_AGE);
  const [conditionOperator, setConditionOperator] = useState<ConditionOperator>(ConditionOperator.GREATER_THAN);
  const [conditionValue, setConditionValue] = useState(4);
  const [conditionTimeUnit, setConditionTimeUnit] = useState<TimeUnit>(TimeUnit.HOURS);
  const [actionType, setActionType] = useState<ActionType>(ActionType.CLOSE);
  const [actionGroupName, setActionGroupName] = useState('');
  const [actionGroupColor, setActionGroupColor] = useState('blue');

  const resetForm = useCallback(() => {
    setRuleName('');
    setSubjectField(SubjectMatchField.URL);
    setSubjectOperator(SubjectMatchOperator.CONTAINS);
    setSubjectValue('');
    setConditionType(ConditionType.TAB_AGE);
    setConditionOperator(ConditionOperator.GREATER_THAN);
    setConditionValue(4);
    setConditionTimeUnit(TimeUnit.HOURS);
    setActionType(ActionType.CLOSE);
    setActionGroupName('');
    setActionGroupColor('blue');
    setEditingRule(null);
  }, []);

  const openCreateDialog = useCallback(() => {
    resetForm();
    setDialogOpen(true);
  }, [resetForm]);

  const openEditDialog = useCallback((rule: Rule) => {
    setEditingRule(rule);
    setRuleName(rule.name);

    if (rule.subject?.matchers[0]) {
      const matcher = rule.subject.matchers[0];
      setSubjectField(matcher.field);
      setSubjectOperator(matcher.operator);
      setSubjectValue(matcher.value);
    }

    if (rule.condition?.matchers[0]) {
      const matcher = rule.condition.matchers[0];
      setConditionType(matcher.type);
      setConditionOperator(matcher.operator);
      setConditionValue(matcher.value);
      setConditionTimeUnit(matcher.timeUnit);
    }

    if (rule.action?.matchers[0]) {
      const matcher = rule.action.matchers[0];
      setActionType(matcher.type);
      if (matcher.params) {
        setActionGroupName(matcher.params.groupName || '');
        setActionGroupColor(matcher.params.groupColor || 'blue');
      }
    }

    setDialogOpen(true);
  }, []);

  const handleSaveRule = useCallback(async () => {
    const subject = createSubject({
      type: SubjectType.TABS,
      matchers: [
        createSubjectMatcher({
          field: subjectField,
          operator: subjectOperator,
          value: subjectValue,
        }),
      ],
      joinOperator: JoinOperator.AND,
    });

    const condition = createCondition({
      matchers: [
        createConditionMatcher({
          type: conditionType,
          operator: conditionOperator,
          value: conditionValue,
          timeUnit: conditionTimeUnit,
        }),
      ],
      joinOperator: JoinOperator.AND,
    });

    const actionParams = actionType === ActionType.MOVE_TO_GROUP
      ? createActionParams({ groupName: actionGroupName, groupColor: actionGroupColor })
      : undefined;

    const action = createAction({
      matchers: [
        createActionMatcher({
          type: actionType,
          params: actionParams,
        }),
      ],
      joinOperator: JoinOperator.AND,
    });

    if (editingRule) {
      await updateRule(editingRule.id, {
        name: ruleName,
        subject,
        condition,
        action,
      });
    } else {
      const newRule = createRule({
        name: ruleName,
        enabled: true,
        subject,
        condition,
        action,
      });
      await saveRule(newRule);
    }

    setDialogOpen(false);
    resetForm();
  }, [
    editingRule,
    ruleName,
    subjectField,
    subjectOperator,
    subjectValue,
    conditionType,
    conditionOperator,
    conditionValue,
    conditionTimeUnit,
    actionType,
    actionGroupName,
    actionGroupColor,
    saveRule,
    updateRule,
    resetForm,
  ]);

  const handleDeleteConfirm = useCallback(async () => {
    if (ruleToDelete) {
      await deleteRule(ruleToDelete);
      setRuleToDelete(null);
      setDeleteConfirmOpen(false);
    }
  }, [ruleToDelete, deleteRule]);

  const handleRunRules = useCallback(async () => {
    try {
      await chrome.runtime.sendMessage({ type: 'RUN_RULES_MANUALLY' });
    } catch {
      const { ruleEngine } = await import('@/background/ruleEngine');
      await ruleEngine.runManually();
    }
  }, []);

  const getRuleSummary = (rule: Rule) => {
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

  const needsTimeUnit = conditionType === ConditionType.TAB_AGE || conditionType === ConditionType.TAB_INACTIVE_DURATION;

  if (loading) {
    return (
      <Box sx={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)' }}>
        <Typography sx={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Loading...</Typography>
      </Box>
    );
  }

  return (
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Rules
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-muted)', mt: 0.5 }}>
              Automate tab management with custom rules
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Run all rules now">
              <Button
                variant="outlined"
                size="small"
                startIcon={<PlayArrowIcon />}
                onClick={handleRunRules}
                sx={{
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-secondary)',
                  textTransform: 'none',
                  '&:hover': { borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' },
                }}
              >
                Run Now
              </Button>
            </Tooltip>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
              sx={{
                backgroundColor: 'var(--accent-primary)',
                textTransform: 'none',
                '&:hover': { backgroundColor: 'var(--accent-primary-hover)' },
              }}
            >
              New Rule
            </Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pb: 3 }}>
        {rules.length === 0 ? (
          <Box
            sx={{
              py: 8,
              textAlign: 'center',
              border: '2px dashed var(--border-default)',
              borderRadius: 2,
              backgroundColor: 'var(--bg-muted)',
            }}
          >
            <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.875rem', mb: 2 }}>
              No rules yet. Create your first rule to automate tab management.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
              sx={{
                borderColor: 'var(--accent-primary)',
                color: 'var(--accent-primary)',
                textTransform: 'none',
              }}
            >
              Create Rule
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {rules.map((rule) => {
              const summary = getRuleSummary(rule);
              return (
                <Card
                  key={rule.id}
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
                          onChange={() => toggleRule(rule.id)}
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
                          onClick={() => openEditDialog(rule)}
                          sx={{ color: 'var(--text-tertiary)', '&:hover': { color: 'var(--accent-primary)' } }}
                        >
                          <EditIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setRuleToDelete(rule.id);
                            setDeleteConfirmOpen(true);
                          }}
                          sx={{ color: 'var(--text-tertiary)', '&:hover': { color: 'var(--accent-danger)' } }}
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
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
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              fullWidth
              size="small"
              placeholder="e.g., Close old YouTube tabs"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  '& fieldset': { borderColor: 'var(--input-border)' },
                  '&:hover fieldset': { borderColor: 'var(--border-default)' },
                  '&.Mui-focused fieldset': { borderColor: 'var(--accent-primary)' },
                },
                '& .MuiInputLabel-root': { color: 'var(--text-tertiary)' },
              }}
            />

            <Box>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', mb: 1.5 }}>
                When tabs match
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel sx={{ color: 'var(--text-tertiary)' }}>Field</InputLabel>
                  <Select
                    value={subjectField}
                    onChange={(e) => setSubjectField(e.target.value as SubjectMatchField)}
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
                    value={subjectOperator}
                    onChange={(e) => setSubjectOperator(e.target.value as SubjectMatchOperator)}
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
                  value={subjectValue}
                  onChange={(e) => setSubjectValue(e.target.value)}
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
                    value={conditionType}
                    onChange={(e) => setConditionType(e.target.value as ConditionType)}
                    label="Condition"
                    sx={selectStyles}
                  >
                    <MenuItem value={ConditionType.TAB_AGE}>Tab age</MenuItem>
                    <MenuItem value={ConditionType.TAB_INACTIVE_DURATION}>Inactive duration</MenuItem>
                    <MenuItem value={ConditionType.TAB_COUNT_EXCEEDS}>Tab count exceeds</MenuItem>
                    <MenuItem value={ConditionType.TAB_DUPLICATE}>Is duplicate</MenuItem>
                  </Select>
                </FormControl>
                {conditionType !== ConditionType.TAB_DUPLICATE && (
                  <>
                    <FormControl size="small" sx={{ minWidth: 80 }}>
                      <InputLabel sx={{ color: 'var(--text-tertiary)' }}>Op</InputLabel>
                      <Select
                        value={conditionOperator}
                        onChange={(e) => setConditionOperator(e.target.value as ConditionOperator)}
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
                      value={conditionValue}
                      onChange={(e) => setConditionValue(parseInt(e.target.value) || 0)}
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
                          value={conditionTimeUnit}
                          onChange={(e) => setConditionTimeUnit(e.target.value as TimeUnit)}
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
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as ActionType)}
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
                {actionType === ActionType.MOVE_TO_GROUP && (
                  <>
                    <TextField
                      size="small"
                      placeholder="Group name"
                      value={actionGroupName}
                      onChange={(e) => setActionGroupName(e.target.value)}
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
                        value={actionGroupColor}
                        onChange={(e) => setActionGroupColor(e.target.value)}
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
            onClick={() => setDialogOpen(false)}
            sx={{ color: 'var(--text-tertiary)', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveRule}
            disabled={!ruleName.trim()}
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

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: 'var(--dialog-bg)',
              borderRadius: 2,
              minWidth: 320,
              boxShadow: 'var(--shadow-lg)',
            },
          },
        }}
      >
        <DialogTitle sx={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 500, pb: 1 }}>
          Delete Rule?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{ color: 'var(--text-tertiary)', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            sx={{ color: 'var(--accent-danger)', textTransform: 'none' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const selectStyles = {
  backgroundColor: 'var(--input-bg)',
  color: 'var(--text-primary)',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--input-border)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border-default)' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--accent-primary)' },
  '& .MuiSelect-icon': { color: 'var(--text-tertiary)' },
};

function getColorHex(color: string): string {
  const colors: Record<string, string> = {
    grey: '#6b7280',
    blue: '#3b82f6',
    red: '#ef4444',
    yellow: '#eab308',
    green: '#22c55e',
    pink: '#ec4899',
    purple: '#8b5cf6',
    cyan: '#06b6d4',
    orange: '#f97316',
  };
  return colors[color] || '#6b7280';
}

