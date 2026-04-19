import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-7xl flex flex-col items-center justify-center px-4 py-32 text-center sm:px-6">
      <p className="text-6xl font-bold text-border-default select-none" aria-hidden="true">
        404
      </p>
      <h1 className="mt-4 text-xl font-semibold text-text-primary">Page not found</h1>
      <p className="mt-2 text-sm text-text-secondary max-w-xs">
        That entry doesn't exist or may have been removed.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg border border-border-default bg-bg-surface px-4 py-2.5 text-sm font-medium text-text-primary transition-all duration-150 hover:bg-bg-elevated hover:border-accent-primary hover:text-accent-primary"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to directory
      </Link>
    </div>
  );
}
