import type { Entry, FilterState } from '../types/entry';

export function filterEntries(entries: Entry[], state: FilterState): Entry[] {
  const { searchQuery, selectedCategory, selectedTags } = state;

  // Normalize query once — js-hoist-regexp / js-cache-property-access
  const query = searchQuery.toLowerCase();
  const hasQuery = query.length > 0;
  const hasCategory = selectedCategory !== 'all';
  const hasTags = selectedTags.length > 0;

  // Early exit: nothing to filter
  if (!hasQuery && !hasCategory && !hasTags) return entries;

  return entries.filter((entry) => {
    // --- Search (case-insensitive match on name, shortDescription, or any tag) ---
    if (hasQuery) {
      const inName = entry.name.toLowerCase().includes(query);
      const inDesc = entry.shortDescription.toLowerCase().includes(query);
      const inTags = entry.tags.some((t) => t.toLowerCase().includes(query));
      if (!inName && !inDesc && !inTags) return false;
    }

    // --- Category filter ---
    if (hasCategory && entry.category !== selectedCategory) return false;

    // --- Tag filter (AND logic: every selected tag must be present) ---
    if (hasTags && !selectedTags.every((t) => entry.tags.includes(t))) return false;

    return true;
  });
}
