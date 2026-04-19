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
    <article className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge label={CATEGORY_LABELS[entry.category]} variant={entry.category} />
          {entry.author !== undefined && (
            <span className="text-sm text-text-muted">by {entry.author}</span>
          )}
        </div>

        <h1 className="text-3xl font-bold text-text-primary tracking-tight">
          {entry.name}
        </h1>

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-2" aria-label="Tags">
            {entry.tags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
        )}
      </header>

      {/* Full description */}
      <section aria-label="Description">
        <div className="prose-custom space-y-3">
          {entry.fullDescription.split('\n\n').map((paragraph, i) => (
            <p key={i} className="text-text-secondary leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* Usage snippet */}
      {entry.usageSnippet !== undefined && entry.usageSnippet.trim() !== '' && (
        <section aria-label="Usage">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-text-muted">
            Usage
          </h2>
          <CodeBlock code={entry.usageSnippet} language="text" />
        </section>
      )}

      {/* Source link */}
      <footer className="border-t border-border-subtle pt-6">
        <div className="flex flex-wrap items-center gap-3">
          {shouldShowInstallButton && (
            <InstallButton onClick={() => setIsModalOpen(true)} />
          )}
          <a
            href={entry.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border-default bg-bg-surface px-4 py-2.5 text-sm font-medium text-text-primary transition-all duration-150 hover:bg-bg-elevated hover:border-accent-primary hover:text-accent-primary"
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
      </footer>
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
