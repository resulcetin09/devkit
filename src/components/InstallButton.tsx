export interface InstallButtonProps {
  onClick: () => void;
}

export function InstallButton({ onClick }: InstallButtonProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg border border-border-default bg-bg-surface px-4 py-2.5 text-sm font-medium text-text-primary transition-all duration-150 hover:bg-bg-elevated hover:border-accent-primary hover:text-accent-primary"
      aria-label="Install MCP server"
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
        <path
          d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Install
    </button>
  );
}
