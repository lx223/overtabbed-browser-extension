export function fuzzyMatch(query: string, text: string): boolean {
  if (!query) return true;
  if (!text) return false;

  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  let queryIndex = 0;
  let textIndex = 0;

  while (queryIndex < queryLower.length && textIndex < textLower.length) {
    if (queryLower[queryIndex] === textLower[textIndex]) {
      queryIndex++;
    }
    textIndex++;
  }

  return queryIndex === queryLower.length;
}

export function getMatchIndices(query: string, text: string): number[] {
  if (!query || !text) return [];

  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  const indices: number[] = [];

  let queryIndex = 0;
  let textIndex = 0;

  while (queryIndex < queryLower.length && textIndex < textLower.length) {
    if (queryLower[queryIndex] === textLower[textIndex]) {
      indices.push(textIndex);
      queryIndex++;
    }
    textIndex++;
  }

  return queryIndex === queryLower.length ? indices : [];
}

export function fuzzySearch(query: string, items: string[]): string[] {
  if (!query) return items;

  return items.filter((item) => fuzzyMatch(query, item));
}

