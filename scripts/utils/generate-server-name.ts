/**
 * Generates a clean, user-friendly server name from a package name
 * @param packageName - The npm/Python package name
 * @returns Clean server name (lowercase, spaces for readability)
 */
export function generateServerName(packageName: string): string {
  if (!packageName || packageName.trim().length === 0) {
    return 'server';
  }

  let name = packageName.trim();

  // Remove scope prefix (@org/package → package)
  if (name.startsWith('@')) {
    const slashIndex = name.indexOf('/');
    if (slashIndex !== -1) {
      name = name.substring(slashIndex + 1);
    }
  }

  // Remove common prefixes (order matters - longer prefixes first)
  const prefixes = [
    'mcp-server-',
    'server-mcp-',
    'awesome-mcp-server-',
    'mcp-',
    'server-',
    'awesome-',
  ];

  for (const prefix of prefixes) {
    if (name.toLowerCase().startsWith(prefix)) {
      name = name.substring(prefix.length);
      break; // Only remove one prefix
    }
  }

  // Remove common suffixes (order matters - longer suffixes first)
  const suffixes = [
    '-mcp-server',
    '-server-mcp',
    '-mcp',
    '-server',
  ];

  for (const suffix of suffixes) {
    if (name.toLowerCase().endsWith(suffix)) {
      name = name.substring(0, name.length - suffix.length);
      break; // Only remove one suffix
    }
  }

  // Replace hyphens and underscores with spaces
  name = name.replace(/[-_]/g, ' ');

  // Clean up multiple spaces
  name = name.replace(/\s+/g, ' ').trim();

  // Keep lowercase (server names are typically lowercase)
  name = name.toLowerCase();

  // Limit length to 50 characters
  if (name.length > 50) {
    name = name.substring(0, 50).trim();
  }

  // Fallback if name becomes empty
  if (name.length === 0) {
    return 'server';
  }

  return name;
}

/**
 * Ensures the server name is unique by appending a number if needed
 * @param name - The desired server name
 * @param existingNames - Array of existing server names
 * @returns Unique server name
 */
export function ensureUniqueName(name: string, existingNames: string[]): string {
  if (!existingNames.includes(name)) {
    return name;
  }

  // Try appending numbers
  let counter = 2;
  let uniqueName = `${name}-${counter}`;
  
  while (existingNames.includes(uniqueName)) {
    counter++;
    uniqueName = `${name}-${counter}`;
    
    // Safety check to prevent infinite loop
    if (counter > 100) {
      uniqueName = `${name}-${Date.now()}`;
      break;
    }
  }

  return uniqueName;
}

/**
 * Extracts server names from existing entries for uniqueness checking
 * @param entries - Array of existing Entry objects
 * @returns Array of server names from installConfig
 */
export function extractExistingServerNames(entries: any[]): string[] {
  const serverNames: string[] = [];

  for (const entry of entries) {
    if (entry.installConfig) {
      // Check all IDE configs for server names
      for (const ideConfig of Object.values(entry.installConfig)) {
        if (typeof ideConfig === 'object' && ideConfig && 'configSnippet' in ideConfig) {
          try {
            const config = JSON.parse(ideConfig.configSnippet as string);
            if (config.mcpServers) {
              serverNames.push(...Object.keys(config.mcpServers));
            }
          } catch (error) {
            // Ignore parse errors
          }
        }
      }
    }
  }

  return Array.from(new Set(serverNames)); // Remove duplicates
}