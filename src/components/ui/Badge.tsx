import type { EntryCategory } from '../../types/entry';

interface BadgeProps {
  label: string;
  variant: EntryCategory;
}

const VARIANT_STYLES: Record<EntryCategory, string> = {
  skill:
    'bg-accent-skill/10 text-accent-skill border border-accent-skill/25 ring-accent-skill/20',
  'mcp-server':
    'bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/25 ring-accent-secondary/20',
};

export function Badge({ label, variant }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide ${VARIANT_STYLES[variant]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          variant === 'skill' ? 'bg-accent-skill' : 'bg-accent-secondary'
        }`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
