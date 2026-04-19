# MCP Server Auto-Discovery Workflow Design

**Date:** 2025-04-19  
**Status:** Approved  
**Author:** Kiro

## Overview

An automated GitHub Actions workflow that discovers MCP servers from GitHub, generates entries in the Devkit Entry format, and opens Pull Requests for review. The system runs nightly and supports manual triggering, ensuring all changes are reviewed before going live.

## Goals

1. Automatically discover MCP servers from GitHub (topic: mcp-server, minimum 10 stars)
2. Generate properly formatted Entry objects from repository metadata
3. Update existing entries with fresh data from GitHub
4. Create Pull Requests with detailed change summaries for manual review
5. Maintain type safety and validation throughout the process

## Architecture

### System Components

The system consists of three main components:

1. **Discovery Script** (`scripts/discover-mcp-servers.ts`)
   - Queries GitHub API for MCP servers
   - Fetches repository metadata and README content
   - Transforms data into Entry format
   - Identifies new and updated entries

2. **Update Script** (`scripts/update-entries.ts`)
   - Reads current entries.ts file
   - Applies discovered changes
   - Preserves file formatting and existing data
   - Generates change summary

3. **GitHub Actions Workflow** (`.github/workflows/auto-discover-mcp.yml`)
   - Scheduled execution (nightly at 00:00 UTC)
   - Manual trigger support (workflow_dispatch)
   - Orchestrates script execution
   - Creates Pull Requests with change summaries

### Data Flow

```
GitHub API
    ↓
Discovery Script (fetch & transform)
    ↓
Discovery Result (new + updated entries)
    ↓
Update Script (merge with existing)
    ↓
Updated entries.ts
    ↓
GitHub Actions (commit & PR)
    ↓
Pull Request (for manual review)
```

## Discovery Script Details

### GitHub API Integration

**Technology:** Octokit (official GitHub REST API client)

**Search Query:**
```
topic:mcp-server stars:>=10
```

**Data Fetched Per Repository:**
- Repository name, description, URL
- Owner information
- Topics (used as tags)
- README content (first paragraph)
- Star count (for filtering)

### Entry Transformation Logic

#### Name Generation

Transform repository names into human-readable titles:

**Rules:**
1. Remove common prefixes/suffixes: "mcp-", "server-", "-mcp", "-server"
2. Split on hyphens and underscores
3. Capitalize each word
4. Append "MCP" if not present

**Examples:**
- `mcp-server-figma` → `Figma MCP`
- `awesome-mcp-server` → `Awesome MCP Server`
- `github-mcp` → `GitHub MCP`
- `server-mcp-notion` → `Notion MCP`

#### ID Generation

Create URL-safe slugs from repository names:

**Rules:**
1. Convert to lowercase
2. Replace spaces and underscores with hyphens
3. Remove "mcp-server-" prefix if present
4. Ensure uniqueness

**Examples:**
- `mcp-server-figma` → `figma-mcp`
- `Awesome MCP Server` → `awesome-mcp-server`

#### Field Mapping

| Entry Field | Source | Fallback |
|-------------|--------|----------|
| `id` | Generated from repo name | - |
| `name` | Transformed repo name | - |
| `shortDescription` | Repository description | "No description provided" |
| `fullDescription` | First paragraph of README | Repository description |
| `category` | Always `'mcp-server'` | - |
| `tags` | Repository topics | Empty array |
| `author` | Repository owner login | - |
| `sourceUrl` | Repository HTML URL | - |
| `iconUrl` | Not set (undefined) | - |
| `installConfig` | Preserved if exists | undefined |

#### README Parsing

**Strategy:**
1. Fetch README via GitHub API (supports multiple formats: README.md, readme.md, README)
2. Extract first paragraph (text until first blank line or 500 characters)
3. Strip Markdown formatting (headers, links, bold, italic)
4. Clean whitespace and normalize line breaks
5. If README unavailable or parsing fails, use repository description

### Output Format

```typescript
interface DiscoveryResult {
  newEntries: Entry[];
  updatedEntries: Array<{
    id: string;
    changes: Partial<Entry>;
  }>;
  summary: {
    totalFound: number;
    newCount: number;
    updatedCount: number;
    skippedCount: number;
  };
}
```

## Update Script Details

### File Modification Strategy

**Approach:** Parse and regenerate entries.ts while preserving structure

**Steps:**
1. Read current entries.ts file
2. Parse RAW_ENTRIES array using TypeScript AST
3. Match entries by ID
4. Apply updates to existing entries
5. Append new entries (alphabetically sorted)
6. Regenerate file with preserved formatting
7. Write back to disk

### Update Logic

