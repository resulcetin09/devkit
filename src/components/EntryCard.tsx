import { useState } from 'react';
import type { Entry } from '../types/entry';
import { Badge } from './ui/Badge';
import { Tag } from './ui/Tag';

// Placeholder SVG rendered inline — no extra network request
const ICON_PLACEHOLDER = (
  <div
    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bg-elevated border border-border-subtle text-text-muted"
    aria-hidden="true"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M9 9h6M9 12h6M9 15h4" strokeLinecap="round" />
    </svg>
  </div>
);

const CATEGORY_LABELS: Record<Entry['category'], string> = {
  skill: 'Skill',
  'mcp-server': 'MCP Server',
};

export interface EntryCardProps {
  entry: Entry;
  onClick?: () => void;
}

export function EntryCard({ entry, onClick }: EntryCardProps) {
  const [iconError, setIconError] = useState(false);

  const showIcon = entry.iconUrl !== undefined && !iconError;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View details for ${entry.name}`}
      className="group w-full text-left rounded-xl border border-border-subtle bg-bg-surface p-5 transition-all duration-200 hover:bg-bg-elevated hover:border-border-default hover:shadow-lg hover:shadow-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
    >
      {/* Header row: icon + name + badge */}
      <div className="flex items-start gap-3">
        {showIcon ? (
          <img
            src={entry.iconUrl}
            alt=""
            loading="lazy"
            onError={() => setIconError(true)}
            className="h-10 w-10 shrink-0 rounded-lg object-cover border border-border-subtle"
          />
        ) : (
          ICON_PLACEHOLDER
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-white transition-colors duration-150">
              {entry.name}
            </h3>
            <Badge
              label={CATEGORY_LABELS[entry.category]}
              variant={entry.category}
            />
          </div>

          {/* Short description */}
          <p className="mt-1.5 text-sm text-text-secondary line-clamp-2 leading-relaxed">
            {entry.shortDescription}
          </p>
        </div>
      </div>

      {/* Tags */}
      {entry.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      )}
    </button>
  );
}
