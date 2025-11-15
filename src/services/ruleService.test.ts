import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RuleService } from './ruleService';
import { mockStorage } from '@/setupTests';
import {
  createRule,
  createSubject,
  createCondition,
  createAction,
  createSubjectMatcher,
  createConditionMatcher,
  createActionMatcher,
  serializeRuleList,
  SubjectType,
  SubjectMatchField,
  SubjectMatchOperator,
  ConditionType,
  ConditionOperator,
  TimeUnit,
  ActionType,
} from '@/utils/rule';
import { create } from '@bufbuild/protobuf';
import { RuleListSchema } from '@/generated/rule_pb';

describe('RuleService', () => {
  let ruleService: RuleService;

  beforeEach(() => {
    ruleService = new RuleService();
    mockStorage.clear();
    vi.clearAllMocks();
  });

  describe('getAllRules', () => {
    it('returns empty array when no rules stored', async () => {
      const rules = await ruleService.getAllRules();
      expect(rules).toEqual([]);
    });

    it('returns stored rules', async () => {
      const storedRuleList = create(RuleListSchema, {
        rules: [
          createRule({
            id: 'rule-1',
            name: 'Test Rule',
            enabled: true,
          }),
        ],
      });
      const serialized = serializeRuleList(storedRuleList);
      mockStorage.set({ overtabbed_rules: serialized });

      const rules = await ruleService.getAllRules();

      expect(rules).toHaveLength(1);
      expect(rules[0].id).toBe('rule-1');
      expect(rules[0].name).toBe('Test Rule');
    });

    it('returns empty array on parse error', async () => {
      mockStorage.set({ overtabbed_rules: 'invalid-json' });

      const rules = await ruleService.getAllRules();
      expect(rules).toEqual([]);
    });
  });

  describe('createRule', () => {
    it('creates a new rule and saves it', async () => {
      const newRule = await ruleService.createRule({
        name: 'Close Inactive Tabs',
        enabled: true,
        subject: createSubject({
          type: SubjectType.TABS,
          matchers: [
            createSubjectMatcher({
              field: SubjectMatchField.URL,
              operator: SubjectMatchOperator.CONTAINS,
              value: 'example.com',
            }),
          ],
        }),
        condition: createCondition({
          matchers: [
            createConditionMatcher({
              type: ConditionType.TAB_INACTIVE_DURATION,
              operator: ConditionOperator.GREATER_THAN,
              value: 30,
              timeUnit: TimeUnit.MINUTES,
            }),
          ],
        }),
        action: createAction({
          matchers: [createActionMatcher({ type: ActionType.CLOSE })],
        }),
      });

      expect(newRule.id).toBeDefined();
      expect(newRule.id.startsWith('rule_')).toBe(true);
      expect(newRule.name).toBe('Close Inactive Tabs');
      expect(newRule.enabled).toBe(true);
      expect(newRule.createdAt).toBeDefined();
      expect(newRule.updatedAt).toBeDefined();

      const rules = await ruleService.getAllRules();
      expect(rules).toHaveLength(1);
    });
  });

  describe('updateRule', () => {
    it('updates an existing rule', async () => {
      const created = await ruleService.createRule({
        name: 'Original Name',
        enabled: false,
      });

      const updated = await ruleService.updateRule(created.id, {
        name: 'Updated Name',
        enabled: true,
      });

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.enabled).toBe(true);
      expect(updated?.id).toBe(created.id);
      expect(Number(updated?.updatedAt)).toBeGreaterThanOrEqual(Number(created.updatedAt));
    });

    it('returns null for non-existent rule', async () => {
      const updated = await ruleService.updateRule('non-existent', { name: 'Test' });
      expect(updated).toBeNull();
    });
  });

  describe('deleteRule', () => {
    it('deletes an existing rule', async () => {
      const created = await ruleService.createRule({ name: 'To Delete', enabled: false });

      const deleted = await ruleService.deleteRule(created.id);
      expect(deleted).toBe(true);

      const rules = await ruleService.getAllRules();
      expect(rules).toHaveLength(0);
    });

    it('returns false for non-existent rule', async () => {
      const deleted = await ruleService.deleteRule('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('toggleRule', () => {
    it('toggles rule from disabled to enabled', async () => {
      const created = await ruleService.createRule({ name: 'Toggle Test', enabled: false });

      const toggled = await ruleService.toggleRule(created.id);

      expect(toggled?.enabled).toBe(true);
    });

    it('toggles rule from enabled to disabled', async () => {
      const created = await ruleService.createRule({ name: 'Toggle Test', enabled: true });

      const toggled = await ruleService.toggleRule(created.id);

      expect(toggled?.enabled).toBe(false);
    });

    it('returns null for non-existent rule', async () => {
      const toggled = await ruleService.toggleRule('non-existent');
      expect(toggled).toBeNull();
    });
  });

  describe('getRule', () => {
    it('returns rule by id', async () => {
      const created = await ruleService.createRule({ name: 'Get Test', enabled: true });

      const rule = await ruleService.getRule(created.id);

      expect(rule).not.toBeNull();
      expect(rule?.name).toBe('Get Test');
    });

    it('returns null for non-existent rule', async () => {
      const rule = await ruleService.getRule('non-existent');
      expect(rule).toBeNull();
    });
  });
});

