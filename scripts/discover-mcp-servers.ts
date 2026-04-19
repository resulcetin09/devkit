#!/usr/bin/env node
import { Octokit } from '@octokit/rest';
import { transformRepoToEntry } from './utils/transform-entry.js';
import type { GitHubRepo } from './utils/transform-entry.js';
import type { Entry } from '../src/types/entry.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Discovery result structure
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
 * Parse RAW_ENTRIES from entries.ts file
 */
function parseExistingEntries(): Entry[] {
  const entriesPath = path.join(process.cwd(), 'src/data/entries.ts');
  const content = fs.readFileSync(entriesPath, 'utf-8');
  
  // Extract RAW_ENTRIES array using regex
  const match = content.match(/export const RAW_ENTRIES: unknown\[\] = \[([\s\S]*?)\];/);
  if (!match) {
    console.warn('Could not parse RAW_ENTRIES from entries.ts');
    return [];
  }
  
  // Parse the array content as JSON (with some cleanup)
  const arrayContent = match[1];
  try {
    // Wrap in array brackets and parse
    const entries = eval(`[${arrayContent}]`) as Entry[];
    return entries.filter(e => e.category === 'mcp-server');
  } catch (error) {
    console.error('Error parsing entries:', error);
    return [];
  }
}

/**
 * Compare two entries and return changes
 */
function compareEntries(existing: Entry, updated: Entry): Array<{ field: string; oldValue: unknown; newValue: unknown }> {
  const changes: Array<{ field: string; oldValue: unknown; newValue: unknown }> = [];
  
  // Compare relevant fields
  const fieldsToCompare: Array<keyof Entry> = [
    'name',
    'shortDescription',
    'fullDescription',
    'tags',
    'author',
    'sourceUrl',
  ];
  
  for (const field of fieldsToCompare) {
    const oldValue = existing[field];
    const newValue = updated[field];
    
    // Deep comparison for arrays
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      if (JSON.stringify(oldValue.sort()) !== JSON.stringify(newValue.sort())) {
        changes.push({ field, oldValue, newValue });
      }
    } else if (oldValue !== newValue) {
      changes.push({ field, oldValue, newValue });
    }
  }
  
  return changes;
}

/**
 * Main discovery function
 */
async function discoverMCPServers(dryRun: boolean = false): Promise<DiscoveryResult> {
  // Initialize Octokit
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is required');
  }
  
  const octokit = new Octokit({ auth: token });
  
  console.log('🔍 Searching GitHub for MCP servers...');
  
  // Search for repositories with topic:mcp-server and stars >= 10
  const searchResponse = await octokit.rest.search.repos({
    q: 'topic:mcp-server stars:>=10',
    sort: 'stars',
    order: 'desc',
    per_page: 100,
  });
  
  console.log(`Found ${searchResponse.data.items.length} repositories`);
  
  // Fetch README for each repo and transform to Entry
  const discoveredEntries: Entry[] = [];
  
  for (const repo of searchResponse.data.items) {
    console.log(`Processing: ${repo.full_name}`);
    
    let readmeContent: string | undefined;
    try {
      const readmeResponse = await octokit.rest.repos.getReadme({
        owner: repo.owner.login,
        repo: repo.name,
      });
      
      // Decode base64 content
      readmeContent = Buffer.from(readmeResponse.data.content, 'base64').toString('utf-8');
    } catch (error) {
      console.warn(`  ⚠️  Could not fetch README for ${repo.full_name}`);
    }
    
    // Transform to Entry
    const githubRepo: GitHubRepo = {
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      owner: {
        login: repo.owner.login,
      },
      topics: repo.topics,
      stargazers_count: repo.stargazers_count,
    };
    
    const entry = transformRepoToEntry(githubRepo, readmeContent);
    discoveredEntries.push(entry);
  }
  
  // Load existing entries
  const existingEntries = parseExistingEntries();
  const existingById = new Map(existingEntries.map(e => [e.id, e]));
  
  // Compare and categorize
  const newEntries: Entry[] = [];
  const updatedEntries: Array<{
    id: string;
    changes: { field: string; oldValue: unknown; newValue: unknown }[];
  }> = [];
  let unchangedCount = 0;
  
  for (const discovered of discoveredEntries) {
    const existing = existingById.get(discovered.id);
    
    if (!existing) {
      // New entry
      newEntries.push(discovered);
    } else {
      // Check for changes
      const changes = compareEntries(existing, discovered);
      if (changes.length > 0) {
        updatedEntries.push({
          id: discovered.id,
          changes,
        });
      } else {
        unchangedCount++;
      }
    }
  }
  
  const result: DiscoveryResult = {
    newEntries,
    updatedEntries,
    summary: {
      totalFound: discoveredEntries.length,
      newCount: newEntries.length,
      updatedCount: updatedEntries.length,
      unchangedCount,
    },
  };
  
  // Output result
  if (dryRun) {
    console.log('\n📊 Discovery Results (DRY RUN):');
    console.log(JSON.stringify(result, null, 2));
  } else {
    const outputPath = path.join(process.cwd(), 'mcp-discovery-result.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`\n✅ Results written to: ${outputPath}`);
  }
  
  // Print summary
  console.log('\n📊 Summary:');
  console.log(`  Total found: ${result.summary.totalFound}`);
  console.log(`  New entries: ${result.summary.newCount}`);
  console.log(`  Updated entries: ${result.summary.updatedCount}`);
  console.log(`  Unchanged: ${result.summary.unchangedCount}`);
  
  return result;
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run discovery
discoverMCPServers(dryRun).catch(error => {
  console.error('❌ Discovery failed:', error);
  process.exit(1);
});
