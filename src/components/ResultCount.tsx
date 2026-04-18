export interface ResultCountProps {
  count: number;
  total: number;
}

export function ResultCount({ count, total }: ResultCountProps) {
  return (
    <p className="text-sm text-text-secondary" aria-live="polite" aria-atomic="true">
      Showing{' '}
      <span className="font-medium text-text-primary">{count}</span>
      {' '}of{' '}
      <span className="font-medium text-text-primary">{total}</span>
      {' '}{total === 1 ? 'entry' : 'entries'}
    </p>
  );
}
