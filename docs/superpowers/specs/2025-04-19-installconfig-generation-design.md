# InstallConfig Auto-Generation Design

**Date:** 2025-04-19  
**Status:** Approved  
**Author:** Kiro  
**Related:** MCP Auto-Discovery Workflow

## Design Decisions

- **Approach**: Modular Utilities (Approach B)
- **Error Handling**: Skip installConfig on failure, still add entry
- **Update Behavior**: Never update manual configs (preserve forever)
- **Testing**: Manual testing only (ship and iterate)

## Overview

Enhance the MCP auto-discovery system to automatically generate `installConfig` objects for discovered MCP servers. This eliminates manual configuration work and provides users with ready-to-use installation instructions for all four supported IDEs (Cursor, Claude Desktop, Antigravity, Kiro).

## Goals

1. Automatically generate installConfig for all discovered MCP servers
2. Support both Node.js (npx) and Python (uvx) based servers
3. Detect package names from repository files
4. Parse environment variables from README documentation
5. Filter out archived and inactive repositories
6. Generate clean, user-friendly server names

## Architecture Changes

### Modified Components

1. **Discovery Script** (`scripts/discover-mcp-servers.ts`)
   - Add package.json fetching and parsing
   - Add pyproject.toml/setup.py detection
   - Add README environment variable parsing
   - Add archived repository filtering
   - Generate installConfig during transformation

2. **Transform Entry Utility** (`scripts/utils/transform-entry.ts`)
   - Add installConfig generation logic
   - Add server name generation
   - Add environment variable detection

### New Utilities

1. **Package Detector** (`scripts/utils/detect-package.ts`)
   - Fetch and parse package.json
   - Extract package name
   - Validate npm package name format

2. **Runtime Detector** (`scripts/utils/detect-runtime.ts`)
   - Check for package.json (Node.js)
   - Check for pyproject.toml (Python)
   - Check for setup.py (Python)
   - Return runtime type: 'node' | 'python' | 'unknown'

3. **Environment Parser** (`scripts/utils/parse-env-vars.ts`)
   - Parse README for environment variable patterns
   - Extract variable names (API_KEY, TOKEN, etc.)
   - Generate placeholder values

4. **Server Name Generator** (`scripts/utils/generate-server-name.ts`)
   - Transform package names to clean server names
   - Remove common prefixes/suffixes
   - Handle scoped packages (@org/package)

## Implementation Details

### 1. Package Detection

**Strategy**: Read package.json and extract the `name` field

**Process**:
1. Fetch `package.json` from repository via GitHub API
2. Parse JSON content
3. Extract `name` field
4. Validate it looks like a valid npm package name
5. Handle scoped packages (@org/package-name)

**Validation Rules**:
- Must match pattern: `^(@[a-z0-9-~][a-z0-9-._~]*/)?[a-z0-9-~][a-z0-9-._~]*$`
- Length: 1-214 characters
- No uppercase letters
- No leading dots or underscores

**Examples**:
```typescript
// Valid package names
"@modelcontextprotocol/server-figma"
"mcp-server-github"
"figma-mcp"

// Invalid (skip installConfig generation)
"" (empty)
"My Package" (uppercase, spaces)
".hidden" (leading dot)
```

### 2. Runtime Detection

**Strategy**: Check for files in order, use first match

**Detection Order**:
1. `package.json` → Node.js runtime (npx)
2. `pyproject.toml` → Python runtime (uvx)
3. `setup.py` → Python runtime (uvx)

**Implementation**:
```typescript
async function detectRuntime(octokit, owner, repo): Promise<'node' | 'python' | 'unknown'> {
  // Check package.json
  if (await fileExists(octokit, owner, repo, 'package.json')) {
    return 'node';
  }
  
  // Check pyproject.toml
  if (await fileExists(octokit, owner, repo, 'pyproject.toml')) {
    return 'python';
  }
  
  // Check setup.py
  if (await fileExists(octokit, owner, repo, 'setup.py')) {
    return 'python';
  }
  
  return 'unknown';
}
```

