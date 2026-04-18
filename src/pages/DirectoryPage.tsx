import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RAW_ENTRIES } from '../data/entries';
import { validateEntries } from '../data/validateEntries';
import type { CategoryFilter, Entry } from '../types/entry';
import { filterEntries } from '../utils/filterEntries';
import { EntryGrid } from '../components/EntryGrid';
import { FilterPanel } from '../components/FilterPanel';
import { ResultCount } from '../components/ResultCount';
import { SearchBar } from '../components/SearchBar';

// Validate once at module level — advanced-init-once
const ALL_ENTRIES: Entry[] = validateEntries(RAW_ENTRIES);

// Derive sorted unique tags once — js-cache-function-results
const ALL_TAGS: string[] = Array.from(
  new Set(ALL_ENTRIES.flatMap((e) => e.tags)),
).sort();

export function DirectoryPage() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Derive filtered entries during render — rerender-derived-state-no-effect
  const visibleEntries = useMemo(
    () => filterEntries(ALL_ENTRIES, { searchQuery, selectedCategory, selectedTags }),
    [searchQuery, selectedCategory, selectedTags],
  );

  function handleClear() {
    setSelectedCategory('all');
    setSelectedTags([]);
  }

  function handleEntryClick(entry: Entry) {
    navigate(`/entry/${entry.id}`);
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Directory
        </h1>
        <p className="text-sm text-text-secondary">
          Browse Claude skills and MCP servers
        </p>
      </div>

      {/* Search */}
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      {/* Filters + results */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar filters */}
        <aside className="w-full shrink-0 lg:w-56">
          <FilterPanel
            allTags={ALL_TAGS}
            selectedCategory={selectedCategory}
            selectedTags={selectedTags}
            onCategoryChange={setSelectedCategory}
            onTagsChange={setSelectedTags}
            onClear={handleClear}
          />
        </aside>

        {/* Grid */}
        <div className="min-w-0 flex-1 space-y-4">
          <ResultCount count={visibleEntries.length} total={ALL_ENTRIES.length} />
          <EntryGrid
            entries={visibleEntries}
            searchQuery={searchQuery}
            onEntryClick={handleEntryClick}
          />
        </div>
      </div>
    </div>
  );
}
