import { IDEConfig } from '../types/entry';
import { CodeBlock } from './ui/CodeBlock';
import { CopyButton } from './ui/CopyButton';

interface ConfigurationDisplayProps {
  config: IDEConfig;
  ideName: string;
  maxCodeHeight?: string;
}

export function ConfigurationDisplay({ config, maxCodeHeight = "none" }: ConfigurationDisplayProps) {
  return (
    <div className="space-y-6">
      {/* File Path Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-secondary">
          Configuration File Path
        </label>
        <div className="bg-bg-elevated border border-border-subtle rounded-md p-3">
          <code className="font-mono text-sm text-text-primary select-all">
            {config.filePath}
          </code>
        </div>
      </div>

      {/* Code Snippet Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-text-secondary">
            Configuration Snippet
          </label>
          <CopyButton textToCopy={config.configSnippet} label="Copy Config" />
        </div>
        <CodeBlock 
          code={config.configSnippet} 
          language="json" 
          maxHeight={maxCodeHeight}
        />
      </div>
    </div>
  );
}