**For Existing Entries:**
- Match by `id` field
- Update: `name`, `shortDescription`, `fullDescription`, `tags`, `author`, `sourceUrl`
- Preserve: `category` (always 'mcp-server'), `installConfig` (if exists), `usageSnippet` (if exists)

**For New Entries:**
- Append to end of RAW_ENTRIES array
- Sort alphabetically by `id` before insertion
- Maintain consistent formatting

### Change Tracking

```typescript
interface UpdateSummary {
  added: string[];      // IDs of newly added entries
  updated: Array<{
    id: string;
    fields: string[];   // Names of changed fields
  }>;
  unchanged: number;    // Count of entries with no changes
}
```

## GitHub Actions Workflow

### Trigger Configuration

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at 00:00 UTC
  workflow_dispatch:      # Manual trigger via GitHub UI
```

### Workflow Steps

1. **Checkout Repository**
   - Uses: `actions/checkout@v4`
   - Fetch full history for proper git operations

2. **Setup Node.js**
   - Uses: `actions/setup-node@v4`
   - Version: 20.x
   - Cache: npm dependencies

3. **Install Dependencies**
   - Run: `npm ci`
   - Ensures reproducible builds

4. **Run Discovery Script**
   - Execute: `npm run discover-mcp`
   - Output: JSON file with discovery results

5. **Run Update Script**
   - Execute: `npm run update-entries`
   - Input: Discovery results JSON
   - Output: Updated entries.ts + summary JSON

6. **Commit Changes**
   - Configure git user (GitHub Actions bot)
   - Commit only if changes detected
   - Message: `chore: auto-discover MCP servers [YYYY-MM-DD]`

7. **Create Pull Request**
   - Uses: `peter-evans/create-pull-request@v6`
   - Branch: `auto-update-mcp-servers-YYYY-MM-DD`
   - Title: `🤖 Auto-discover MCP Servers - [Date]`
   - Body: Generated from update summary
   - Labels: `automated`, `mcp-servers`
   - Assignee: Repository owner

### Pull Request Format

**Title:**
```
🤖 Auto-discover MCP Servers - April 19, 2025
```

**Body Template:**
```markdown
## Summary

- **New entries:** 3
- **Updated entries:** 2
- **Total MCP servers:** 75

## New Entries

- **Figma MCP** (`figma-mcp`)
  - Description: Connect Claude to Figma files
  - Repository: https://github.com/example/mcp-server-figma
  - Stars: 45

- **Notion MCP** (`notion-mcp`)
  - Description: Access Notion databases via MCP
  - Repository: https://github.com/example/notion-mcp
  - Stars: 32

## Updated Entries

- **GitHub MCP** (`github-mcp`)
  - Changed: `shortDescription`, `tags`
  - Old description: "GitHub integration"
  - New description: "GitHub integration for Claude with full API access"

- **Slack MCP** (`slack-mcp`)
  - Changed: `fullDescription`, `author`

---

*This PR was automatically generated by the MCP Auto-Discovery workflow.*
*Please review changes before merging.*
```

### Special Behaviors

**No Changes Detected:**
- Workflow completes successfully
- No commit created
- No PR opened
- Logs indicate "No changes detected"

**Existing PR Open:**
- New commit added to existing branch
- PR updated with new changes
- Previous PR body preserved with update timestamp

**Conflicts Detected:**
- Workflow attempts automatic merge
- If conflicts occur, adds comment to PR requesting manual resolution
- Workflow marked as failed for visibility

## Error Handling

### API Rate Limiting

**GitHub API Limits:**
- Authenticated: 5,000 requests/hour
- Estimated usage: 50-100 requests per run

**Handling:**
- Use authenticated requests (GITHUB_TOKEN)
- Implement exponential backoff for rate limit errors
- Log remaining rate limit after each run
- Fail workflow if rate limit exceeded (will retry next scheduled run)

### Error Scenarios

| Scenario | Handling |
|----------|----------|
| README not found | Use repository description for fullDescription |
| Description empty | Use "No description provided" |
| Topics empty | Use empty tags array |
| Repository deleted | Skip entry (don't update) |
| API timeout | Retry 3 times with exponential backoff, then fail |
| Invalid entry data | Skip entry, log warning, include in PR summary |
| Parse error in entries.ts | Fail workflow, notify via GitHub issue |

### Validation

**Entry Validation:**
- Every generated entry validated with `validateEntries()` function
- Invalid entries skipped and logged
- Skipped entries listed in PR body under "Skipped Entries" section

**File Integrity:**
- TypeScript compilation check after update
- Syntax validation before commit
- Rollback if validation fails

### Conflict Resolution

**Scenario:** entries.ts modified manually while PR is open

**Handling:**
1. Workflow fetches latest main branch
2. Attempts to merge changes
3. If merge succeeds: Updates PR with new commit
4. If conflicts occur:
   - Adds comment to PR: "⚠️ Manual changes detected. Please resolve conflicts."
   - Marks workflow as failed
   - Requires manual intervention

## Testing Strategy

### Unit Tests

**Test Coverage:**
- Name transformation function
- ID generation function
- README parsing logic
- Entry field mapping
- Update merge logic

**Test Framework:** Vitest (existing project setup)

**Example Tests:**
```typescript
describe('transformRepoName', () => {
  it('removes mcp-server prefix', () => {
    expect(transformRepoName('mcp-server-figma')).toBe('Figma MCP');
  });
  
  it('capitalizes words', () => {
    expect(transformRepoName('awesome-mcp-server')).toBe('Awesome MCP Server');
  });
});
```

### Integration Tests

**Mock GitHub API:**
- Use Octokit mocking for API responses
- Test full discovery flow with sample data
- Verify entry generation from mock repositories

**File Operations:**
- Test entries.ts parsing and regeneration
- Verify formatting preservation
- Test update logic with various scenarios

### Local Testing

**Dry-run Mode:**
```bash
# Discover MCP servers without updating files
npm run discover-mcp -- --dry-run

