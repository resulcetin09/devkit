import type { Entry } from '../../src/types/entry.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Format an entry object as a string for the entries.ts file
 */
function formatEntry(entry: Entry, indent: string = '  '): string {
  const parts: string[] = [];
  
  // Required fields
  parts.push(`id: '${entry.id}'`);
  parts.push(`name: '${escapeString(entry.name)}'`);
  parts.push(`shortDescription: '${escapeString(entry.shortDescription)}'`);
  parts.push(`fullDescription: '${escapeString(entry.fullDescription)}'`);
  parts.push(`category: '${entry.category}'`);
  parts.push(`tags: [${entry.tags.map(t => `'${escapeString(t)}'`).join(', ')}]`);
  parts.push(`sourceUrl: '${entry.sourceUrl}'`);
  
  // Optional fields
  if (entry.author) {
    parts.push(`author: '${escapeString(entry.author)}'`);
  }
  if (entry.usageSnippet) {
    parts.push(`usageSnippet: '${escapeString(entry.usageSnippet)}'`);
  }
  if (entry.iconUrl) {
    parts.push(`iconUrl: '${entry.iconUrl}'`);
  }
  if (entry.installConfig) {
    // Format installConfig as multi-line for readability
    parts.push(formatInstallConfig(entry.installConfig));
  }
  
  return `{ ${parts.join(', ')} }`;
}

/**
 * Format installConfig object
 */
function formatInstallConfig(config: any): string {
  // Keep installConfig compact but readable
  const ides = ['cursor', 'claudeDesktop', 'antigravity', 'kiro'];
  const formatted = ides.map(ide => {
    const ideConfig = config[ide];
    if (!ideConfig) return null;
    
    return `${ide}: { configSnippet: '${escapeString(ideConfig.configSnippet)}', filePath: '${escapeString(ideConfig.filePath)}' }`;
  }).filter(Boolean).join(', ');
  
  return `installConfig: { ${formatted} }`;
}

/**
 * Escape string for JavaScript single-quoted string literal
 * Must escape in this order: backslashes first, then quotes, then control chars
 */
function escapeString(str: string): string {
  return str
    // Escape backslashes first (must be first!)
    .replace(/\\/g, '\\\\')
    // Escape single quotes
    .replace(/'/g, "\\'")
    // Escape newlines
    .replace(/\n/g, '\\n')
    // Escape carriage returns
    .replace(/\r/g, '\\r')
    // Escape tabs
    .replace(/\t/g, '\\t');
}

/**
 * Write entries to entries.ts file, preserving file structure
 */
export function writeEntriesFile(entries: Entry[], filePath?: string): void {
  const entriesPath = filePath || path.join(process.cwd(), 'src/data/entries.ts');
  
  // Read existing file to preserve header
  const existingContent = fs.readFileSync(entriesPath, 'utf-8');
  
  // Extract header (everything before RAW_ENTRIES)
  const headerMatch = existingContent.match(/([\s\S]*?)export const RAW_ENTRIES/);
  const header = headerMatch ? headerMatch[1] : "import type { Entry } from '../types/entry';\n\n";
  
  // Sort entries: skills first (alphabetically), then mcp-servers (alphabetically)
  const sortedEntries = [...entries].sort((a, b) => {
    // First sort by category
    if (a.category !== b.category) {
      return a.category === 'skill' ? -1 : 1;
    }
    // Then sort by id within category
    return a.id.localeCompare(b.id);
  });
  
  // Format entries array
  const formattedEntries = sortedEntries.map(entry => `  ${formatEntry(entry)}`).join(',\n');
  
  // Build complete file content with satisfies operator for type safety
  const fileContent = `${header}export const RAW_ENTRIES: unknown[] = [\n${formattedEntries}\n] satisfies Entry[];\n`;
  
  // Write to file
  fs.writeFileSync(entriesPath, fileContent, 'utf-8');
}

/**
 * Preview what the file would look like without writing
 */
export function previewEntriesFile(entries: Entry[]): string {
  const sortedEntries = [...entries].sort((a, b) => {
    if (a.category !== b.category) {
      return a.category === 'skill' ? -1 : 1;
    }
    return a.id.localeCompare(b.id);
  });
  
  const formattedEntries = sortedEntries.map(entry => `  ${formatEntry(entry)}`).join(',\n');
  
  return `export const RAW_ENTRIES: unknown[] = [\n${formattedEntries}\n] satisfies Entry[];\n`;
}
