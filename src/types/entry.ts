// src/types/entry.ts

export type EntryCategory = 'skill' | 'mcp-server';

export interface Entry {
  // Required fields
  id: string;               // unique slug, e.g. "my-skill"
  name: string;
  shortDescription: string;
  fullDescription: string;
  category: EntryCategory;
  tags: string[];
  sourceUrl: string;        // valid URL

  // Optional fields
  author?: string;
  usageSnippet?: string;
  iconUrl?: string;         // valid URL, lazy-loaded
}

export type CategoryFilter = 'all' | 'skill' | 'mcp-server';

export interface FilterState {
  searchQuery: string;
  selectedCategory: CategoryFilter;
  selectedTags: string[];
}
