import { Octokit } from '@octokit/rest';
import { detectRuntime, Runtime } from './detect-runtime.js';
import { detectPackageName } from './detect-package.js';
import { parseEnvVars } from './parse-env-vars.js';
import { generateServerName, ensureUniqueName, extractExistingServerNames } from './generate-server-name.js';

// IDE configuration file paths
const IDE_PATHS = {
  cursor: '~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json',
  claudeDesktop: '~/Library/Application Support/Claude/claude_desktop_config.json',
  antigravity: '~/.config/antigravity/config.json',
  kiro: '~/.kiro/mcp_settings.json',
} as const;

export interface InstallConfig {
  cursor: IDEConfig;
  claudeDesktop: IDEConfig;
  antigravity: IDEConfig;
  kiro: IDEConfig;
}

export interface IDEConfig {
  configSnippet: string;
  filePath: string;
}

/**
 * Generates InstallConfig for an MCP server repository
 * @param octokit - GitHub API client
 * @param repo - GitHub repository object
 * @param readme - README content
 * @param existingEntries - Existing entries for uniqueness checking
 * @returns InstallConfig object or undefined if generation fails
 */
export async function generateInstallConfig(
  octokit: Octokit,
  repo: any,
  readme: string,
  existingEntries: any[] = []
): Promise<InstallConfig | undefined> {
  try {
    // 1. Detect runtime
    const runtime = await detectRuntime(octokit, repo.owner.login, repo.name);
    if (runtime === 'unknown') {
      console.log(`[generate-install-config] Unknown runtime for ${repo.owner.login}/${repo.name}, skipping installConfig`);
      return undefined;
    }

    // 2. Get package name
    const packageName = await detectPackageName(octokit, repo.owner.login, repo.name, runtime);
    if (!packageName) {
      console.log(`[generate-install-config] No package name found for ${repo.owner.login}/${repo.name}, skipping installConfig`);
      return undefined;
    }

    // 3. Generate server name
    const baseServerName = generateServerName(packageName);
    const existingServerNames = extractExistingServerNames(existingEntries);
    const serverName = ensureUniqueName(baseServerName, existingServerNames);

    // 4. Parse environment variables
    const envVars = parseEnvVars(readme);

    // 5. Build config snippet
    const configSnippet = buildConfigSnippet(serverName, runtime, packageName, envVars);

    // 6. Generate InstallConfig for all IDEs
    const installConfig: InstallConfig = {
      cursor: {
        configSnippet,
        filePath: IDE_PATHS.cursor,
      },
      claudeDesktop: {
        configSnippet,
        filePath: IDE_PATHS.claudeDesktop,
      },
      antigravity: {
        configSnippet,
        filePath: IDE_PATHS.antigravity,
      },
      kiro: {
        configSnippet,
        filePath: IDE_PATHS.kiro,
      },
    };

    console.log(`[generate-install-config] Generated installConfig for ${repo.owner.login}/${repo.name} (server: ${serverName})`);
    return installConfig;

  } catch (error) {
    console.log(`[generate-install-config] Error generating installConfig for ${repo.owner.login}/${repo.name}:`, error instanceof Error ? error.message : error);
    return undefined;
  }
}

/**
 * Builds the JSON configuration snippet for MCP server
 * @param serverName - Clean server name
 * @param runtime - Runtime type ('node' or 'python')
 * @param packageName - Package name
 * @param envVars - Environment variables object
 * @returns JSON configuration string
 */
export function buildConfigSnippet(
  serverName: string,
  runtime: Runtime,
  packageName: string,
  envVars: Record<string, string>
): string {
  const config: any = {
    mcpServers: {
      [serverName]: {
        command: runtime === 'node' ? 'npx' : 'uvx',
        args: runtime === 'node' ? ['-y', packageName] : [packageName],
      },
    },
  };

  // Add environment variables if any were found
  if (Object.keys(envVars).length > 0) {
    config.mcpServers[serverName].env = envVars;
  }

  // Format JSON with proper indentation
  return JSON.stringify(config, null, 2);
}