import { Link, useParams } from 'react-router-dom';
import { RAW_ENTRIES } from '../data/entries';
import { validateEntries } from '../data/validateEntries';
import type { Entry } from '../types/entry';
import { EntryDetail } from '../components/EntryDetail';
import { NotFoundPage } from './NotFoundPage';

// Validate once at module level — advanced-init-once
const ALL_ENTRIES: Entry[] = validateEntries(RAW_ENTRIES);

// Build id → entry map for O(1) lookup — js-index-maps
const ENTRY_MAP = new Map(ALL_ENTRIES.map((e) => [e.id, e]));

export function EntryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const entry = id !== undefined ? ENTRY_MAP.get(id) : undefined;

  if (entry === undefined) {
    return <NotFoundPage />;
  }

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <nav aria-label="Breadcrumb">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors duration-150"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Directory
        </Link>
      </nav>

      <EntryDetail entry={entry} />
    </div>
  );
}
