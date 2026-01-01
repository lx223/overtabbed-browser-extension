import { create, toJson, fromJson, type MessageShape } from '@bufbuild/protobuf';
import {
  RuleSchema,
  RuleListSchema,
  SubjectSchema,
  ConditionSchema,
  ActionSchema,
  SubjectMatcherSchema,
  ConditionMatcherSchema,
  ActionMatcherSchema,
  ActionParamsSchema,
  SubjectType,
  SubjectMatchField,
  SubjectMatchOperator,
  ConditionType,
  ConditionOperator,
  TimeUnit,
  ActionType,
  JoinOperator,
  type Rule,
  type RuleList,
  type Subject,
  type Condition,
  type Action,
  type SubjectMatcher,
  type ConditionMatcher,
  type ActionMatcher,
  type ActionParams,
} from '@/generated/rule_pb';

export {
  SubjectType,
  SubjectMatchField,
  SubjectMatchOperator,
  ConditionType,
  ConditionOperator,
  TimeUnit,
  ActionType,
  JoinOperator,
};

export type {
  Rule,
  RuleList,
  Subject,
  Condition,
  Action,
  SubjectMatcher,
  ConditionMatcher,
  ActionMatcher,
  ActionParams,
};

export function createRule(partial?: Partial<MessageShape<typeof RuleSchema>>): Rule {
  return create(RuleSchema, partial);
}

export function createSubject(partial?: Partial<MessageShape<typeof SubjectSchema>>): Subject {
  return create(SubjectSchema, partial);
}

export function createCondition(partial?: Partial<MessageShape<typeof ConditionSchema>>): Condition {
  return create(ConditionSchema, partial);
}

export function createAction(partial?: Partial<MessageShape<typeof ActionSchema>>): Action {
  return create(ActionSchema, partial);
}

export function createSubjectMatcher(partial?: Partial<MessageShape<typeof SubjectMatcherSchema>>): SubjectMatcher {
  return create(SubjectMatcherSchema, partial);
}

export function createConditionMatcher(partial?: Partial<MessageShape<typeof ConditionMatcherSchema>>): ConditionMatcher {
  return create(ConditionMatcherSchema, partial);
}

export function createActionMatcher(partial?: Partial<MessageShape<typeof ActionMatcherSchema>>): ActionMatcher {
  return create(ActionMatcherSchema, partial);
}

export function createActionParams(partial?: Partial<MessageShape<typeof ActionParamsSchema>>): ActionParams {
  return create(ActionParamsSchema, partial);
}

export function serializeRuleList(ruleList: RuleList): string {
  return JSON.stringify(toJson(RuleListSchema, ruleList));
}

export function deserializeRuleList(json: string): RuleList {
  return fromJson(RuleListSchema, JSON.parse(json));
}

export function generateRuleId(): string {
  return `rule_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function getSubjectMatchFieldLabel(field: SubjectMatchField): string {
  switch (field) {
    case SubjectMatchField.URL: return 'URL';
    case SubjectMatchField.TITLE: return 'Title';
    case SubjectMatchField.DOMAIN: return 'Domain';
    default: return 'Unknown';
  }
}

export function getSubjectMatchOperatorLabel(op: SubjectMatchOperator): string {
  switch (op) {
    case SubjectMatchOperator.CONTAINS: return 'contains';
    case SubjectMatchOperator.EQUALS: return 'equals';
    case SubjectMatchOperator.STARTS_WITH: return 'starts with';
    case SubjectMatchOperator.ENDS_WITH: return 'ends with';
    case SubjectMatchOperator.REGEX: return 'matches regex';
    default: return 'unknown';
  }
}

export function getConditionTypeLabel(type: ConditionType): string {
  switch (type) {
    case ConditionType.TAB_AGE: return 'Tab age';
    case ConditionType.TAB_INACTIVE_DURATION: return 'Inactive duration';
    case ConditionType.TAB_COUNT_EXCEEDS: return 'Tab count exceeds';
    case ConditionType.TAB_DUPLICATE: return 'Is duplicate';
    default: return 'Unknown';
  }
}

export function getConditionOperatorLabel(op: ConditionOperator): string {
  switch (op) {
    case ConditionOperator.GREATER_THAN: return '>';
    case ConditionOperator.LESS_THAN: return '<';
    case ConditionOperator.EQUALS: return '=';
    case ConditionOperator.GREATER_THAN_OR_EQUALS: return '>=';
    case ConditionOperator.LESS_THAN_OR_EQUALS: return '<=';
    default: return '?';
  }
}

export function getTimeUnitLabel(unit: TimeUnit): string {
  switch (unit) {
    case TimeUnit.MINUTES: return 'minutes';
    case TimeUnit.HOURS: return 'hours';
    case TimeUnit.DAYS: return 'days';
    default: return '';
  }
}

export function getActionTypeLabel(type: ActionType): string {
  switch (type) {
    case ActionType.CLOSE: return 'Close tabs';
    case ActionType.MOVE_TO_GROUP: return 'Move to group';
    case ActionType.PIN: return 'Pin tabs';
    case ActionType.UNPIN: return 'Unpin tabs';
    case ActionType.DISCARD: return 'Discard tabs';
    case ActionType.MUTE: return 'Mute tabs';
    case ActionType.HIGHLIGHT: return 'Highlight tabs';
    default: return 'Unknown';
  }
}

export function timeUnitToMs(value: number, unit: TimeUnit): number {
  switch (unit) {
    case TimeUnit.MINUTES: return value * 60 * 1000;
    case TimeUnit.HOURS: return value * 60 * 60 * 1000;
    case TimeUnit.DAYS: return value * 24 * 60 * 60 * 1000;
    default: return value;
  }
}

