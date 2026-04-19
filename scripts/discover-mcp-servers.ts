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
    errors: number;
    skipped: string[];
  };
}

/**
 * Error context for logging
 */
interface ErrorContext {
  operation: string;
  repo?: string;
  attempt?: number;
  error: unknown;
}

/**
 * Log error with context
 */
function logError(context: ErrorContext): void {
  const { operation, repo, attempt, error } = context;
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  let logMessage = `❌ Error during ${operation}`;
  if (repo) logMessage += ` for ${repo}`;
  if (attempt) logMessage += ` (attempt ${attempt})`;
  logMessage += `: ${errorMessage}`;
  
  console.error(logMessage);
  
  // Log stack trace for debugging if available
  if (error instanceof Error && error.stack) {
    console.error('Stack trace:', error.stack);
  }
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries: number;
    initialDelay: number;
    operation: string;
    repo?: string;
  }
): Promise<T | null> {
  const { maxRetries, initialDelay, operation, repo } = options;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      // Check if it's a rate limit error
      const isRateLimit = error instanceof Error && 
        (error.message.includes('rate limit') || error.message.includes('403'));
      
      // Check if it's a timeout
      const isTimeout = error instanceof Error && 
        (error.message.includes('timeout') || error.message.includes('ETIMEDOUT'));
      
      // Log error with context
      logError({ operation, repo, attempt, error });
      
      // Don't retry on 404 or other non-retryable errors
      if (error instanceof Error && error.message.includes('404')) {
        console.warn(`  ⚠️  Resource not found, skipping retries`);
        return null;
      }
      
      // If last attempt or non-retryable error, give up
      if (attempt === maxRetries || (!isRateLimit && !isTimeout)) {
        console.error(`  ❌ Failed after ${attempt} attempts`);
        return null;
      }
      
      // Calculate exponential backoff delay
      const delay = initialDelay * Math.pow(2, attempt - 1);
      console.log(`  ⏳ Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
      await sleep(delay);
    }
  }
  
  return null;
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
 * Fetch README with retry logic
 */
async function fetchReadme(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<string | undefined> {
  const result = await retryWithBackoff(
    async () => {
      const response = await octokit.rest.repos.getReadme({
        owner,
        repo,
      });
      return Buffer.from(response.data.content, 'base64').toString('utf-8');
    },
    {
      maxRetries: 3,
      initialDelay: 1000,
      operation: 'README fetch',
      repo: `${owner}/${repo}`,
    }
  );
  
  return result || undefined;
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
  
  const octokit = new Octokit({ 
    auth: token,
    request: {
      timeout: 30000, // 30 second timeout
    },
  });
  
  console.log('🔍 Searching GitHub for MCP servers...');
  
  // Search for repositories with topic:mcp-server and stars >= 10
  let searchResponse;
  try {
    searchResponse = await retryWithBackoff(
      async () => {
        return await octokit.rest.search.repos({
          q: 'topic:mcp-server stars:>=10',
          sort: 'stars',
          order: 'desc',
          per_page: 100,
        });
      },
      {
        maxRetries: 3,
        initialDelay: 2000,
        operation: 'GitHub search',
      }
    );
    
    if (!searchResponse) {
      throw new Error('Failed to search GitHub repositories after retries');
    }
  } catch (error) {
    logError({ operation: 'GitHub search', error });
    throw error;
  }
  
  console.log(`Found ${searchResponse.data.items.length} repositories`);
  
  // Track errors and skipped repos
  let errorCount = 0;
  const skippedRepos: string[] = [];
  
  // Fetch README for each repo and transform to Entry
  const discoveredEntries: Entry[] = [];
  
  for (const repo of searchResponse.data.items) {
    console.log(`Processing: ${repo.full_name}`);
    
    try {
      // Fetch README with retry logic
      let readmeContent: string | undefined;
      try {
        readmeContent = await fetchReadme(octokit, repo.owner.login, repo.name);
        if (!readmeContent) {
          console.warn(`  ⚠️  Could not fetch README for ${repo.full_name}, using description as fallback`);
        }
      } catch (error) {
        logError({ 
          operation: 'README fetch', 
          repo: repo.full_name, 
          error 
        });
        console.warn(`  ⚠️  README fetch failed, using description as fallback`);
      }
      
      // Handle missing or empty description
      const description = repo.description?.trim() || null;
      if (!description) {
        console.warn(`  ⚠️  No description available for ${repo.full_name}`);
      }
      
      // Handle missing topics
      const topics = repo.topics || [];
      if (topics.length === 0) {
        console.warn(`  ⚠️  No topics found for ${repo.full_name}`);
      }
      
      // Transform to Entry
      const githubRepo: GitHubRepo = {
        name: repo.name,
        full_name: repo.full_name,
        description: description,
        html_url: repo.html_url,
        owner: {
          login: repo.owner.login,
        },
        topics: topics,
        stargazers_count: repo.stargazers_count,
      };
      
      const entry = transformRepoToEntry(githubRepo, readmeContent);
      discoveredEntries.push(entry);
      console.log(`  ✅ Successfully processed ${repo.full_name}`);
      
    } catch (error) {
      errorCount++;
      skippedRepos.push(repo.full_name);
      logError({ 
        operation: 'entry transformation', 
        repo: repo.full_name, 
        error 
      });
      console.error(`  ❌ Skipping ${repo.full_name} due to errors`);
    }
  }
  
  // Log summary of errors
  if (errorCount > 0) {
    console.warn(`\n⚠️  Encountered ${errorCount} errors during discovery`);
    console.warn(`Skipped repositories: ${skippedRepos.join(', ')}`);
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
      errors: errorCount,
      skipped: skippedRepos,
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
