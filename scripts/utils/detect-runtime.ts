import { Octokit } from '@octokit/rest';

export type Runtime = 'node' | 'python' | 'unknown';

/**
 * Detects the runtime type for an MCP server repository
 * Checks for files in order: package.json → pyproject.toml → setup.py
 * @param octokit - GitHub API client
 * @param owner - Repository owner
 * @param repo - Repository name
 * @returns Runtime type: 'node', 'python', or 'unknown'
 */
export async function detectRuntime(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<Runtime> {
  try {
    // Check for package.json (Node.js)
    if (await fileExists(octokit, owner, repo, 'package.json')) {
      return 'node';
    }

    // Check for pyproject.toml (Python)
    if (await fileExists(octokit, owner, repo, 'pyproject.toml')) {
      return 'python';
    }

    // Check for setup.py (Python)
    if (await fileExists(octokit, owner, repo, 'setup.py')) {
      return 'python';
    }

    return 'unknown';
  } catch (error) {
    console.log(`[detect-runtime] Error detecting runtime for ${owner}/${repo}:`, error instanceof Error ? error.message : error);
    return 'unknown';
  }
}

/**
 * Checks if a file exists in a repository
 * @param octokit - GitHub API client
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param path - File path to check
 * @returns true if file exists, false otherwise
 */
export async function fileExists(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string
): Promise<boolean> {
  try {
    await octokit.repos.getContent({
      owner,
      repo,
      path,
    });
    return true;
  } catch (error: any) {
    // 404 means file doesn't exist
    if (error.status === 404) {
      return false;
    }
    // Other errors (rate limit, network, etc.) - treat as not found
    return false;
  }
}
