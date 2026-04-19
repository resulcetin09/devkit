/**
 * Centralized configuration for MCP server quality filtering
 */

export const QUALITY_FILTER_CONFIG = {
  // Discovery stage patterns - repositories to exclude based on name
  EXCLUDE_NAME_PATTERNS: [
    /mcp-sdk/i,
    /mcp-client/i,
    /mcp-framework/i,
    /mcp-lib/i,
    /mcp-toolkit/i,
    /mcp-template/i,
    /mcp-example/i,
    /mcp-tutorial/i,
    /mcp-docs/i,
    /awesome-mcp/i,
    /mcp-collection/i,
    /mcp-resources/i,
    /mcp-list/i,
  ],
  
  // Description keywords that indicate non-server repositories
  EXCLUDE_DESCRIPTION_KEYWORDS: [
    'framework',
    'library',
    'sdk',
    'client',
    'template',
    'tutorial',
    'documentation',
    'docs',
    'example',
    'awesome',
    'list',
    'collection',
    'resources',
    'guide',
    'learning',
    'course',
  ],
  
  // Topics that repositories should have to be considered MCP servers
  REQUIRE_POSITIVE_TOPICS: [
    'mcp-server',
    'model-context-protocol',
    'mcp-tools',
  ],
  
  // Validation stage scoring weights
  SCORING: {
    README_MCP_MENTIONS: 10,
    INSTALLATION_INSTRUCTIONS: 15,
    PACKAGE_JSON_MCP_DEPS: 20,
    TOOL_DEFINITIONS: 25,
    SERVER_ENTRY_POINT: 20,
    USAGE_EXAMPLES: 10,
    PYTHON_MCP_DEPS: 20,
  },
  
  // Score thresholds for acceptance
  THRESHOLDS: {
    MINIMUM_SCORE: 30,
    CONFIDENT_ACCEPT: 60,
  },
} as const;

// MCP-related patterns for README analysis
export const MCP_INDICATORS = {
  MENTIONS: [
    'model context protocol',
    'mcp server',
    'mcp-server',
    'claude mcp',
    'anthropic mcp',
    'modelcontextprotocol',
  ],
  
  INSTALLATION_PATTERNS: [
    /npm install/i,
    /pip install/i,
    /uvx/i,
    /npx/i,
    /installation/i,
    /getting started/i,
    /setup/i,
  ],
  
  USAGE_PATTERNS: [
    /usage/i,
    /example/i,
    /how to use/i,
    /configuration/i,
    /config/i,
  ],
  
  NODE_MCP_DEPS: [
    '@modelcontextprotocol/sdk',
    'mcp',
    '@anthropic/mcp',
  ],
  
  PYTHON_MCP_DEPS: [
    'mcp',
    'model-context-protocol',
    'anthropic-mcp',
  ],
} as const;