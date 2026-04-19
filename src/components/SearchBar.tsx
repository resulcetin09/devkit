export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <svg
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" strokeLinecap="round" />
      </svg>

      <input
        type="search"
        aria-label="Search skills and MCP servers"
        placeholder="Search skills and MCP servers…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border-subtle bg-bg-surface py-3 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30 focus:bg-bg-elevated"
      />
    </div>
  );
}
