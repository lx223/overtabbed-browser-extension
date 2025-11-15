import { describe, it, expect } from 'vitest';
import { fuzzyMatch, getMatchIndices, fuzzySearch } from './fuzzySearch';

describe('fuzzyMatch', () => {
  it('returns true for empty query', () => {
    expect(fuzzyMatch('', 'anything')).toBe(true);
    expect(fuzzyMatch('', '')).toBe(true);
  });

  it('returns false for empty text with non-empty query', () => {
    expect(fuzzyMatch('abc', '')).toBe(false);
  });

  it('matches exact strings', () => {
    expect(fuzzyMatch('hello', 'hello')).toBe(true);
  });

  it('matches case-insensitively', () => {
    expect(fuzzyMatch('HELLO', 'hello')).toBe(true);
    expect(fuzzyMatch('hello', 'HELLO')).toBe(true);
    expect(fuzzyMatch('HeLLo', 'hElLO')).toBe(true);
  });

  it('matches subsequences', () => {
    expect(fuzzyMatch('hlo', 'hello')).toBe(true);
    expect(fuzzyMatch('hw', 'hello world')).toBe(true);
    expect(fuzzyMatch('gm', 'GitHub - main')).toBe(true);
  });

  it('matches characters in order', () => {
    expect(fuzzyMatch('abc', 'aXbYcZ')).toBe(true);
    expect(fuzzyMatch('abc', 'a_b_c_d')).toBe(true);
  });

  it('does not match out-of-order characters', () => {
    expect(fuzzyMatch('cba', 'abc')).toBe(false);
    expect(fuzzyMatch('ba', 'ab')).toBe(false);
  });

  it('handles real-world tab title examples', () => {
    expect(fuzzyMatch('gh', 'GitHub - overtabbed')).toBe(true);
    expect(fuzzyMatch('ggl', 'Google Search')).toBe(true);
    expect(fuzzyMatch('yt', 'YouTube')).toBe(true);
    expect(fuzzyMatch('doc', 'Google Docs - My Document')).toBe(true);
  });
});

describe('getMatchIndices', () => {
  it('returns empty array for empty query', () => {
    expect(getMatchIndices('', 'anything')).toEqual([]);
  });

  it('returns empty array for empty text', () => {
    expect(getMatchIndices('abc', '')).toEqual([]);
  });

  it('returns indices for exact match', () => {
    expect(getMatchIndices('abc', 'abc')).toEqual([0, 1, 2]);
  });

  it('returns indices for subsequence match', () => {
    expect(getMatchIndices('hlo', 'hello')).toEqual([0, 2, 4]);
  });

  it('returns empty array when no match', () => {
    expect(getMatchIndices('xyz', 'hello')).toEqual([]);
    expect(getMatchIndices('abc', 'ab')).toEqual([]);
  });

  it('handles case-insensitive matching', () => {
    expect(getMatchIndices('HLO', 'hello')).toEqual([0, 2, 4]);
  });
});

describe('fuzzySearch', () => {
  const items = [
    'GitHub - overtabbed',
    'Google Search',
    'YouTube',
    'Google Docs',
    'Stack Overflow',
  ];

  it('returns all items for empty query', () => {
    expect(fuzzySearch('', items)).toEqual(items);
  });

  it('filters items by fuzzy match', () => {
    const result = fuzzySearch('goo', items);
    expect(result).toContain('Google Search');
    expect(result).toContain('Google Docs');
  });

  it('matches case-insensitively', () => {
    const result = fuzzySearch('GOO', items);
    expect(result).toContain('Google Search');
    expect(result).toContain('Google Docs');
  });

  it('returns empty array when nothing matches', () => {
    expect(fuzzySearch('xyz', items)).toEqual([]);
  });

  it('filters correctly based on subsequence', () => {
    expect(fuzzySearch('yt', items)).toContain('YouTube');
    expect(fuzzySearch('gh', items)).toContain('GitHub - overtabbed');
  });
});



