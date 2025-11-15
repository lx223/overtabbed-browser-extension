import { create } from '@bufbuild/protobuf';
import {
  RuleListSchema,
  type Rule,
  type RuleList,
} from '@/generated/rule_pb';
import {
  serializeRuleList,
  deserializeRuleList,
  generateRuleId,
  createRule,
} from '@/utils/rule';

const STORAGE_KEY = 'overtabbed_rules';

export class RuleService {
  async getAllRules(): Promise<Rule[]> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([STORAGE_KEY], (result) => {
        if (result[STORAGE_KEY]) {
          try {
            const ruleList = deserializeRuleList(result[STORAGE_KEY]);
            resolve(ruleList.rules);
          } catch {
            resolve([]);
          }
        } else {
          resolve([]);
        }
      });
    });
  }

  async saveRules(rules: Rule[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const ruleList: RuleList = create(RuleListSchema, { rules });
      const serialized = serializeRuleList(ruleList);
      
      chrome.storage.sync.set({ [STORAGE_KEY]: serialized }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  async createRule(rule: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Rule> {
    const rules = await this.getAllRules();
    const now = BigInt(Date.now());
    
    const newRule = createRule({
      ...rule,
      id: generateRuleId(),
      createdAt: now,
      updatedAt: now,
    });
    
    rules.push(newRule);
    await this.saveRules(rules);
    return newRule;
  }

  async updateRule(id: string, updates: Partial<Rule>): Promise<Rule | null> {
    const rules = await this.getAllRules();
    const index = rules.findIndex((r) => r.id === id);
    
    if (index === -1) return null;
    
    const existingRule = rules[index];
    const updatedRule = createRule({
      ...existingRule,
      ...updates,
      id: existingRule.id,
      createdAt: existingRule.createdAt,
      updatedAt: BigInt(Date.now()),
    });
    
    rules[index] = updatedRule;
    await this.saveRules(rules);
    return updatedRule;
  }

  async deleteRule(id: string): Promise<boolean> {
    const rules = await this.getAllRules();
    const filteredRules = rules.filter((r) => r.id !== id);
    
    if (filteredRules.length === rules.length) return false;
    
    await this.saveRules(filteredRules);
    return true;
  }

  async toggleRule(id: string): Promise<Rule | null> {
    const rules = await this.getAllRules();
    const rule = rules.find((r) => r.id === id);
    
    if (!rule) return null;
    
    return this.updateRule(id, { enabled: !rule.enabled });
  }

  async getRule(id: string): Promise<Rule | null> {
    const rules = await this.getAllRules();
    return rules.find((r) => r.id === id) || null;
  }

  onRulesChanged(callback: (rules: Rule[]) => void): () => void {
    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === 'sync' && changes[STORAGE_KEY]) {
        try {
          const ruleList = deserializeRuleList(changes[STORAGE_KEY].newValue);
          callback(ruleList.rules);
        } catch {
          callback([]);
        }
      }
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }
}

