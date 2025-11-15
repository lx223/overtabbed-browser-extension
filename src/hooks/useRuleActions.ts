import { useCallback } from 'react';
import { RuleService } from '@/services/ruleService';
import type { Rule } from '@/utils/rule';

const ruleService = new RuleService();

export function useRuleActions() {
  const createRule = useCallback(async (rule: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>) => {
    return ruleService.createRule(rule);
  }, []);

  const updateRule = useCallback(async (id: string, updates: Partial<Rule>) => {
    return ruleService.updateRule(id, updates);
  }, []);

  const deleteRule = useCallback(async (id: string) => {
    return ruleService.deleteRule(id);
  }, []);

  const toggleRule = useCallback(async (id: string) => {
    return ruleService.toggleRule(id);
  }, []);

  return {
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
  };
}

