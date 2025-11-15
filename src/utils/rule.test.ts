import { describe, it, expect } from 'vitest';
import {
  createRule,
  createSubject,
  createCondition,
  createAction,
  createSubjectMatcher,
  createConditionMatcher,
  createActionMatcher,
  serializeRuleList,
  deserializeRuleList,
  generateRuleId,
  getSubjectMatchFieldLabel,
  getSubjectMatchOperatorLabel,
  getConditionTypeLabel,
  getConditionOperatorLabel,
  getTimeUnitLabel,
  getActionTypeLabel,
  timeUnitToMs,
  SubjectType,
  SubjectMatchField,
  SubjectMatchOperator,
  ConditionType,
  ConditionOperator,
  TimeUnit,
  ActionType,
  JoinOperator,
} from './rule';
import { create } from '@bufbuild/protobuf';
import { RuleListSchema } from '@/generated/rule_pb';

describe('Rule Creation Functions', () => {
  describe('createRule', () => {
    it('creates a rule with defaults', () => {
      const rule = createRule();
      expect(rule).toBeDefined();
      expect(rule.enabled).toBe(false);
    });

    it('creates a rule with provided values', () => {
      const rule = createRule({
        id: 'test-id',
        name: 'Test Rule',
        enabled: true,
      });
      expect(rule.id).toBe('test-id');
      expect(rule.name).toBe('Test Rule');
      expect(rule.enabled).toBe(true);
    });
  });

  describe('createSubject', () => {
    it('creates a subject with matchers', () => {
      const subject = createSubject({
        type: SubjectType.TABS,
        matchers: [
          createSubjectMatcher({
            field: SubjectMatchField.URL,
            operator: SubjectMatchOperator.CONTAINS,
            value: 'github.com',
          }),
        ],
        joinOperator: JoinOperator.AND,
      });
      expect(subject.type).toBe(SubjectType.TABS);
      expect(subject.matchers).toHaveLength(1);
      expect(subject.matchers[0].value).toBe('github.com');
    });
  });

  describe('createCondition', () => {
    it('creates a condition with matchers', () => {
      const condition = createCondition({
        matchers: [
          createConditionMatcher({
            type: ConditionType.TAB_AGE,
            operator: ConditionOperator.GREATER_THAN,
            value: 30,
            timeUnit: TimeUnit.MINUTES,
          }),
        ],
        joinOperator: JoinOperator.AND,
      });
      expect(condition.matchers).toHaveLength(1);
      expect(condition.matchers[0].value).toBe(30);
    });
  });

  describe('createAction', () => {
    it('creates an action with matchers', () => {
      const action = createAction({
        matchers: [
          createActionMatcher({
            type: ActionType.CLOSE,
          }),
        ],
      });
      expect(action.matchers).toHaveLength(1);
      expect(action.matchers[0].type).toBe(ActionType.CLOSE);
    });
  });
});

describe('Serialization', () => {
  it('serializes and deserializes rule list', () => {
    const originalRuleList = create(RuleListSchema, {
      rules: [
        createRule({
          id: 'rule-1',
          name: 'Close Old Tabs',
          enabled: true,
          subject: createSubject({ type: SubjectType.TABS }),
          condition: createCondition({
            matchers: [
              createConditionMatcher({
                type: ConditionType.TAB_AGE,
                operator: ConditionOperator.GREATER_THAN,
                value: 60,
                timeUnit: TimeUnit.MINUTES,
              }),
            ],
          }),
          action: createAction({
            matchers: [createActionMatcher({ type: ActionType.CLOSE })],
          }),
        }),
      ],
    });

    const serialized = serializeRuleList(originalRuleList);
    expect(typeof serialized).toBe('string');

    const deserialized = deserializeRuleList(serialized);
    expect(deserialized.rules).toHaveLength(1);
    expect(deserialized.rules[0].id).toBe('rule-1');
    expect(deserialized.rules[0].name).toBe('Close Old Tabs');
    expect(deserialized.rules[0].enabled).toBe(true);
  });
});

describe('generateRuleId', () => {
  it('generates unique IDs', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateRuleId());
    }
    expect(ids.size).toBe(100);
  });

  it('generates IDs with correct prefix', () => {
    const id = generateRuleId();
    expect(id.startsWith('rule_')).toBe(true);
  });
});

