import { useCallback } from 'react';
import type { Rule } from '@/utils/rule';

export function useRuleActions() {
  const createRule = useCallback(async (_rule: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>) => {
    return {} as Rule;
  }, []);

  const updateRule = useCallback(async (_id: string, _updates: Partial<Rule>) => {
    return {} as Rule;
  }, []);

  const deleteRule = useCallback(async (_id: string) => {
  }, []);

  const toggleRule = useCallback(async (_id: string) => {
  }, []);

  return {
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
  };
}
