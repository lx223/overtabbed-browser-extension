import { RuleService } from '@/services/ruleService';
import {
  SubjectType,
  SubjectMatchField,
  SubjectMatchOperator,
  ConditionType,
  ConditionOperator,
  JoinOperator,
  ActionType,
  timeUnitToMs,
  type Rule,
  type Subject,
  type Condition,
  type ActionMatcher,
} from '@/utils/rule';

interface TabWithMeta extends chrome.tabs.Tab {
  lastAccessed?: number;
}

const EVALUATION_INTERVAL_MS = 60 * 1000;

class RuleEngine {
  private ruleService: RuleService;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private tabAccessTimes: Map<number, number> = new Map();

  constructor() {
    this.ruleService = new RuleService();
  }

  start(): void {
    if (this.intervalId) return;

    this.trackTabAccess();
    this.evaluateAllRules();
    this.intervalId = setInterval(() => this.evaluateAllRules(), EVALUATION_INTERVAL_MS);
    console.log('[RuleEngine] Started evaluation loop');
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[RuleEngine] Stopped evaluation loop');
    }
  }

  private trackTabAccess(): void {
    chrome.tabs.onActivated.addListener(({ tabId }) => {
      this.tabAccessTimes.set(tabId, Date.now());
    });

    chrome.tabs.onRemoved.addListener((tabId) => {
      this.tabAccessTimes.delete(tabId);
    });

    chrome.tabs.query({}, (tabs) => {
      const now = Date.now();
      tabs.forEach((tab) => {
        if (tab.id && !this.tabAccessTimes.has(tab.id)) {
          this.tabAccessTimes.set(tab.id, tab.active ? now : now - 60000);
        }
      });
    });
  }

  async evaluateAllRules(): Promise<void> {
    try {
      const rules = await this.ruleService.getAllRules();
      const enabledRules = rules.filter((r) => r.enabled);

      if (enabledRules.length === 0) return;

      const tabs = await this.getAllTabs();

      for (const rule of enabledRules) {
        await this.evaluateRule(rule, tabs);
      }
    } catch (error) {
      console.error('[RuleEngine] Error evaluating rules:', error);
    }
  }

  private async getAllTabs(): Promise<TabWithMeta[]> {
    return new Promise((resolve) => {
      chrome.tabs.query({}, (tabs) => {
        const tabsWithMeta = tabs.map((tab) => ({
          ...tab,
          lastAccessed: tab.id ? this.tabAccessTimes.get(tab.id) : undefined,
        }));
        resolve(tabsWithMeta);
      });
    });
  }

  private async evaluateRule(rule: Rule, allTabs: TabWithMeta[]): Promise<void> {
    if (!rule.subject || !rule.condition || !rule.action) return;

    const matchingTabs = this.getMatchingSubjects(rule.subject, allTabs);
    if (matchingTabs.length === 0) return;

    const tabsMeetingCondition = matchingTabs.filter((tab) =>
      this.checkCondition(rule.condition!, tab, allTabs)
    );

    if (tabsMeetingCondition.length === 0) return;

    console.log(
      `[RuleEngine] Rule "${rule.name}" matched ${tabsMeetingCondition.length} tabs`
    );

    await this.executeActions(rule.action.matchers, tabsMeetingCondition);
  }

  private getMatchingSubjects(subject: Subject, tabs: TabWithMeta[]): TabWithMeta[] {
    if (subject.type !== SubjectType.TABS) return [];
    if (subject.matchers.length === 0) return tabs;

    const joinOp = subject.joinOperator || JoinOperator.AND;

    return tabs.filter((tab) => {
      const results = subject.matchers.map((matcher) => {
        const fieldValue = this.getFieldValue(tab, matcher.field);
        return this.matchValue(fieldValue, matcher.operator, matcher.value);
      });

      return joinOp === JoinOperator.AND
        ? results.every(Boolean)
        : results.some(Boolean);
    });
  }

  private getFieldValue(tab: TabWithMeta, field: SubjectMatchField): string {
    switch (field) {
      case SubjectMatchField.URL:
        return tab.url || '';
      case SubjectMatchField.TITLE:
        return tab.title || '';
      case SubjectMatchField.DOMAIN:
        try {
          return new URL(tab.url || '').hostname;
        } catch {
          return '';
        }
      default:
        return '';
    }
  }

  private matchValue(value: string, operator: SubjectMatchOperator, pattern: string): boolean {
    const lowerValue = value.toLowerCase();
    const lowerPattern = pattern.toLowerCase();

    switch (operator) {
      case SubjectMatchOperator.CONTAINS:
        return lowerValue.includes(lowerPattern);
      case SubjectMatchOperator.EQUALS:
        return lowerValue === lowerPattern;
      case SubjectMatchOperator.STARTS_WITH:
        return lowerValue.startsWith(lowerPattern);
      case SubjectMatchOperator.ENDS_WITH:
        return lowerValue.endsWith(lowerPattern);
      case SubjectMatchOperator.REGEX:
        try {
          return new RegExp(pattern, 'i').test(value);
        } catch {
          return false;
        }
      default:
        return false;
    }
  }

  private checkCondition(condition: Condition, tab: TabWithMeta, allTabs: TabWithMeta[]): boolean {
    if (condition.matchers.length === 0) return true;

    const joinOp = condition.joinOperator || JoinOperator.AND;
    const results = condition.matchers.map((matcher) => {
      switch (matcher.type) {
        case ConditionType.TAB_AGE:
          return this.checkTabAge(tab, matcher.operator, matcher.value, matcher.timeUnit);
        case ConditionType.TAB_INACTIVE_DURATION:
          return this.checkInactiveDuration(tab, matcher.operator, matcher.value, matcher.timeUnit);
        case ConditionType.TAB_COUNT_EXCEEDS:
          return this.compareValue(allTabs.length, matcher.operator, matcher.value);
        case ConditionType.TAB_DUPLICATE:
          return this.isDuplicateTab(tab, allTabs);
        default:
          return false;
      }
    });

    return joinOp === JoinOperator.AND
      ? results.every(Boolean)
      : results.some(Boolean);
  }

  private checkTabAge(
    tab: TabWithMeta,
    operator: ConditionOperator,
    value: number,
    timeUnit: number
  ): boolean {
    const now = Date.now();
    const lastAccessed = tab.lastAccessed || now;
    const ageMs = now - lastAccessed;
    const thresholdMs = timeUnitToMs(value, timeUnit);
    return this.compareValue(ageMs, operator, thresholdMs);
  }

  private checkInactiveDuration(
    tab: TabWithMeta,
    operator: ConditionOperator,
    value: number,
    timeUnit: number
  ): boolean {
    if (tab.active) return false;
    return this.checkTabAge(tab, operator, value, timeUnit);
  }

  private isDuplicateTab(tab: TabWithMeta, allTabs: TabWithMeta[]): boolean {
    if (!tab.url) return false;
    return allTabs.filter((t) => t.url === tab.url).length > 1;
  }

  private compareValue(actual: number, operator: ConditionOperator, expected: number): boolean {
    switch (operator) {
      case ConditionOperator.GREATER_THAN:
        return actual > expected;
      case ConditionOperator.LESS_THAN:
        return actual < expected;
      case ConditionOperator.EQUALS:
        return actual === expected;
      case ConditionOperator.GREATER_THAN_OR_EQUALS:
        return actual >= expected;
      case ConditionOperator.LESS_THAN_OR_EQUALS:
        return actual <= expected;
      default:
        return false;
    }
  }

  private async executeActions(matchers: ActionMatcher[], tabs: TabWithMeta[]): Promise<void> {
    for (const matcher of matchers) {
      for (const tab of tabs) {
        if (!tab.id) continue;

        try {
          await this.executeAction(matcher, tab);
        } catch (error) {
          console.error(`[RuleEngine] Error executing action on tab ${tab.id}:`, error);
        }
      }
    }
  }

  private async executeAction(matcher: ActionMatcher, tab: TabWithMeta): Promise<void> {
    if (!tab.id) return;

    switch (matcher.type) {
      case ActionType.CLOSE:
        await chrome.tabs.remove(tab.id);
        break;

      case ActionType.MOVE_TO_GROUP:
        await this.moveToGroup(tab, matcher.params?.groupName, matcher.params?.groupColor);
        break;

      case ActionType.PIN:
        await chrome.tabs.update(tab.id, { pinned: true });
        break;

      case ActionType.UNPIN:
        await chrome.tabs.update(tab.id, { pinned: false });
        break;

      case ActionType.DISCARD:
        if (!tab.active) {
          await chrome.tabs.discard(tab.id);
        }
        break;

      case ActionType.MUTE:
        await chrome.tabs.update(tab.id, { muted: true });
        break;

      case ActionType.HIGHLIGHT:
        await chrome.tabs.update(tab.id, { highlighted: true });
        break;
    }
  }

  private async moveToGroup(
    tab: TabWithMeta,
    groupName?: string,
    groupColor?: string
  ): Promise<void> {
    if (!tab.id || !tab.windowId) return;

    const groups = await chrome.tabGroups.query({ windowId: tab.windowId });
    const existingGroup = groups.find((g) => g.title === groupName);

    if (existingGroup) {
      await chrome.tabs.group({ tabIds: [tab.id], groupId: existingGroup.id });
    } else {
      const groupId = await chrome.tabs.group({ tabIds: [tab.id] });
      const updateProps: chrome.tabGroups.UpdateProperties = {};
      if (groupName) updateProps.title = groupName;
      if (groupColor) updateProps.color = groupColor as chrome.tabGroups.Color;
      await chrome.tabGroups.update(groupId, updateProps);
    }
  }

  async runManually(): Promise<void> {
    console.log('[RuleEngine] Running manual evaluation');
    await this.evaluateAllRules();
  }
}

export const ruleEngine = new RuleEngine();