describe('Label Functions', () => {
  describe('getSubjectMatchFieldLabel', () => {
    it('returns correct labels', () => {
      expect(getSubjectMatchFieldLabel(SubjectMatchField.URL)).toBe('URL');
      expect(getSubjectMatchFieldLabel(SubjectMatchField.TITLE)).toBe('Title');
      expect(getSubjectMatchFieldLabel(SubjectMatchField.DOMAIN)).toBe('Domain');
      expect(getSubjectMatchFieldLabel(99 as SubjectMatchField)).toBe('Unknown');
    });
  });

  describe('getSubjectMatchOperatorLabel', () => {
    it('returns correct labels', () => {
      expect(getSubjectMatchOperatorLabel(SubjectMatchOperator.CONTAINS)).toBe('contains');
      expect(getSubjectMatchOperatorLabel(SubjectMatchOperator.EQUALS)).toBe('equals');
      expect(getSubjectMatchOperatorLabel(SubjectMatchOperator.STARTS_WITH)).toBe('starts with');
      expect(getSubjectMatchOperatorLabel(SubjectMatchOperator.ENDS_WITH)).toBe('ends with');
      expect(getSubjectMatchOperatorLabel(SubjectMatchOperator.REGEX)).toBe('matches regex');
      expect(getSubjectMatchOperatorLabel(99 as SubjectMatchOperator)).toBe('unknown');
    });
  });

  describe('getConditionTypeLabel', () => {
    it('returns correct labels', () => {
      expect(getConditionTypeLabel(ConditionType.TAB_AGE)).toBe('Tab age');
      expect(getConditionTypeLabel(ConditionType.TAB_INACTIVE_DURATION)).toBe('Inactive duration');
      expect(getConditionTypeLabel(ConditionType.TAB_COUNT_EXCEEDS)).toBe('Tab count exceeds');
      expect(getConditionTypeLabel(ConditionType.TAB_DUPLICATE)).toBe('Is duplicate');
      expect(getConditionTypeLabel(99 as ConditionType)).toBe('Unknown');
    });
  });

  describe('getConditionOperatorLabel', () => {
    it('returns correct labels', () => {
      expect(getConditionOperatorLabel(ConditionOperator.GREATER_THAN)).toBe('>');
      expect(getConditionOperatorLabel(ConditionOperator.LESS_THAN)).toBe('<');
      expect(getConditionOperatorLabel(ConditionOperator.EQUALS)).toBe('=');
      expect(getConditionOperatorLabel(ConditionOperator.GREATER_THAN_OR_EQUALS)).toBe('>=');
      expect(getConditionOperatorLabel(ConditionOperator.LESS_THAN_OR_EQUALS)).toBe('<=');
      expect(getConditionOperatorLabel(99 as ConditionOperator)).toBe('?');
    });
  });

  describe('getTimeUnitLabel', () => {
    it('returns correct labels', () => {
      expect(getTimeUnitLabel(TimeUnit.MINUTES)).toBe('minutes');
      expect(getTimeUnitLabel(TimeUnit.HOURS)).toBe('hours');
      expect(getTimeUnitLabel(TimeUnit.DAYS)).toBe('days');
      expect(getTimeUnitLabel(99 as TimeUnit)).toBe('');
    });
  });

  describe('getActionTypeLabel', () => {
    it('returns correct labels', () => {
      expect(getActionTypeLabel(ActionType.CLOSE)).toBe('Close tabs');
      expect(getActionTypeLabel(ActionType.MOVE_TO_GROUP)).toBe('Move to group');
      expect(getActionTypeLabel(ActionType.PIN)).toBe('Pin tabs');
      expect(getActionTypeLabel(ActionType.UNPIN)).toBe('Unpin tabs');
      expect(getActionTypeLabel(ActionType.DISCARD)).toBe('Discard tabs');
      expect(getActionTypeLabel(ActionType.MUTE)).toBe('Mute tabs');
      expect(getActionTypeLabel(ActionType.HIGHLIGHT)).toBe('Highlight tabs');
      expect(getActionTypeLabel(99 as ActionType)).toBe('Unknown');
    });
  });
});

describe('timeUnitToMs', () => {
  it('converts minutes to milliseconds', () => {
    expect(timeUnitToMs(1, TimeUnit.MINUTES)).toBe(60 * 1000);
    expect(timeUnitToMs(30, TimeUnit.MINUTES)).toBe(30 * 60 * 1000);
  });

  it('converts hours to milliseconds', () => {
    expect(timeUnitToMs(1, TimeUnit.HOURS)).toBe(60 * 60 * 1000);
    expect(timeUnitToMs(24, TimeUnit.HOURS)).toBe(24 * 60 * 60 * 1000);
  });

  it('converts days to milliseconds', () => {
    expect(timeUnitToMs(1, TimeUnit.DAYS)).toBe(24 * 60 * 60 * 1000);
    expect(timeUnitToMs(7, TimeUnit.DAYS)).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('returns value unchanged for unknown unit', () => {
    expect(timeUnitToMs(100, 99 as TimeUnit)).toBe(100);
  });
});

