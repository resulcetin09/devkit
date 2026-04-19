import type { Entry } from '../types/entry';
import { EntryCard } from './EntryCard';

export interface EntryGridProps {
  entries: Entry[];
  searchQuery: string;
  onEntryClick: (entry: Entry) => void;
}

const EMPTY_STATE = (
  <div className="flex flex-col items-center justify-center py-32 text-center">
    <p
      className="text-6xl text-border-default select-none"
      style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
      aria-hidden="true"
    >
      Empty.
    </p>
    <p className="mt-4 text-sm text-text-muted">No entries yet — be the first to submit one.</p>
  </div>
);

export function EntryGrid({ entries, searchQuery, onEntryClick }: EntryGridProps) {
  if (entries.length === 0) {
    if (searchQuery.trim() !== '') {
      return (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p
            className="text-5xl text-border-default select-none"
            style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
            aria-hidden="true"
          >
            Nothing.
          </p>
          <p className="mt-4 text-sm text-text-secondary">
            No results for{' '}
            <span className="text-text-primary">"{searchQuery}"</span>
          </p>
          <p className="mt-1 text-xs text-text-muted">Try a different keyword or clear your filters.</p>
        </div>
      );
    }
    return EMPTY_STATE;
  }

  return (
    <div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      role="list"
      aria-label="Directory entries"
    >
      {entries.map((entry, i) => (
        <div
          key={entry.id}
          role="listitem"
          className="card-animate"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <EntryCard entry={entry} onClick={() => onEntryClick(entry)} />
        </div>
      ))}
    </div>
  );
}
