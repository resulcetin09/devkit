export interface ResultCountProps {
  count: number;
  total: number;
}

export function ResultCount({ count, total }: ResultCountProps) {
  return (
    <p 
      className="text-sm text-text-muted" 
      style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.02em' }}
      aria-live="polite" 
      aria-atomic="true"
    >
      Showing{' '}
      <span className="font-medium text-accent-primary">{count}</span>
      {' '}of{' '}
      <span className="font-medium text-text-secondary">{total}</span>
      {' '}{total === 1 ? 'entry' : 'entries'}
    </p>
  );
}
