import { Outlet } from 'react-router-dom';
import { CONTRIBUTION_URL } from '../data/entries';

function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border-subtle bg-bg-surface/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo / wordmark */}
        <a
          href="/"
          className="flex items-center gap-2.5 text-text-primary hover:text-white transition-colors duration-150"
          aria-label="Devkit Directory home"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-primary/20 border border-accent-primary/30">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-accent-primary" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5Z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight">Devkit</span>
        </a>

        {/* CTA */}
        <a
          href={CONTRIBUTION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-bg-elevated px-3.5 py-1.5 text-xs font-medium text-text-primary transition-all duration-150 hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/5"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Submit an Entry
        </a>
      </div>
    </header>
  );
}

export function Layout() {
  return (
    <div className="min-h-screen bg-bg-base">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
