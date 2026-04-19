#!/usr/bin/env node
import { parseEntriesFile, findEntryById } from './utils/parse-entries.js';
import { writeEntriesFile, previewEntriesFile } from './utils/write-entries.js';
import type { Entry } from '../src/types/entry.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Discovery result structure (from discover-mcp-servers.ts)
 */
interface DiscoveryResult {
  newEntries: Entry[];
  updatedEntries: Array<{
    id: string;
    changes: {
      field: string;
      oldValue: unknown;
      newValue: unknown;
    }[];
  }>;
  summary: {
    totalFound: number;
    newCount: number;
    updatedCount: number;
    unchangedCount: number;
  };
}

/**
 * Update summary structure
 */
interface UpdateSummary {
  entriesAdded: number;
  entriesUpdated: number;
  entriesPreserved: number;
  fieldsPreserved: string[];
  changes: Array<{
    id: string;
    action: 'added' | 'updated';
    fields?: string[];
  }>;
}

/**
 * Merge updated fields while preserving manual fields
 */
function mergeEntry(existing: Entry, updated: Partial<Entry>): Entry {
  // Fields that should be preserved from existing entry (manually maintained)
  const preservedFields = ['installConfig', 'usageSnippet', 'iconUrl'];
  
  const merged: Entry = { ...existing };
  
  // Update fields from discovery
  for (const [key, value] of Object.entries(updated)) {
    if (!preservedFields.includes(key) && value !== undefined) {
      (merged as any)[key] = value;
    }
  }
  
  return merged;
}

/**
 * Main update function
 */
async function updateEntries(discoveryResultPath: string, dryRun: boolean = false): Promise<UpdateSummary> {
  console.log('📝 Reading discovery results...');
  
  // Read discovery results
  if (!fs.existsSync(discoveryResultPath)) {
    throw new Error(`Discovery result file not found: ${discoveryResultPath}`);
  }
  
  const discoveryResult: DiscoveryResult = JSON.parse(
    fs.readFileSync(discoveryResultPath, 'utf-8')
  );
  
  console.log(`Found ${discoveryResult.newEntries.length} new entries and ${discoveryResult.updatedEntries.length} updates`);
  
  // Parse existing entries
  console.log('📖 Parsing existing entries...');
  const existingEntries = parseEntriesFile();
  const existingById = new Map(existingEntries.map(e => [e.id, e]));
  
  // Track changes
  const changes: Array<{ id: string; action: 'added' | 'updated'; fields?: string[] }> = [];
  const updatedEntriesMap = new Map<string, Entry>();
  
  // Add new entries
  for (const newEntry of discoveryResult.newEntries) {
    updatedEntriesMap.set(newEntry.id, newEntry);
    changes.push({ id: newEntry.id, action: 'added' });
    console.log(`  ✨ Adding new entry: ${newEntry.name}`);
  }
  
  // Update existing entries
  for (const update of discoveryResult.updatedEntries) {
    const existing = existingById.get(update.id);
    if (!existing) {
      console.warn(`  ⚠️  Entry ${update.id} marked for update but not found in existing entries`);
      continue;
    }
    
    // Build updated entry from changes
    const updatedFields: Partial<Entry> = {};
    const changedFieldNames: string[] = [];
    
    for (const change of update.changes) {
      updatedFields[change.field as keyof Entry] = change.newValue as any;
      changedFieldNames.push(change.field);
    }
    
    // Merge with existing, preserving manual fields
    const merged = mergeEntry(existing, updatedFields);
    updatedEntriesMap.set(merged.id, merged);
    changes.push({ id: merged.id, action: 'updated', fields: changedFieldNames });
    
    console.log(`  🔄 Updating entry: ${merged.name} (${changedFieldNames.join(', ')})`);
  }
  
  // Preserve unchanged entries
  let preservedCount = 0;
  for (const existing of existingEntries) {
    if (!updatedEntriesMap.has(existing.id)) {
      updatedEntriesMap.set(existing.id, existing);
      preservedCount++;
    }
  }
  
  // Build final entries array
  const finalEntries = Array.from(updatedEntriesMap.values());
  
  // Create summary
  const summary: UpdateSummary = {
    entriesAdded: discoveryResult.newEntries.length,
    entriesUpdated: discoveryResult.updatedEntries.length,
    entriesPreserved: preservedCount,
    fieldsPreserved: ['installConfig', 'usageSnippet', 'iconUrl'],
    changes,
  };
  
  // Write or preview
  if (dryRun) {
    console.log('\n📋 DRY RUN - Preview of changes:');
    console.log('\nSummary:');
    console.log(`  Entries added: ${summary.entriesAdded}`);
    console.log(`  Entries updated: ${summary.entriesUpdated}`);
    console.log(`  Entries preserved: ${summary.entriesPreserved}`);
    console.log(`  Fields preserved: ${summary.fieldsPreserved.join(', ')}`);
    
    console.log('\nChanges:');
    for (const change of summary.changes) {
      if (change.action === 'added') {
        console.log(`  + ${change.id}`);
      } else {
        console.log(`  ~ ${change.id} (${change.fields?.join(', ')})`);
      }
    }
    
    // Show preview of first few entries
    console.log('\nPreview of updated entries.ts (first 500 chars):');
    const preview = previewEntriesFile(finalEntries);
    console.log(preview.substring(0, 500) + '...\n');
  } else {
    console.log('\n💾 Writing updated entries.ts...');
    writeEntriesFile(finalEntries);
    
    // Write summary to file
    const summaryPath = path.join(process.cwd(), 'mcp-update-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log(`✅ Entries updated successfully!`);
    console.log(`📊 Summary written to: ${summaryPath}`);
    console.log(`\nSummary:`);
    console.log(`  Entries added: ${summary.entriesAdded}`);
    console.log(`  Entries updated: ${summary.entriesUpdated}`);
    console.log(`  Entries preserved: ${summary.entriesPreserved}`);
  }
  
  return summary;
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const inputFile = args.find(arg => !arg.startsWith('--')) || 'mcp-discovery-result.json';

// Run update
updateEntries(inputFile, dryRun).catch(error => {
  console.error('❌ Update failed:', error);
  process.exit(1);
});
