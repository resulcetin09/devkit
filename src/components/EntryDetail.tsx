import { useState } from 'react';
import type { Entry } from '../types/entry';
import { Badge } from './ui/Badge';
import { CodeBlock } from './ui/CodeBlock';
import { Tag } from './ui/Tag';
import { InstallButton } from './InstallButton';
import { InstallModal } from './InstallModal';

const CATEGORY_LABELS: Record<Entry['category'], string> = {
  skill: 'Skill',
  'mcp-server': 'MCP Server',
};

export interface EntryDetailProps {
  entry: Entry;
}

export function EntryDetail({ entry }: EntryDetailProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const shouldShowInstallButton = entry.category === 'mcp-server' && entry.installConfig !== undefined;

  return (
    <>
      <article className="mx-auto max-w-6xl">
        {/* Hero Section */}
        <div 
          className="relative mb-12 rounded-2xl border border-border-subtle overflow-hidden detail-fade-in detail-fade-in-1"
          style={{
            background: 'linear-gradient(135deg, rgba(124,106,247,0.08) 0%, rgba(79,163,224,0.05) 100%)',
          }}
        >
          {/* Noise texture overlay */}
          <div className="absolute inset-0 noise-texture" aria-hidden="true" />
          
          {/* Content */}
          <div className="relative z-10 p-8 md:p-12">
            {/* Badge - top right on mobile, inline on desktop */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <h1 
                  className="text-text-primary mb-2"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(2rem, 4vw, 3rem)',
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {entry.name}
                </h1>
                {/* Decorative gradient underline */}
                <div 
                  className="h-0.5 w-24 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #7c6af7, #4fa3e0)',
                    animation: 'line-grow 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both',
                    transformOrigin: 'left center',
                  }}
                  aria-hidden="true"
                />
              </div>
              <div className="flex-shrink-0">
                <Badge label={CATEGORY_LABELS[entry.category]} variant={entry.category} />
              </div>
            </div>

            {/* Author */}
            {entry.author !== undefined && (
              <p className="text-sm text-text-muted mb-4">
                by <span className="text-text-secondary font-medium">{entry.author}</span>
              </p>
            )}

            {/* Short description */}
            <p className="text-lg text-text-secondary leading-relaxed max-w-3xl">
              {entry.shortDescription}
            </p>
          </div>
        </div>

        {/* Two-column layout on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Full description */}
            <section className="detail-fade-in detail-fade-in-2" aria-label="Description">
              <h2 
                className="text-text-primary mb-4"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  letterSpacing: '-0.01em',
                }}
              >
                About
              </h2>
              <div className="prose-custom space-y-3">
                {entry.fullDescription.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-text-secondary leading-relaxed text-base">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>

            {/* Tags */}
            {entry.tags.length > 0 && (
              <section className="detail-fade-in detail-fade-in-2" aria-label="Tags">
                <h2 
                  className="text-text-primary mb-4"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <Tag key={tag} label={tag} />
                  ))}
                </div>
              </section>
            )}

            {/* Usage snippet */}
            {entry.usageSnippet !== undefined && entry.usageSnippet.trim() !== '' && (
              <section className="detail-fade-in detail-fade-in-3" aria-label="Usage">
                <h2 
                  className="text-text-primary mb-4"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Usage
                </h2>
                <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden shadow-lg">
                  <CodeBlock code={entry.usageSnippet} language="text" />
                </div>
              </section>
            )}
          </div>

          {/* Sidebar - 1 column */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Metadata card */}
              <div 
                className="rounded-xl border border-border-subtle bg-bg-surface p-6 detail-fade-in detail-fade-in-2"
                style={{
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                }}
              >
                <h3 
                  className="text-text-primary mb-4 text-sm font-semibold uppercase tracking-widest"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Quick Info
                </h3>
                
                <div className="space-y-4">
                  {/* Category */}
                  <div>
                    <p className="text-xs text-text-muted mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
                      Category
                    </p>
                    <p className="text-sm text-text-primary font-medium">
                      {CATEGORY_LABELS[entry.category]}
                    </p>
                  </div>

                  {/* Tag count */}
                  {entry.tags.length > 0 && (
                    <div>
                      <p className="text-xs text-text-muted mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
                        Tags
                      </p>
                      <p className="text-sm text-text-primary font-medium">
                        {entry.tags.length} {entry.tags.length === 1 ? 'tag' : 'tags'}
                      </p>
                    </div>
                  )}

                  {/* Author */}
                  {entry.author !== undefined && (
                    <div>
                      <p className="text-xs text-text-muted mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
                        Author
                      </p>
                      <p className="text-sm text-text-primary font-medium">
                        {entry.author}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions card */}
              <div 
                className="rounded-xl border border-border-subtle bg-bg-surface p-6 space-y-3 detail-fade-in detail-fade-in-3"
                style={{
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                }}
              >
                {shouldShowInstallButton && (
                  <InstallButton onClick={() => setIsModalOpen(true)} />
                )}
                
                <a
                  href={entry.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full rounded-lg border border-border-default bg-bg-surface px-4 py-2.5 text-sm font-medium text-text-primary transition-all duration-200 hover:bg-bg-elevated hover:border-accent-primary hover:text-accent-primary hover:shadow-lg hover:shadow-accent-primary/10"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                  View source
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    aria-hidden="true"
                  >
                    <path d="M7 17L17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </article>

      {shouldShowInstallButton && entry.installConfig && (
        <InstallModal
          installConfig={entry.installConfig}
          entryName={entry.name}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
