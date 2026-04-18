interface TagProps {
  label: string;
}

export function Tag({ label }: TagProps) {
  return (
    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-mono text-text-secondary bg-bg-elevated border border-border-subtle hover:border-border-default hover:text-text-primary transition-colors duration-150">
      {label}
    </span>
  );
}
