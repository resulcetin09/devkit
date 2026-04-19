import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RAW_ENTRIES } from '../data/entries';
import { validateEntries } from '../data/validateEntries';
import type { CategoryFilter, Entry } from '../types/entry';
import { filterEntries } from '../utils/filterEntries';
import { EntryGrid } from '../components/EntryGrid';
import { FilterPanel } from '../components/FilterPanel';
import { Hero } from '../components/Hero';
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
  const directoryRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Derive filtered entries during render — rerender-derived-state-no-effect
  const visibleEntries = useMemo(
    () => filterEntries(ALL_ENTRIES, { searchQuery, selectedCategory, selectedTags }),
    [searchQuery, selectedCategory, selectedTags],
  );

  function handleScrollDown() {
    directoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleClear() {
    setSelectedCategory('all');
    setSelectedTags([]);
  }

  function handleEntryClick(entry: Entry) {
    navigate(`/entry/${entry.id}`);
  }

  return (
    <>
      <Hero onScrollDown={handleScrollDown} />

      {/* Directory section */}
      <div
        ref={directoryRef}
        className="mx-auto max-w-7xl scroll-mt-16 px-6 pb-24 pt-16"
      >
        {/* Section heading */}
        <div className="mb-12 flex items-end justify-between gap-4">
          <h2
            className="text-text-primary"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            Browse the directory
          </h2>
          <ResultCount count={visibleEntries.length} total={ALL_ENTRIES.length} />
        </div>

        {/* Search + filters stacked */}
        <div className="mb-8 space-y-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <FilterPanel
            allTags={ALL_TAGS}
            selectedCategory={selectedCategory}
            selectedTags={selectedTags}
            onCategoryChange={setSelectedCategory}
            onTagsChange={setSelectedTags}
            onClear={handleClear}
          />
        </div>

        {/* Grid */}
        <EntryGrid
          entries={visibleEntries}
          searchQuery={searchQuery}
          onEntryClick={handleEntryClick}
        />
      </div>
    </>
  );
}
