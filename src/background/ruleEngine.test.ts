import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    SubjectType,
    SubjectMatchField,
    SubjectMatchOperator,
    ConditionType,
    ConditionOperator,
    TimeUnit,
    JoinOperator,
    createSubject,
    createSubjectMatcher,
    createCondition,
    createConditionMatcher,
} from '@/utils/rule';

interface TabWithMeta extends chrome.tabs.Tab {
    lastAccessed?: number;
}

function getFieldValue(tab: TabWithMeta, field: SubjectMatchField): string {
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

function matchValue(value: string, operator: SubjectMatchOperator, pattern: string): boolean {
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

function getMatchingSubjects(subject: ReturnType<typeof createSubject>, tabs: TabWithMeta[]): TabWithMeta[] {
    if (subject.type !== SubjectType.TABS) return [];
    if (subject.matchers.length === 0) return tabs;

    const joinOp = subject.joinOperator || JoinOperator.AND;

    return tabs.filter((tab) => {
        const results = subject.matchers.map((matcher) => {
            const fieldValue = getFieldValue(tab, matcher.field);
            return matchValue(fieldValue, matcher.operator, matcher.value);
        });

        return joinOp === JoinOperator.AND
            ? results.every(Boolean)
            : results.some(Boolean);
    });
}

function compareValue(actual: number, operator: ConditionOperator, expected: number): boolean {
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

function isDuplicateTab(tab: TabWithMeta, allTabs: TabWithMeta[]): boolean {
    if (!tab.url) return false;
    return allTabs.filter((t) => t.url === tab.url).length > 1;
}

describe('Rule Engine - Subject Matching', () => {
    const createMockTab = (overrides: Partial<TabWithMeta> = {}): TabWithMeta => ({
        id: 1,
        windowId: 1,
        index: 0,
        pinned: false,
        highlighted: false,
        incognito: false,
        selected: false,
        active: false,
        autoDiscardable: true,
        ...overrides,
    });

    describe('getFieldValue', () => {
        it('extracts URL field', () => {
            const tab = createMockTab({ url: 'https://github.com/test' });
            expect(getFieldValue(tab, SubjectMatchField.URL)).toBe('https://github.com/test');
        });

        it('extracts Title field', () => {
            const tab = createMockTab({ title: 'My Page Title' });
            expect(getFieldValue(tab, SubjectMatchField.TITLE)).toBe('My Page Title');
        });

        it('extracts Domain field', () => {
            const tab = createMockTab({ url: 'https://github.com/test/path' });
            expect(getFieldValue(tab, SubjectMatchField.DOMAIN)).toBe('github.com');
        });

        it('handles invalid URL for domain', () => {
            const tab = createMockTab({ url: 'not-a-url' });
            expect(getFieldValue(tab, SubjectMatchField.DOMAIN)).toBe('');
        });

        it('handles empty URL', () => {
            const tab = createMockTab({ url: '' });
            expect(getFieldValue(tab, SubjectMatchField.URL)).toBe('');
            expect(getFieldValue(tab, SubjectMatchField.DOMAIN)).toBe('');
        });
    });

    describe('matchValue', () => {
        it('matches CONTAINS operator', () => {
            expect(matchValue('hello world', SubjectMatchOperator.CONTAINS, 'world')).toBe(true);
            expect(matchValue('hello world', SubjectMatchOperator.CONTAINS, 'foo')).toBe(false);
            expect(matchValue('Hello World', SubjectMatchOperator.CONTAINS, 'WORLD')).toBe(true);
        });

        it('matches EQUALS operator', () => {
            expect(matchValue('hello', SubjectMatchOperator.EQUALS, 'hello')).toBe(true);
            expect(matchValue('hello', SubjectMatchOperator.EQUALS, 'HELLO')).toBe(true);
            expect(matchValue('hello world', SubjectMatchOperator.EQUALS, 'hello')).toBe(false);
        });

        it('matches STARTS_WITH operator', () => {
            expect(matchValue('hello world', SubjectMatchOperator.STARTS_WITH, 'hello')).toBe(true);
            expect(matchValue('hello world', SubjectMatchOperator.STARTS_WITH, 'world')).toBe(false);
        });

        it('matches ENDS_WITH operator', () => {
            expect(matchValue('hello world', SubjectMatchOperator.ENDS_WITH, 'world')).toBe(true);
            expect(matchValue('hello world', SubjectMatchOperator.ENDS_WITH, 'hello')).toBe(false);
        });

        it('matches REGEX operator', () => {
            expect(matchValue('test123', SubjectMatchOperator.REGEX, '\\d+')).toBe(true);
            expect(matchValue('https://github.com', SubjectMatchOperator.REGEX, 'github\\.com')).toBe(true);
            expect(matchValue('test', SubjectMatchOperator.REGEX, '^test$')).toBe(true);
        });

        it('handles invalid regex gracefully', () => {
            expect(matchValue('test', SubjectMatchOperator.REGEX, '[invalid')).toBe(false);
        });
    });

    describe('getMatchingSubjects', () => {
        const tabs: TabWithMeta[] = [
            createMockTab({ id: 1, url: 'https://github.com', title: 'GitHub' }),
            createMockTab({ id: 2, url: 'https://google.com', title: 'Google' }),
            createMockTab({ id: 3, url: 'https://github.com/test', title: 'GitHub - Test Repo' }),
        ];

        it('returns all tabs for empty matchers', () => {
            const subject = createSubject({ type: SubjectType.TABS, matchers: [] });
            expect(getMatchingSubjects(subject, tabs)).toHaveLength(3);
        });

        it('filters by URL contains', () => {
            const subject = createSubject({
                type: SubjectType.TABS,
                matchers: [
                    createSubjectMatcher({
                        field: SubjectMatchField.URL,
                        operator: SubjectMatchOperator.CONTAINS,
                        value: 'github',
                    }),
                ],
            });
            const result = getMatchingSubjects(subject, tabs);
            expect(result).toHaveLength(2);
            expect(result.map((t) => t.id)).toEqual([1, 3]);
        });

        it('filters by domain equals', () => {
            const subject = createSubject({
                type: SubjectType.TABS,
                matchers: [
                    createSubjectMatcher({
                        field: SubjectMatchField.DOMAIN,
                        operator: SubjectMatchOperator.EQUALS,
                        value: 'google.com',
                    }),
                ],
            });
            const result = getMatchingSubjects(subject, tabs);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(2);
        });

        it('combines matchers with AND', () => {
            const subject = createSubject({
                type: SubjectType.TABS,
                matchers: [
                    createSubjectMatcher({
                        field: SubjectMatchField.URL,
                        operator: SubjectMatchOperator.CONTAINS,
                        value: 'github',
                    }),
                    createSubjectMatcher({
                        field: SubjectMatchField.TITLE,
                        operator: SubjectMatchOperator.CONTAINS,
                        value: 'Repo',
                    }),
                ],
                joinOperator: JoinOperator.AND,
            });
            const result = getMatchingSubjects(subject, tabs);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(3);
        });

        it('combines matchers with OR', () => {
            const subject = createSubject({
                type: SubjectType.TABS,
                matchers: [
                    createSubjectMatcher({
                        field: SubjectMatchField.DOMAIN,
                        operator: SubjectMatchOperator.EQUALS,
                        value: 'google.com',
                    }),
                    createSubjectMatcher({
                        field: SubjectMatchField.TITLE,
                        operator: SubjectMatchOperator.CONTAINS,
                        value: 'Repo',
                    }),
                ],
                joinOperator: JoinOperator.OR,
            });
            const result = getMatchingSubjects(subject, tabs);
            expect(result).toHaveLength(2);
            expect(result.map((t) => t.id)).toEqual([2, 3]);
        });
    });
});

describe('Rule Engine - Condition Checking', () => {
    describe('compareValue', () => {
        it('compares GREATER_THAN', () => {
            expect(compareValue(10, ConditionOperator.GREATER_THAN, 5)).toBe(true);
            expect(compareValue(5, ConditionOperator.GREATER_THAN, 10)).toBe(false);
            expect(compareValue(5, ConditionOperator.GREATER_THAN, 5)).toBe(false);
        });

        it('compares LESS_THAN', () => {
            expect(compareValue(5, ConditionOperator.LESS_THAN, 10)).toBe(true);
            expect(compareValue(10, ConditionOperator.LESS_THAN, 5)).toBe(false);
            expect(compareValue(5, ConditionOperator.LESS_THAN, 5)).toBe(false);
        });

        it('compares EQUALS', () => {
            expect(compareValue(5, ConditionOperator.EQUALS, 5)).toBe(true);
            expect(compareValue(5, ConditionOperator.EQUALS, 10)).toBe(false);
        });

        it('compares GREATER_THAN_OR_EQUALS', () => {
            expect(compareValue(10, ConditionOperator.GREATER_THAN_OR_EQUALS, 5)).toBe(true);
            expect(compareValue(5, ConditionOperator.GREATER_THAN_OR_EQUALS, 5)).toBe(true);
            expect(compareValue(4, ConditionOperator.GREATER_THAN_OR_EQUALS, 5)).toBe(false);
        });

        it('compares LESS_THAN_OR_EQUALS', () => {
            expect(compareValue(5, ConditionOperator.LESS_THAN_OR_EQUALS, 10)).toBe(true);
            expect(compareValue(5, ConditionOperator.LESS_THAN_OR_EQUALS, 5)).toBe(true);
            expect(compareValue(6, ConditionOperator.LESS_THAN_OR_EQUALS, 5)).toBe(false);
        });
    });

    describe('isDuplicateTab', () => {
        const createMockTab = (overrides: Partial<TabWithMeta> = {}): TabWithMeta => ({
            id: 1,
            windowId: 1,
            index: 0,
            pinned: false,
            highlighted: false,
            incognito: false,
            selected: false,
            active: false,
            autoDiscardable: true,
            ...overrides,
        });

        it('returns false for tab without URL', () => {
            const tab = createMockTab({ url: undefined });
            const allTabs = [tab, createMockTab({ id: 2, url: 'https://test.com' })];
            expect(isDuplicateTab(tab, allTabs)).toBe(false);
        });

        it('returns true for duplicate URL', () => {
            const tab1 = createMockTab({ id: 1, url: 'https://github.com' });
            const tab2 = createMockTab({ id: 2, url: 'https://github.com' });
            const tab3 = createMockTab({ id: 3, url: 'https://google.com' });
            const allTabs = [tab1, tab2, tab3];

            expect(isDuplicateTab(tab1, allTabs)).toBe(true);
            expect(isDuplicateTab(tab2, allTabs)).toBe(true);
            expect(isDuplicateTab(tab3, allTabs)).toBe(false);
        });

        it('returns false for unique URLs', () => {
            const tab1 = createMockTab({ id: 1, url: 'https://github.com' });
            const tab2 = createMockTab({ id: 2, url: 'https://google.com' });
            const allTabs = [tab1, tab2];

            expect(isDuplicateTab(tab1, allTabs)).toBe(false);
            expect(isDuplicateTab(tab2, allTabs)).toBe(false);
        });
    });
});