# Show what would be updated without writing
npm run update-entries -- --dry-run
```

**Manual Execution:**
```bash
# Run full discovery and update locally
npm run discover-mcp
npm run update-entries

# Review changes before committing
git diff src/data/entries.ts
```

### CI Validation

**On Pull Request:**
- Run existing test suite
- TypeScript compilation check
- Entry validation check
- Lint checks

**Prevents:**
- Merging invalid entries
- Breaking TypeScript build
- Introducing syntax errors

## Dependencies

### New npm Packages

```json
{
  "dependencies": {
    "@octokit/rest": "^20.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0"
  }
}
```

### GitHub Actions

- `actions/checkout@v4`
- `actions/setup-node@v4`
- `peter-evans/create-pull-request@v6`

## Configuration

### Environment Variables

**GitHub Actions:**
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions
- No additional secrets required

### Script Configuration

**Configurable Parameters** (in scripts):
- Minimum star count: 10 (can be adjusted)
- Search topic: "mcp-server" (can be extended)
- Rate limit retry attempts: 3
- Timeout duration: 30 seconds per request

## Future Enhancements

**Potential Improvements** (not in initial scope):

1. **Intelligent Description Generation:**
   - Use LLM to generate better descriptions from README
   - Extract key features automatically

2. **InstallConfig Auto-generation:**
   - Parse package.json or setup instructions
   - Generate IDE-specific install configs

3. **Quality Scoring:**
   - Rank entries by stars, activity, documentation quality
   - Highlight high-quality servers

4. **Notification System:**
   - Slack/Discord notifications for new discoveries
   - Weekly summary emails

5. **Duplicate Detection:**
   - Identify similar/duplicate servers
   - Suggest merging or marking as alternatives

## Success Criteria

The implementation is successful when:

1. ✅ Workflow runs nightly without manual intervention
2. ✅ New MCP servers (10+ stars) are discovered within 24 hours
3. ✅ Existing entries are updated with latest GitHub data
4. ✅ Pull Requests contain accurate, reviewable change summaries
5. ✅ No invalid entries are added to entries.ts
6. ✅ TypeScript compilation never breaks
7. ✅ Manual trigger works for on-demand discovery
8. ✅ Zero false positives (non-MCP repos added)

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| GitHub API rate limit exceeded | Workflow fails | Use authenticated requests, implement backoff, monitor usage |
| Invalid data breaks build | Site deployment fails | Validation before commit, CI checks, rollback capability |
| Too many PRs (spam) | Review fatigue | Single daily PR, batch all changes, skip if no changes |
| Malicious repos added | Security/quality issues | Manual review required, star threshold, validation checks |
| README parsing errors | Poor descriptions | Fallback to repo description, manual correction in PR review |

## Timeline Estimate

**Implementation Phases:**

1. **Phase 1: Discovery Script** (4-6 hours)
   - GitHub API integration
   - Entry transformation logic
   - Unit tests

2. **Phase 2: Update Script** (3-4 hours)
   - File parsing and modification
   - Change tracking
   - Integration tests

3. **Phase 3: GitHub Actions** (2-3 hours)
   - Workflow configuration
   - PR template
   - Testing

4. **Phase 4: Testing & Refinement** (2-3 hours)
   - End-to-end testing
   - Edge case handling
   - Documentation

**Total Estimate:** 11-16 hours

## Conclusion

This design provides a robust, maintainable solution for automatically discovering and updating MCP server entries in the Devkit directory. The system balances automation with human oversight, ensuring quality while reducing manual maintenance burden.