**Command Generation**:
- Node.js: `"command": "npx", "args": ["-y", "<package-name>"]`
- Python: `"command": "uvx", "args": ["<package-name>"]`
- Unknown: Skip installConfig generation

### 3. Environment Variable Detection

**Strategy**: Parse README for common environment variable patterns

**Detection Patterns**:
```typescript
const ENV_VAR_PATTERNS = [
  /\b([A-Z][A-Z0-9_]*(?:_KEY|_TOKEN|_SECRET|_API_KEY|_ACCESS_TOKEN))\b/g,
  /export\s+([A-Z][A-Z0-9_]+)=/g,
  /\$\{?([A-Z][A-Z0-9_]+)\}?/g,
  /process\.env\.([A-Z][A-Z0-9_]+)/g,
];
```

**Common Variables**:
- `API_KEY`, `ACCESS_TOKEN`, `SECRET_KEY`
- `GITHUB_TOKEN`, `SLACK_TOKEN`, `NOTION_API_KEY`
- `DATABASE_URL`, `REDIS_URL`
- Service-specific: `FIGMA_ACCESS_TOKEN`, `OPENAI_API_KEY`

**Placeholder Generation**:
```typescript
function generatePlaceholder(varName: string): string {
  if (varName.includes('TOKEN')) return 'your-token-here';
  if (varName.includes('KEY')) return 'your-api-key-here';
  if (varName.includes('SECRET')) return 'your-secret-here';
  if (varName.includes('URL')) return 'https://example.com';
  return 'your-value-here';
}
```

**Example Output**:
```json
{
  "env": {
    "FIGMA_ACCESS_TOKEN": "your-token-here",
    "API_KEY": "your-api-key-here"
  }
}
```

### 4. Repository Filtering

