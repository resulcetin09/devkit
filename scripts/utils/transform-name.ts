/**
 * Transform repository name into human-readable title
 * Examples:
 *   "mcp-server-figma" → "Figma MCP"
 *   "awesome-mcp-server" → "Awesome MCP Server"
 *   "github-mcp" → "GitHub MCP"
 */
export function transformRepoName(repoName: string): string {
  // Remove common prefixes and suffixes
  let cleaned = repoName
    .replace(/^mcp-server-/, '')
    .replace(/^server-mcp-/, '')
    .replace(/^mcp-/, '')
    .replace(/-mcp-server$/, '')
    .replace(/-server$/, '')
    .replace(/-mcp$/, '');

  // Split on hyphens and underscores
  const words = cleaned.split(/[-_]/);

  // Capitalize each word
  const capitalized = words.map(word => {
    if (word.length === 0) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  // Join words
  let result = capitalized.join(' ');

  // Append "MCP" if not already present
  if (!result.toUpperCase().includes('MCP')) {
    result += ' MCP';
  }

  return result.trim();
}

/**
 * Generate URL-safe slug from repository name
 * Examples:
 *   "mcp-server-figma" → "figma-mcp"
 *   "Awesome MCP Server" → "awesome-mcp-server"
 */
export function generateId(repoName: string): string {
  // Convert to lowercase
  let id = repoName.toLowerCase();

  // Replace spaces and underscores with hyphens
  id = id.replace(/[\s_]+/g, '-');

  // Remove "mcp-server-" prefix if present
  id = id.replace(/^mcp-server-/, '');

  // Ensure it ends with -mcp if not already present
  if (!id.includes('mcp')) {
    id += '-mcp';
  } else if (!id.endsWith('-mcp') && !id.startsWith('mcp-')) {
    // If mcp is in the middle, move it to the end
    id = id.replace(/[-]?mcp[-]?/, '-') + '-mcp';
  }

  // Clean up multiple hyphens
  id = id.replace(/-+/g, '-');

  // Remove leading/trailing hyphens
  id = id.replace(/^-+|-+$/g, '');

  return id;
}
