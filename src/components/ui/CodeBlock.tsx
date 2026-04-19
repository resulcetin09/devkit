interface CodeBlockProps {
  code: string;
  language?: string;
  maxHeight?: string;
}

export function CodeBlock({ code, language, maxHeight = "none" }: CodeBlockProps) {
  return (
    <div className="relative rounded-lg overflow-hidden border border-border-subtle">
      {language !== undefined && (
        <div className="flex items-center justify-between px-4 py-2 bg-bg-elevated border-b border-border-subtle">
          <span className="text-xs font-mono text-text-muted tracking-widest uppercase">
            {language}
          </span>
          {/* decorative dots */}
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-border-default" />
            <span className="h-2.5 w-2.5 rounded-full bg-border-default" />
            <span className="h-2.5 w-2.5 rounded-full bg-border-default" />
          </span>
        </div>
      )}
      <pre 
        className="bg-bg-elevated overflow-auto p-4 text-sm leading-relaxed"
        style={{ 
          maxHeight,
          scrollbarWidth: 'thin',
          scrollbarColor: '#3d4460 #22263a'
        }}
      >
        <code className="font-mono text-text-primary whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}
