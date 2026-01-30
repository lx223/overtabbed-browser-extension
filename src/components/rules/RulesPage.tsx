import React, { useState, useCallback } from 'react';
import { Box, Typography, Button, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useRules } from '@/hooks/useRules';
import { useRuleActions } from '@/hooks/useRuleActions';
import { RuleCard } from './RuleCard';
import { RuleDialog } from './RuleDialog';
import { useRuleForm } from './useRuleForm';
import { ConfirmDialog } from '@/components/common';
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
  ActionType,
  JoinOperator,
} from '@/utils/rule';

export const RulesPage: React.FC = () => {
  const { rules, loading } = useRules();
  const { createRule: saveRule, updateRule, deleteRule, toggleRule } = useRuleActions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);

  const {
    formState,
    editingRule,
    resetForm,
    loadRule,
    updateField,
  } = useRuleForm();

  const openCreateDialog = useCallback(() => {
    resetForm();
    setDialogOpen(true);
  }, [resetForm]);

  const openEditDialog = useCallback((rule: ReturnType<typeof useRuleForm>['editingRule']) => {
    if (!rule) return;
    loadRule(rule);
    setDialogOpen(true);
  }, [loadRule]);

  const handleSaveRule = useCallback(async () => {
    const subject = createSubject({
      type: SubjectType.TABS,
      matchers: [
        createSubjectMatcher({
          field: formState.subjectField,
          operator: formState.subjectOperator,
          value: formState.subjectValue,
        }),
      ],
      joinOperator: JoinOperator.AND,
    });

    const condition = createCondition({
      matchers: [
        createConditionMatcher({
          type: formState.conditionType,
          operator: formState.conditionOperator,
          value: formState.conditionValue,
          timeUnit: formState.conditionTimeUnit,
        }),
      ],
      joinOperator: JoinOperator.AND,
    });

    const actionParams = formState.actionType === ActionType.MOVE_TO_GROUP
      ? createActionParams({ groupName: formState.actionGroupName, groupColor: formState.actionGroupColor })
      : undefined;

    const action = createAction({
      matchers: [
        createActionMatcher({
          type: formState.actionType,
          params: actionParams,
        }),
      ],
      joinOperator: JoinOperator.AND,
    });

    if (editingRule) {
      await updateRule(editingRule.id, {
        name: formState.ruleName,
        subject,
        condition,
        action,
      });
    } else {
      const newRule = createRule({
        name: formState.ruleName,
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
    formState,
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
      console.error('Rules engine not available');
    }
  }, []);

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
            {rules.map((rule) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                onToggle={() => toggleRule(rule.id)}
                onEdit={() => openEditDialog(rule)}
                onDelete={() => {
                  setRuleToDelete(rule.id);
                  setDeleteConfirmOpen(true);
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      <RuleDialog
        open={dialogOpen}
        editingRule={editingRule}
        formState={formState}
        onClose={() => {
          setDialogOpen(false);
          resetForm();
        }}
        onSave={handleSaveRule}
        onFieldChange={updateField}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Rule?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </Box>
  );
};

