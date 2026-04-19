import type { Entry } from '../../src/types/entry.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Parse RAW_ENTRIES from entries.ts file
 * Returns array of Entry objects
 */
export function parseEntriesFile(filePath?: string): Entry[] {
  const entriesPath = filePath || path.join(process.cwd(), 'src/data/entries.ts');
  
  if (!fs.existsSync(entriesPath)) {
    throw new Error(`Entries file not found: ${entriesPath}`);
  }
  
  const content = fs.readFileSync(entriesPath, 'utf-8');
  
  // Extract RAW_ENTRIES array using regex
  // Match the array content, handling both with and without 'satisfies' operator
  const match = content.match(/export const RAW_ENTRIES: unknown\[\] = \[([\s\S]*?)\](?:\s+satisfies\s+\w+\[\])?;/);
  if (!match) {
    throw new Error('Could not parse RAW_ENTRIES from entries.ts');
  }
  
  let arrayContent = match[1];
  
  // Remove any TypeScript-specific syntax that might remain
  // Remove 'satisfies' operator if it somehow got included
  arrayContent = arrayContent.replace(/\s+satisfies\s+\w+\[\]\s*$/g, '');
  
  try {
    // Use eval to parse the array (safe in this context as we control the input)
    const entries = eval(`[${arrayContent}]`) as Entry[];
    return entries;
  } catch (error) {
    throw new Error(`Failed to parse entries: ${error}`);
  }
}

/**
 * Find entry by ID
 */
export function findEntryById(entries: Entry[], id: string): Entry | undefined {
  return entries.find(entry => entry.id === id);
}

/**
 * Get entries by category
 */
export function getEntriesByCategory(entries: Entry[], category: string): Entry[] {
  return entries.filter(entry => entry.category === category);
}
