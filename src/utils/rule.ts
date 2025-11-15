export enum SubjectType {
  UNSPECIFIED = 0,
  TABS = 1,
}

export enum SubjectMatchField {
  UNSPECIFIED = 0,
  URL = 1,
  TITLE = 2,
  DOMAIN = 3,
}

export enum SubjectMatchOperator {
  UNSPECIFIED = 0,
  CONTAINS = 1,
  EQUALS = 2,
  STARTS_WITH = 3,
  ENDS_WITH = 4,
  REGEX = 5,
}

export enum ConditionType {
  UNSPECIFIED = 0,
  TAB_AGE = 1,
  TAB_INACTIVE_DURATION = 2,
  TAB_COUNT_EXCEEDS = 3,
  TAB_DUPLICATE = 4,
}

export enum ConditionOperator {
  UNSPECIFIED = 0,
  GREATER_THAN = 1,
  LESS_THAN = 2,
  EQUALS = 3,
  GREATER_THAN_OR_EQUALS = 4,
  LESS_THAN_OR_EQUALS = 5,
}

export enum TimeUnit {
  UNSPECIFIED = 0,
  MINUTES = 1,
  HOURS = 2,
  DAYS = 3,
}

export enum ActionType {
  UNSPECIFIED = 0,
  CLOSE = 1,
  MOVE_TO_GROUP = 2,
  PIN = 3,
  UNPIN = 4,
  DISCARD = 5,
  MUTE = 6,
  HIGHLIGHT = 7,
}

export enum JoinOperator {
  UNSPECIFIED = 0,
  AND = 1,
  OR = 2,
}

export interface ActionParams {
  groupName?: string;
  groupColor?: string;
}

export interface SubjectMatcher {
  field: SubjectMatchField;
  operator: SubjectMatchOperator;
  value: string;
}

export interface ConditionMatcher {
  type: ConditionType;
  operator: ConditionOperator;
  value: number;
  timeUnit: TimeUnit;
}

export interface ActionMatcher {
  type: ActionType;
  params?: ActionParams;
}

export interface Subject {
  type: SubjectType;
  matchers: SubjectMatcher[];
  joinOperator: JoinOperator;
}

export interface Condition {
  matchers: ConditionMatcher[];
  joinOperator: JoinOperator;
}

export interface Action {
  matchers: ActionMatcher[];
  joinOperator: JoinOperator;
}

export interface Rule {
  id: string;
  name: string;
  enabled: boolean;
  subject?: Subject;
  condition?: Condition;
  action?: Action;
  createdAt?: number;
  updatedAt?: number;
}

export interface RuleList {
  rules: Rule[];
}

export function createRule(partial?: Partial<Rule>): Rule {
  return {
    id: generateRuleId(),
    name: '',
    enabled: true,
    ...partial,
  };
}

export function createSubject(partial?: Partial<Subject>): Subject {
  return {
    type: SubjectType.TABS,
    matchers: [],
    joinOperator: JoinOperator.AND,
    ...partial,
  };
}

export function createCondition(partial?: Partial<Condition>): Condition {
  return {
    matchers: [],
    joinOperator: JoinOperator.AND,
    ...partial,
  };
}

export function createAction(partial?: Partial<Action>): Action {
  return {
    matchers: [],
    joinOperator: JoinOperator.AND,
    ...partial,
  };
}

export function createSubjectMatcher(partial?: Partial<SubjectMatcher>): SubjectMatcher {
  return {
    field: SubjectMatchField.URL,
    operator: SubjectMatchOperator.CONTAINS,
    value: '',
    ...partial,
  };
}

export function createConditionMatcher(partial?: Partial<ConditionMatcher>): ConditionMatcher {
  return {
    type: ConditionType.TAB_AGE,
    operator: ConditionOperator.GREATER_THAN,
    value: 0,
    timeUnit: TimeUnit.HOURS,
    ...partial,
  };
}

export function createActionMatcher(partial?: Partial<ActionMatcher>): ActionMatcher {
  return {
    type: ActionType.CLOSE,
    ...partial,
  };
}

export function createActionParams(partial?: Partial<ActionParams>): ActionParams {
  return {
    ...partial,
  };
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

