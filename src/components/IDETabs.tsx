import type { InstallConfig } from '../types/entry';

interface IDETabsProps {
  activeIDE: keyof InstallConfig;
  onTabChange: (ide: keyof InstallConfig) => void;
}

const tabs = [
  { id: 'cursor' as const, label: 'Cursor' },
  { id: 'claudeDesktop' as const, label: 'Claude Desktop' },
  { id: 'antigravity' as const, label: 'Antigravity' },
  { id: 'kiro' as const, label: 'Kiro' },
];

export function IDETabs({ activeIDE, onTabChange }: IDETabsProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeIDE);

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        {
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
          onTabChange(tabs[prevIndex].id);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        {
          const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
          onTabChange(tabs[nextIndex].id);
        }
        break;
      case 'Home':
        e.preventDefault();
        onTabChange(tabs[0].id);
        break;
      case 'End':
        e.preventDefault();
        onTabChange(tabs[tabs.length - 1].id);
        break;
      default:
        return;
    }
  };

  return (
    <div
      role="tablist"
      aria-label="IDE selection"
      className="flex gap-1 border-b border-border-subtle"
      onKeyDown={handleKeyDown}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeIDE;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${tab.id}-panel`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors duration-200 border-b-2 -mb-px ${
              isActive
                ? 'border-accent-primary text-accent-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-default'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
