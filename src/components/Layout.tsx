import { Outlet } from 'react-router-dom';
import { CONTRIBUTION_URL } from '../data/entries';

function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border-subtle/50 bg-bg-base/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Wordmark */}
        <a
          href="/"
          className="group flex items-center gap-3 text-text-primary hover:text-white"
          aria-label="Devkit Directory home"
        >
          {/* Monogram mark */}
          <div className="flex h-6 w-6 items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-accent-primary" aria-hidden="true">
              <path d="M3 6l9-3 9 3v6c0 5-4 8-9 9-5-1-9-4-9-9V6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span
            className="text-sm font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}
          >
            Devkit
          </span>
        </a>

        {/* Nav */}
        <nav className="flex items-center gap-6">
          <a
            href={CONTRIBUTION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium tracking-wide text-text-muted transition-colors hover:text-text-primary"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Submit an Entry ↗
          </a>
        </nav>
      </div>
    </header>
  );
}

export function Layout() {
  return (
    <div className="min-h-screen bg-bg-base">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
