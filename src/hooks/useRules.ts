import { useState, useEffect, useCallback } from 'react';
import { RuleService } from '@/services/ruleService';
import type { Rule } from '@/utils/rule';

const ruleService = new RuleService();

export function useRules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRules = useCallback(async () => {
    setLoading(true);
    try {
      const loadedRules = await ruleService.getAllRules();
      setRules(loadedRules);
    } catch (error) {
      console.error('Failed to load rules:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRules();
    const unsubscribe = ruleService.onRulesChanged((newRules) => {
      setRules(newRules);
    });
    return unsubscribe;
  }, [loadRules]);

  return {
    rules,
    loading,
    refreshRules: loadRules,
  };
}

