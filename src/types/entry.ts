// src/types/entry.ts

export type EntryCategory = 'skill' | 'mcp-server';

export interface IDEConfig {
  configSnippet: string;  // JSON configuration as string
  filePath: string;        // Path to config file
}

export interface InstallConfig {
  cursor: IDEConfig;
  claudeDesktop: IDEConfig;
  antigravity: IDEConfig;
  kiro: IDEConfig;
}

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
  installConfig?: InstallConfig;  // Optional install configuration
}

export type CategoryFilter = 'all' | 'skill' | 'mcp-server';

export interface FilterState {
  searchQuery: string;
  selectedCategory: CategoryFilter;
  selectedTags: string[];
}
