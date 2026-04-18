import type { CategoryFilter } from '../types/entry';

interface CategoryOption {
  value: CategoryFilter;
  label: string;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: 'all', label: 'All' },
  { value: 'skill', label: 'Skills' },
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
    <div className="space-y-5">
      {/* Category filter */}
      <fieldset>
        <legend className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-text-muted">
          Category
        </legend>
        <div className="flex gap-1.5" role="group" aria-label="Filter by category">
          {CATEGORY_OPTIONS.map(({ value, label }) => {
            const active = selectedCategory === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onCategoryChange(value)}
                aria-pressed={active}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                  active
                    ? 'bg-accent-primary text-white shadow-sm shadow-accent-primary/30'
                    : 'bg-bg-surface border border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <fieldset>
          <legend className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-text-muted">
            Tags
          </legend>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by tag">
            {allTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  aria-pressed={active}
                  className={`rounded-md px-2.5 py-1 text-xs font-mono transition-all duration-150 ${
                    active
                      ? 'bg-accent-primary/15 border border-accent-primary/40 text-accent-primary'
                      : 'bg-bg-surface border border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors duration-150"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
          Clear filters
        </button>
      )}
    </div>
  );
}
