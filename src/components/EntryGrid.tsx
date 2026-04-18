import type { Entry } from '../types/entry';
import { EntryCard } from './EntryCard';

export interface EntryGridProps {
  entries: Entry[];
  searchQuery: string;
  onEntryClick: (entry: Entry) => void;
}

// Static empty-state JSX hoisted outside component — rendering-hoist-jsx
const EMPTY_STATE = (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-surface border border-border-subtle text-text-muted">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
        <path d="M12 12h.01" strokeLinecap="round" strokeWidth="2" />
      </svg>
    </div>
    <p className="text-base font-medium text-text-secondary">No entries yet</p>
    <p className="mt-1 text-sm text-text-muted">Check back soon or submit the first one.</p>
  </div>
);

export function EntryGrid({ entries, searchQuery, onEntryClick }: EntryGridProps) {
  if (entries.length === 0) {
    if (searchQuery.trim() !== '') {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-surface border border-border-subtle text-text-muted">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-base font-medium text-text-secondary">
            No results for{' '}
            <span className="text-text-primary">"{searchQuery}"</span>
          </p>
          <p className="mt-1 text-sm text-text-muted">Try a different keyword or clear your filters.</p>
        </div>
      );
    }

    return EMPTY_STATE;
  }

  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="list"
      aria-label="Directory entries"
    >
      {entries.map((entry) => (
        <div key={entry.id} role="listitem">
          <EntryCard entry={entry} onClick={() => onEntryClick(entry)} />
        </div>
      ))}
    </div>
  );
}
