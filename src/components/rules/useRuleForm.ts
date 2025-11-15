import { useState, useCallback } from 'react';
import type { Rule } from '@/utils/rule';
import {
  SubjectMatchField,
  SubjectMatchOperator,
  ConditionType,
  ConditionOperator,
  TimeUnit,
  ActionType,
} from '@/utils/rule';

export interface RuleFormState {
  ruleName: string;
  subjectField: SubjectMatchField;
  subjectOperator: SubjectMatchOperator;
  subjectValue: string;
  conditionType: ConditionType;
  conditionOperator: ConditionOperator;
  conditionValue: number;
  conditionTimeUnit: TimeUnit;
  actionType: ActionType;
  actionGroupName: string;
  actionGroupColor: string;
}

const defaultFormState: RuleFormState = {
  ruleName: '',
  subjectField: SubjectMatchField.URL,
  subjectOperator: SubjectMatchOperator.CONTAINS,
  subjectValue: '',
  conditionType: ConditionType.TAB_AGE,
  conditionOperator: ConditionOperator.GREATER_THAN,
  conditionValue: 4,
  conditionTimeUnit: TimeUnit.HOURS,
  actionType: ActionType.CLOSE,
  actionGroupName: '',
  actionGroupColor: 'blue',
};

export const useRuleForm = () => {
  const [formState, setFormState] = useState<RuleFormState>(defaultFormState);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);

  const resetForm = useCallback(() => {
    setFormState(defaultFormState);
    setEditingRule(null);
  }, []);

  const loadRule = useCallback((rule: Rule) => {
    setEditingRule(rule);
    setFormState({
      ruleName: rule.name,
      subjectField: rule.subject?.matchers[0]?.field ?? defaultFormState.subjectField,
      subjectOperator: rule.subject?.matchers[0]?.operator ?? defaultFormState.subjectOperator,
      subjectValue: rule.subject?.matchers[0]?.value ?? defaultFormState.subjectValue,
      conditionType: rule.condition?.matchers[0]?.type ?? defaultFormState.conditionType,
      conditionOperator: rule.condition?.matchers[0]?.operator ?? defaultFormState.conditionOperator,
      conditionValue: rule.condition?.matchers[0]?.value ?? defaultFormState.conditionValue,
      conditionTimeUnit: rule.condition?.matchers[0]?.timeUnit ?? defaultFormState.conditionTimeUnit,
      actionType: rule.action?.matchers[0]?.type ?? defaultFormState.actionType,
      actionGroupName: rule.action?.matchers[0]?.params?.groupName ?? defaultFormState.actionGroupName,
      actionGroupColor: rule.action?.matchers[0]?.params?.groupColor ?? defaultFormState.actionGroupColor,
    });
  }, []);

  const updateField = useCallback(<K extends keyof RuleFormState>(
    field: K,
    value: RuleFormState[K]
  ) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  }, []);

  return {
    formState,
    editingRule,
    resetForm,
    loadRule,
    updateField,
  };
};