**Archived Repositories**:
- Check `repo.archived` field from GitHub API
- Skip archived repos during discovery (don't add new entries)
- Preserve existing entries that become archived (don't remove)

**Inactive Repositories**:
- Check description for phrases: "no longer active", "deprecated", "archived", "unmaintained"
- Skip these repos during discovery
- Log skipped repos in summary

**Implementation**:
```typescript
function shouldSkipRepo(repo: GitHubRepo): boolean {
  // Skip archived repos
  if (repo.archived) {
    return true;
  }
  
  // Skip repos with inactive indicators in description
  const description = (repo.description || '').toLowerCase();
  const inactivePatterns = [
    'no longer active',
    'deprecated',
    'unmaintained',
    'not maintained',
  ];
  
  return inactivePatterns.some(pattern => description.includes(pattern));
}
```

### 5. Server Name Generation

**Strategy**: Transform package names into clean, user-friendly server names

**Transformation Rules**:
1. Remove scope prefix: `@org/package` → `package`
2. Remove common prefixes: `mcp-`, `server-`, `mcp-server-`
3. Remove common suffixes: `-mcp`, `-server`, `-mcp-server`
4. Replace hyphens/underscores with spaces
5. Keep lowercase (server names are typically lowercase)
6. Limit length to 50 characters

**Examples**:
```typescript
// Scoped packages
"@modelcontextprotocol/server-figma" → "figma"
"@anthropic/mcp-server-github" → "github"

// Prefixed packages
"mcp-server-notion" → "notion"
"server-mcp-slack" → "slack"

// Suffixed packages
"figma-mcp-server" → "figma"
"github-mcp" → "github"

// Complex names
"awesome-mcp-server-database" → "awesome database"
"my_cool_mcp_server" → "my cool"
```

**Uniqueness Handling**:
- Check if generated name already exists in entries
- If duplicate, append repo owner: `"figma-acme"`
- If still duplicate, append number: `"figma-2"`

### 6. InstallConfig Generation

**Complete Flow**:
```typescript
async function generateInstallConfig(
  octokit: Octokit,
  repo: GitHubRepo,
  readme: string
): Promise<InstallConfig | undefined> {
  // 1. Detect runtime
  const runtime = await detectRuntime(octokit, repo.owner.login, repo.name);
  if (runtime === 'unknown') {
    return undefined; // Skip if can't determine runtime
  }
  
  // 2. Get package name
  const packageName = await detectPackageName(octokit, repo.owner.login, repo.name, runtime);
  if (!packageName) {
    return undefined; // Skip if can't find package name
  }
  
  // 3. Generate server name
  const serverName = generateServerName(packageName);
  
  // 4. Parse environment variables
  const envVars = parseEnvVars(readme);
  
  // 5. Build config snippet
  const configSnippet = buildConfigSnippet(serverName, runtime, packageName, envVars);
  
  // 6. Generate installConfig for all IDEs
  return {
    cursor: {
      configSnippet,
      filePath: '~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json'
    },
    claudeDesktop: {
      configSnippet,
      filePath: '~/Library/Application Support/Claude/claude_desktop_config.json'
    },
    antigravity: {
      configSnippet,
      filePath: '~/.config/antigravity/config.json'
    },
    kiro: {
      configSnippet,
      filePath: '~/.kiro/mcp_settings.json'
    }
  };
}
```

**Config Snippet Format**:

*Node.js (npx) without env vars*:
```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-figma"]
    }
  }
}
```

*Python (uvx) with env vars*:
```json
{
  "mcpServers": {
    "github": {
      "command": "uvx",
      "args": ["mcp-server-github"],
      "env": {
        "GITHUB_TOKEN": "your-token-here"
      }
    }
  }
}
```

## Error Handling

### Missing Files

| Scenario | Handling |
|----------|----------|
| package.json not found | Try pyproject.toml, then setup.py |
| All runtime files missing | Skip installConfig, add entry without it, log info |
| package.json invalid JSON | Skip installConfig, add entry without it, log warning |
| package name missing | Skip installConfig, add entry without it, log warning |

### Invalid Data

| Scenario | Handling |
|----------|----------|
| Invalid package name format | Skip installConfig, add entry without it, log warning |
| Empty environment variables | Generate config without env section |
| README parsing fails | Generate config without env vars |
| Server name collision | Append owner name or number |

### API Errors

| Scenario | Handling |
|----------|----------|
| File fetch timeout | Retry 3 times, then skip installConfig |
| Rate limit exceeded | Use exponential backoff |
| Repository deleted | Skip entry entirely |
| Access denied (private repo) | Skip entry entirely |

**Philosophy**: Be permissive. Always try to add the entry, even if installConfig generation fails. Users can manually add installConfig later if needed.

## Testing Strategy

### Manual Testing

**Primary Testing Approach**: Manual validation with real MCP servers

**Test Cases**:
1. **Node.js Package Test**
   - Run discovery on `@modelcontextprotocol/server-figma`
   - Verify installConfig is generated
   - Verify server name is clean: `figma`
   - Test config in Kiro IDE

2. **Python Package Test**
   - Run discovery on a Python-based MCP server
   - Verify uvx command is used
   - Verify config works in IDE

3. **Environment Variables Test**
   - Find server requiring API keys
   - Verify env vars are detected in README
   - Verify placeholders are generated

4. **Archived Repository Test**
   - Verify archived repos are skipped
   - Check logs show "skipped: archived"

5. **Manual Config Preservation Test**
   - Run discovery on repo with existing manual installConfig
   - Verify manual config is NOT overwritten
   - Verify entry is still updated (description, tags, etc.)

6. **Error Handling Test**
   - Test repo without package.json/pyproject.toml
   - Verify entry is added WITHOUT installConfig
   - Verify no errors/crashes

**Validation Checklist**:
- [ ] Generated configs work in all 4 IDEs
- [ ] Server names are readable and clean
- [ ] Environment variables are detected (80%+ accuracy)
- [ ] Manual configs are never overwritten
- [ ] Archived repos are skipped
- [ ] Entries without installConfig are still added
- [ ] No API rate limit issues

**Future Testing**: Unit tests can be added incrementally as bugs are discovered or edge cases emerge.

## Performance Considerations

### API Request Optimization

**Current**: 1 request per repo (README only)  
**New**: 3-4 requests per repo (README + package.json + runtime detection)

**Mitigation**:
- Batch file existence checks
- Cache file existence results
- Use conditional requests (If-None-Match)
- Implement request pooling

**Estimated Impact**:
- Current: ~50 requests per run
- New: ~150-200 requests per run
- Still well within rate limit (5,000/hour)

### Processing Time

**Additional Processing**:
- File fetching: +2-3 seconds per repo
- Parsing: +0.1 seconds per repo
- Total increase: ~2-5 minutes per run

**Acceptable**: Workflow runs nightly, time increase is negligible

## Migration Strategy

### Existing Entries

**Approach**: Preserve all manual configs, never overwrite

**Rules**:
1. **If entry has installConfig**: NEVER update it (assume manual/curated)
2. **If entry lacks installConfig**: Generate it automatically
3. **Other fields**: Always update (name, description, tags, etc.)

**Implementation**:
```typescript
// In update-entries.ts
function mergeEntry(existing: Entry, discovered: Entry): Entry {
  return {
    ...existing,
    // Always update these fields
    name: discovered.name,
    shortDescription: discovered.shortDescription,
    fullDescription: discovered.fullDescription,
    tags: discovered.tags,
    author: discovered.author,
    sourceUrl: discovered.sourceUrl,
    
    // NEVER overwrite installConfig if it exists
    installConfig: existing.installConfig || discovered.installConfig,
    
    // Preserve other manual fields
    iconUrl: existing.iconUrl,
    usageSnippet: existing.usageSnippet,
  };
}
```

**Rationale**: Manual configs may have custom tweaks (specific versions, custom args, platform-specific paths). We respect human curation over automation.

### Rollout Plan

**Single Phase**: Generate for all entries in one go

**Steps**:
1. Implement utilities and integration
2. Run discovery script locally with dry-run
3. Review generated installConfigs manually
4. Commit and push to trigger workflow
5. Review PR, merge if configs look good
6. Monitor for issues, iterate as needed

**No Gradual Rollout**: Since we never overwrite manual configs, it's safe to enable for all entries immediately.

## Success Criteria

The implementation is successful when:

1. ✅ 90%+ of discovered MCP servers have installConfig generated
2. ✅ Generated configs work in all four IDEs without modification
3. ✅ Server names are clean and user-friendly
4. ✅ Environment variables are detected with 80%+ accuracy
5. ✅ No archived or inactive repos are added
6. ✅ API rate limits are not exceeded
7. ✅ Processing time increase is < 5 minutes per run
8. ✅ Manual configs are never overwritten

## Future Enhancements

**Potential Improvements**:

1. **Smart Environment Variable Detection**:
   - Use LLM to extract env vars from documentation
   - Detect required vs optional variables
   - Generate better placeholder descriptions

2. **Installation Instructions**:
   - Extract setup steps from README
   - Generate step-by-step installation guide
   - Include troubleshooting tips

3. **Version Detection**:
   - Track package versions
   - Notify when updates available
   - Generate version-specific configs

4. **Platform-Specific Paths**:
   - Detect user's OS
   - Show platform-specific file paths
   - Support Windows, macOS, Linux

## Timeline Estimate

**Implementation Phases**:

1. **Phase 1: Core Utilities** (2-3 hours)
   - `detect-package.ts` - Package name detection
   - `detect-runtime.ts` - Runtime detection (node/python)
   - `parse-env-vars.ts` - Environment variable parsing
   - `generate-server-name.ts` - Server name generation

2. **Phase 2: InstallConfig Generator** (1-2 hours)
   - `generate-install-config.ts` - Main orchestration
   - Config snippet building
   - IDE path mapping

3. **Phase 3: Integration** (1-2 hours)
   - Modify `discover-mcp-servers.ts`
   - Modify `transform-entry.ts`
   - Update `update-entries.ts` merge logic

4. **Phase 4: Testing & Refinement** (1-2 hours)
   - Manual testing with real repos
   - Edge case handling
   - Bug fixes

**Total Estimate:** 5-9 hours

**Note**: No unit test writing time since we're doing manual testing only.

## Conclusion

This enhancement significantly improves the user experience by providing ready-to-use installation configurations for all discovered MCP servers. The implementation balances automation with accuracy, ensuring high-quality configs while maintaining system performance and reliability.

