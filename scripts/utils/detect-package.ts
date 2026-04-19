import { Octokit } from '@octokit/rest';

/**
 * Detects the package name for an MCP server repository
 * @param octokit - GitHub API client
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param runtime - Runtime type ('node' or 'python')
 * @returns Package name or undefined if not found/invalid
 */
export async function detectPackageName(
  octokit: Octokit,
  owner: string,
  repo: string,
  runtime: 'node' | 'python' | 'unknown'
): Promise<string | undefined> {
  if (runtime === 'unknown') {
    return undefined;
  }

  try {
    if (runtime === 'node') {
      return await detectNodePackageName(octokit, owner, repo);
    } else if (runtime === 'python') {
      return await detectPythonPackageName(octokit, owner, repo);
    }
  } catch (error) {
    console.log(`[detect-package] Failed to detect package name for ${owner}/${repo}:`, error instanceof Error ? error.message : error);
    return undefined;
  }

  return undefined;
}

/**
 * Detects package name from package.json for Node.js projects
 */
async function detectNodePackageName(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<string | undefined> {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: 'package.json',
    });

    if ('content' in data && data.content) {
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      const packageJson = JSON.parse(content);
      
      if (packageJson.name && typeof packageJson.name === 'string') {
        const packageName = packageJson.name.trim();
        
        if (isValidNpmPackageName(packageName)) {
          return packageName;
        } else {
          console.log(`[detect-package] Invalid npm package name: ${packageName}`);
          return undefined;
        }
      }
    }
  } catch (error) {
    // File not found or parse error
    return undefined;
  }

  return undefined;
}

/**
 * Detects package name from pyproject.toml for Python projects
 */
async function detectPythonPackageName(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<string | undefined> {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: 'pyproject.toml',
    });

    if ('content' in data && data.content) {
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      
      // Simple TOML parsing for [project] name field
      const nameMatch = content.match(/^\[project\][\s\S]*?^name\s*=\s*["']([^"']+)["']/m);
      if (nameMatch && nameMatch[1]) {
        return nameMatch[1].trim();
      }
      
      // Try [tool.poetry] name field
      const poetryMatch = content.match(/^\[tool\.poetry\][\s\S]*?^name\s*=\s*["']([^"']+)["']/m);
      if (poetryMatch && poetryMatch[1]) {
        return poetryMatch[1].trim();
      }
    }
  } catch (error) {
    // File not found or parse error
    return undefined;
  }

  return undefined;
}

/**
 * Validates npm package name format
 * Based on npm package name rules:
 * - Length: 1-214 characters
 * - Lowercase only
 * - Can include hyphens, underscores, dots
 * - Can be scoped (@org/package)
 * - No leading dots or underscores
 */
export function isValidNpmPackageName(name: string): boolean {
  if (!name || name.length === 0 || name.length > 214) {
    return false;
  }

  // Check for scoped package
  const scopedPattern = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
  return scopedPattern.test(name);
}
