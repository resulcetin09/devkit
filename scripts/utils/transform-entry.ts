import type { Entry } from '../../src/types/entry.js';
import { transformRepoName, generateId } from './transform-name.js';
import { extractFirstParagraph } from './parse-readme.js';
import { generateInstallConfig } from './generate-install-config.js';
import type { Octokit } from '@octokit/rest';

/**
 * GitHub repository data structure from Octokit
 */
export interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  owner: {
    login: string;
  };
  topics?: string[];
  stargazers_count: number;
}

/**
 * Transform GitHub repository data into Entry format
 */
export async function transformRepoToEntry(
  repo: GitHubRepo,
  readmeContent?: string,
  octokit?: Octokit,
  existingEntries: Entry[] = []
): Promise<Entry> {
  // Generate name and ID
  const name = transformRepoName(repo.name);
  const id = generateId(repo.name);

  // Get short description from repo description
  const shortDescription = repo.description?.trim() || 'No description provided';

  // Get full description from README first paragraph, fallback to description
  let fullDescription = shortDescription;
  if (readmeContent) {
    const firstParagraph = extractFirstParagraph(readmeContent);
    if (firstParagraph && firstParagraph.length > 0) {
      fullDescription = firstParagraph;
    }
  }
  
  // Ensure we always have a description
  if (fullDescription === 'No description provided' && shortDescription !== 'No description provided') {
    fullDescription = shortDescription;
  }

  // Get tags from topics, ensure it's always an array
  const tags = Array.isArray(repo.topics) ? repo.topics : [];

  // Get author from owner
  const author = repo.owner.login;

  // Build entry
  const entry: Entry = {
    id,
    name,
    shortDescription,
    fullDescription,
    category: 'mcp-server',
    tags,
    sourceUrl: repo.html_url,
    author,
  };

  // Generate installConfig if octokit is provided
  if (octokit && readmeContent !== undefined) {
    try {
      const installConfig = await generateInstallConfig(
        octokit,
        repo,
        readmeContent || '',
        existingEntries
      );
      
      if (installConfig) {
        entry.installConfig = installConfig;
      }
    } catch (error) {
      console.log(`[transform-entry] Failed to generate installConfig for ${repo.full_name}:`, error instanceof Error ? error.message : error);
      // Continue without installConfig
    }
  }

  return entry;
}
