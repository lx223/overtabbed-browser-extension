import { useState } from 'react';
import type { Rule } from '@/utils/rule';

export function useRules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading] = useState(false);

  return {
    rules,
    loading,
    refreshRules: () => { },
    setRules,
  };
}
