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
  const [isHovered, setIsHovered] = useState(false);
  const showIcon = entry.iconUrl !== undefined && !iconError;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View details for ${entry.name}`}
      className="group relative w-full h-80 text-left rounded-2xl border border-border-subtle bg-bg-surface p-6 transition-all duration-300 ease-out hover:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base overflow-hidden"
      style={{
        transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: isHovered 
          ? '0 0 0 1px rgba(124,106,247,0.5), 0 20px 40px rgba(124,106,247,0.15), 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
          : '0 2px 8px rgba(0,0,0,0.1)',
        background: isHovered 
          ? 'linear-gradient(135deg, rgba(124,106,247,0.08) 0%, rgba(26,29,39,0.95) 50%, rgba(34,38,58,0.98) 100%)'
          : '#1a1d27',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Spotlight effect overlay */}
      <div 
        className="absolute inset-0 opacity-0 transition-opacity duration-500 ease-out pointer-events-none"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `
            radial-gradient(
              600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
              rgba(124,106,247,0.15) 0%,
              rgba(124,106,247,0.08) 25%,
              rgba(124,106,247,0.02) 50%,
              transparent 70%
            )
          `,
        }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
          e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
        }}
      />

      {/* Content container with flex layout for equal heights */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Top row: icon + badge */}
        <div className="mb-4 flex items-start justify-between gap-3 flex-shrink-0">
          {showIcon ? (
            <img
              src={entry.iconUrl}
              alt=""
              loading="lazy"
              onError={() => setIconError(true)}
              className="h-11 w-11 shrink-0 rounded-xl object-cover border border-border-subtle transition-transform duration-200 group-hover:scale-110"
            />
          ) : (
            <div className="transition-transform duration-200 group-hover:scale-110">
              {ICON_PLACEHOLDER}
            </div>
          )}
          <Badge label={CATEGORY_LABELS[entry.category]} variant={entry.category} />
        </div>

        {/* Name */}
        <h3
          className="mb-3 text-base font-semibold text-text-primary transition-all duration-300 group-hover:text-white flex-shrink-0"
          style={{ 
            letterSpacing: '-0.01em',
            textShadow: isHovered ? '0 0 20px rgba(124,106,247,0.3)' : 'none'
          }}
        >
          {entry.name}
        </h3>

        {/* Description - flexible height */}
        <p className="mb-5 text-sm leading-relaxed text-text-secondary line-clamp-4 flex-grow transition-colors duration-300 group-hover:text-text-primary">
          {entry.shortDescription}
        </p>

        {/* Tags - fixed at bottom */}
        <div className="flex-shrink-0">
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entry.tags.slice(0, 4).map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
              {entry.tags.length > 4 && (
                <span className="text-xs text-text-muted px-2 py-1 rounded-md bg-bg-elevated">
                  +{entry.tags.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Arrow — appears on hover with enhanced animation */}
      <div 
        className="absolute bottom-5 right-5 transition-all duration-300 text-text-muted group-hover:text-accent-primary"
        style={{
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translate(0, 0) rotate(0deg)' : 'translate(4px, 4px) rotate(-45deg)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M7 17L17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Subtle border glow */}
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: 'linear-gradient(135deg, rgba(124,106,247,0.2) 0%, transparent 50%, rgba(124,106,247,0.1) 100%)',
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
