import { useState, useEffect, useRef } from 'react';
import type { InstallConfig } from '../types/entry';
import { IDETabs } from './IDETabs';
import { ConfigurationDisplay } from './ConfigurationDisplay';

interface InstallModalProps {
  installConfig: InstallConfig;
  entryName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function InstallModal({ installConfig, entryName, isOpen, onClose }: InstallModalProps) {
  const [activeIDE, setActiveIDE] = useState<keyof InstallConfig>('cursor');
  const modalContentRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Focus trap implementation
  useEffect(() => {
    if (!modalContentRef.current) return;

    const focusableElements = modalContentRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Focus close button on mount
    closeButtonRef.current?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [activeIDE]); // Re-run when activeIDE changes to update focusable elements

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Early exit if not open - AFTER all hooks
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/80 backdrop-blur-md transition-opacity duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalContentRef}
        className="relative w-full max-w-3xl mx-4 bg-bg-surface border border-border-default rounded-lg shadow-2xl transform transition-all duration-200 ease-out scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <h2
            id="modal-title"
            className="text-xl font-semibold text-text-primary"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Install {entryName}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-accent-primary transition-colors duration-150 rounded-md hover:bg-bg-elevated"
            aria-label="Close modal"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-6 space-y-6">
          {/* IDE Tabs */}
          <IDETabs activeIDE={activeIDE} onTabChange={setActiveIDE} />

          {/* Configuration Display */}
          <div
            role="tabpanel"
            id={`${activeIDE}-panel`}
            aria-labelledby={`${activeIDE}-tab`}
          >
            <ConfigurationDisplay
              config={installConfig[activeIDE]}
              ideName={activeIDE}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
