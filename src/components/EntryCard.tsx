import { useState } from 'react';
import type { Entry } from '../types/entry';
import { Badge } from './ui/Badge';
import { Tag } from './ui/Tag';

const CATEGORY_LABELS: Record<Entry['category'], string> = {
  skill: 'Skill',
  'mcp-server': 'MCP Server',
};

export interface EntryCardProps {
  entry: Entry;
  onClick?: () => void;
}

export function EntryCard({ entry, onClick }: EntryCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View details for ${entry.name}`}
      className="group relative w-full text-left rounded-xl border border-border-subtle bg-bg-surface transition-all duration-300 ease-out hover:border-accent-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base overflow-hidden"
      style={{
        height: '180px', // Fixed compact height
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered 
          ? '0 8px 32px rgba(124,106,247,0.12), 0 2px 8px rgba(0,0,0,0.2)'
          : '0 1px 3px rgba(0,0,0,0.1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle gradient overlay on hover */}
      <div 
        className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
        style={{
          opacity: isHovered ? 1 : 0,
          background: 'linear-gradient(135deg, rgba(124,106,247,0.03) 0%, transparent 50%)',
        }}
      />

      {/* Content container with precise flex layout */}
      <div className="relative z-10 h-full p-5 flex flex-col">
        {/* Header: Title and Badge */}
        <div className="flex items-start justify-between gap-3 mb-3 flex-shrink-0">
          <h3
            className="text-base font-semibold text-text-primary transition-colors duration-200 group-hover:text-white leading-tight"
            style={{ 
              letterSpacing: '-0.015em',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: '600'
            }}
          >
            {entry.name}
          </h3>
          <Badge label={CATEGORY_LABELS[entry.category]} variant={entry.category} />
        </div>

        {/* Description - exactly 2 lines */}
        <p 
          className="text-sm leading-relaxed text-text-secondary line-clamp-2 mb-3 flex-shrink-0"
          style={{ 
            lineHeight: '1.5',
            minHeight: '2.25rem', // Ensures consistent space for 2 lines
          }}
        >
          {entry.shortDescription}
        </p>

        {/* Tags - immediately below description, fills remaining space */}
        <div className="flex-grow flex items-start">
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entry.tags.slice(0, 5).map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
              {entry.tags.length > 5 && (
                <span className="text-xs text-text-muted px-2 py-1 rounded-md bg-bg-elevated/50">
                  +{entry.tags.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hover indicator - subtle arrow */}
      <div 
        className="absolute bottom-4 right-4 transition-all duration-300 text-text-muted group-hover:text-accent-primary"
        style={{
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translate(0, 0)' : 'translate(2px, 2px)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M7 17L17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Subtle border enhancement on hover */}
      <div 
        className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: 'linear-gradient(135deg, rgba(124,106,247,0.1) 0%, transparent 50%)',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'xor',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          padding: '1px',
        }}
      />
    </button>
  );
}
