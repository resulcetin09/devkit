import type { CategoryFilter } from '../types/entry';

interface CategoryOption {
  value: CategoryFilter;
  label: string;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: 'all',        label: 'All' },
  { value: 'skill',      label: 'Skills' },
  { value: 'mcp-server', label: 'MCP Servers' },
];

export interface FilterPanelProps {
  allTags: string[];
  selectedCategory: CategoryFilter;
  selectedTags: string[];
  onCategoryChange: (cat: CategoryFilter) => void;
  onTagsChange: (tags: string[]) => void;
  onClear: () => void;
}

export function FilterPanel({
  allTags,
  selectedCategory,
  selectedTags,
  onCategoryChange,
  onTagsChange,
  onClear,
}: FilterPanelProps) {
  const hasActiveFilters = selectedCategory !== 'all' || selectedTags.length > 0;

  function toggleTag(tag: string) {
    onTagsChange(
      selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag],
    );
  }

  return (
    <div className="space-y-4">
      {/* Category tab bar */}
      <div className="flex items-center gap-1" role="group" aria-label="Filter by category">
        {CATEGORY_OPTIONS.map(({ value, label }) => {
          const active = selectedCategory === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onCategoryChange(value)}
              aria-pressed={active}
              className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
                active
                  ? 'text-text-primary'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {active && (
                <span
                  className="absolute inset-0 rounded-full border border-border-default bg-bg-surface"
                  style={{
                    boxShadow: '0 2px 8px rgba(124,106,247,0.08), inset 0 1px 0 rgba(124,106,247,0.1)',
                  }}
                  aria-hidden="true"
                />
              )}
              <span className="relative">{label}</span>
            </button>
          );
        })}

        {/* Clear button — right-aligned */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="ml-auto flex items-center gap-1 text-xs text-text-muted hover:text-accent-primary transition-colors duration-200"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
            clear
          </button>
        )}
      </div>

      {/* Tag chips — horizontally scrollable */}
      {allTags.length > 0 && (
        <div
          className="scrollbar-hide flex gap-2 overflow-x-auto pb-1"
          role="group"
          aria-label="Filter by tag"
        >
          {allTags.map((tag) => {
            const active = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                aria-pressed={active}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 ${
                  active
                    ? 'bg-accent-primary/15 border border-accent-primary/50 text-accent-primary shadow-sm'
                    : 'border border-border-subtle text-text-muted hover:border-border-default hover:text-text-secondary hover:bg-bg-elevated'
                }`}
                style={{ 
                  fontFamily: 'var(--font-mono)',
                  boxShadow: active ? '0 2px 8px rgba(124,106,247,0.15)' : undefined,
                }}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
