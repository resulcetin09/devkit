import { useState } from 'react';
import type { Entry } from '../types/entry';
import { Badge } from './ui/Badge';
import { Tag } from './ui/Tag';

// Inline placeholder — no extra request, rendering-hoist-jsx
const ICON_PLACEHOLDER = (
  <div
    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bg-elevated border border-border-subtle text-text-muted"
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
      className="group relative w-full text-left rounded-2xl border border-border-subtle bg-bg-surface p-6 transition-all duration-300 hover:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
      style={{
        // Glow border via box-shadow on hover — CSS-only, no extra elements
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          '0 0 0 1px rgba(124,106,247,0.4), 0 8px 32px rgba(124,106,247,0.08), 0 2px 8px rgba(0,0,0,0.3)';
        (e.currentTarget as HTMLButtonElement).style.background = '#1a1d27';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '';
        (e.currentTarget as HTMLButtonElement).style.background = '';
      }}
    >
      {/* Top row: icon + badge */}
      <div className="mb-4 flex items-start justify-between gap-3">
        {showIcon ? (
          <img
            src={entry.iconUrl}
            alt=""
            loading="lazy"
            onError={() => setIconError(true)}
            className="h-11 w-11 shrink-0 rounded-xl object-cover border border-border-subtle"
          />
        ) : (
          ICON_PLACEHOLDER
        )}
        <Badge label={CATEGORY_LABELS[entry.category]} variant={entry.category} />
      </div>

      {/* Name */}
      <h3
        className="mb-2 text-base font-semibold text-text-primary transition-colors duration-200 group-hover:text-white"
        style={{ letterSpacing: '-0.01em' }}
      >
        {entry.name}
      </h3>

      {/* Description */}
      <p className="mb-5 text-sm leading-relaxed text-text-secondary line-clamp-3">
        {entry.shortDescription}
      </p>

      {/* Tags */}
      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      )}

      {/* Arrow — appears on hover */}
      <div className="absolute bottom-5 right-5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 text-text-muted">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M7 17L17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </button>
  );
}
