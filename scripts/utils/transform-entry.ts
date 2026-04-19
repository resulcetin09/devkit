import type { Entry } from '../../src/types/entry.js';
import { transformRepoName, generateId } from './transform-name.js';
import { extractFirstParagraph } from './parse-readme.js';

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
export function transformRepoToEntry(
  repo: GitHubRepo,
  readmeContent?: string
): Entry {
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

  return entry;
}
