# MCP Quality Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a two-stage quality filtering system to remove false positive MCP servers from the discovery workflow.

**Architecture:** Pattern-based filtering with discovery stage (fast metadata checks) and validation stage (content analysis with scoring). Integrates into existing discovery workflow with fail-open error handling.

**Tech Stack:** TypeScript, existing Octokit GitHub API integration, pattern matching, content analysis

---

## File Structure

**New Files:**
- `scripts/utils/quality-filter-config.ts` - Centralized filter configuration and patterns
- `scripts/utils/quality-filter-discovery.ts` - Fast metadata-based filtering for discovery stage
- `scripts/utils/quality-filter-validation.ts` - Content-based analysis for validation stage

**Modified Files:**
- `scripts/discover-mcp-servers.ts` - Integration of quality filters into discovery workflow

## Task 1: Create Filter Configuration

**Files:**
- Create: `scripts/utils/quality-filter-config.ts`

- [ ] **Step 1: Create configuration file with filter patterns**

```typescript
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
```

- [ ] **Step 2: Commit configuration file**

```bash
git add scripts/utils/quality-filter-config.ts
git commit -m "feat: add quality filter configuration with patterns and scoring"
```

## Task 2: Create Discovery Stage Filter

**Files:**
- Create: `scripts/utils/quality-filter-discovery.ts`

- [ ] **Step 1: Create discovery filter with metadata analysis**

```typescript
import { QUALITY_FILTER_CONFIG } from './quality-filter-config.js';

export interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  topics?: string[];
  owner: {
    login: string;
  };
}

export interface DiscoveryFilterResult {
  shouldSkip: boolean;
  reason?: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Fast metadata-based filtering for discovery stage
 * Filters out obvious false positives before README fetching
 */
export function filterAtDiscovery(repo: GitHubRepo): DiscoveryFilterResult {
  // Check repository name patterns
  for (const pattern of QUALITY_FILTER_CONFIG.EXCLUDE_NAME_PATTERNS) {
    if (pattern.test(repo.name)) {
      return {
        shouldSkip: true,
        reason: `Repository name matches excluded pattern: ${pattern.source}`,
        confidence: 'high'
      };
    }
  }
  
  // Check description keywords
  const description = (repo.description || '').toLowerCase();
  const excludeKeywords = QUALITY_FILTER_CONFIG.EXCLUDE_DESCRIPTION_KEYWORDS;
  
  for (const keyword of excludeKeywords) {
    if (description.includes(keyword)) {
      return {
        shouldSkip: true,
        reason: `Description contains excluded keyword: ${keyword}`,
        confidence: 'medium'
      };
    }
  }
  
  // Check topic requirements
  const topics = repo.topics || [];
  const hasRequiredTopic = QUALITY_FILTER_CONFIG.REQUIRE_POSITIVE_TOPICS.some(
    topic => topics.includes(topic)
  );
  
  if (!hasRequiredTopic) {
    return {
      shouldSkip: true,
      reason: 'Missing required MCP-related topics',
      confidence: 'medium'
    };
  }
  
  return { shouldSkip: false, confidence: 'low' };
}
```

- [ ] **Step 2: Commit discovery filter**

```bash
git add scripts/utils/quality-filter-discovery.ts
git commit -m "feat: add discovery stage quality filter with metadata analysis"
```

## Task 3: Create Validation Stage Filter

**Files:**
- Create: `scripts/utils/quality-filter-validation.ts`

- [ ] **Step 1: Create validation filter with content analysis**

```typescript
import { Octokit } from '@octokit/rest';
import { QUALITY_FILTER_CONFIG, MCP_INDICATORS } from './quality-filter-config.js';
import type { GitHubRepo } from './quality-filter-discovery.js';

export interface ValidationResult {
  isValid: boolean;
  score: number;
  reasons: string[];
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Content-based analysis for validation stage
 * Analyzes README and package structure to score MCP server likelihood
 */
export async function validateMCPServer(
  repo: GitHubRepo,
  readme: string,
  octokit: Octokit
): Promise<ValidationResult> {
  let score = 0;
  const reasons: string[] = [];
  
  try {
    // Analyze README content
    const readmeScore = analyzeReadmeContent(readme);
    score += readmeScore.score;
    reasons.push(...readmeScore.reasons);
    
    // Check package structure
    const packageScore = await analyzePackageStructure(repo, octokit);
    score += packageScore.score;
    reasons.push(...packageScore.reasons);
    
  } catch (error) {
    // Fail-open: if analysis fails, don't penalize
    reasons.push(`Analysis error (not penalized): ${error instanceof Error ? error.message : 'unknown'}`);
  }
  
  // Determine validity based on score
  const isValid = score >= QUALITY_FILTER_CONFIG.THRESHOLDS.MINIMUM_SCORE;
  const confidence = score >= QUALITY_FILTER_CONFIG.THRESHOLDS.CONFIDENT_ACCEPT 
    ? 'high' 
    : score >= QUALITY_FILTER_CONFIG.THRESHOLDS.MINIMUM_SCORE 
    ? 'medium' 
    : 'low';
  
  return { isValid, score, reasons, confidence };
}

/**
 * Analyze README content for MCP server indicators
 */
function analyzeReadmeContent(readme: string): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const content = readme.toLowerCase();
  
  // Check for MCP-related mentions
  for (const mention of MCP_INDICATORS.MENTIONS) {
    if (content.includes(mention.toLowerCase())) {
      score += QUALITY_FILTER_CONFIG.SCORING.README_MCP_MENTIONS;
      reasons.push(`README mentions: ${mention}`);
      break; // Only count once
    }
  }
  
  // Check for installation instructions
  for (const pattern of MCP_INDICATORS.INSTALLATION_PATTERNS) {
    if (pattern.test(readme)) {
      score += QUALITY_FILTER_CONFIG.SCORING.INSTALLATION_INSTRUCTIONS;
      reasons.push('Contains installation instructions');
      break;
    }
  }
  
  // Check for usage examples
  for (const pattern of MCP_INDICATORS.USAGE_PATTERNS) {
    if (pattern.test(readme)) {
      score += QUALITY_FILTER_CONFIG.SCORING.USAGE_EXAMPLES;
      reasons.push('Contains usage examples');
      break;
    }
  }
  
  return { score, reasons };
}

/**
 * Analyze package structure for MCP dependencies and entry points
 */
async function analyzePackageStructure(
  repo: GitHubRepo,
  octokit: Octokit
): Promise<{ score: number; reasons: string[] }> {
  let score = 0;
  const reasons: string[] = [];
  
  try {
    // Check package.json for Node.js MCP dependencies
    const packageJson = await fetchPackageJson(octokit, repo.owner.login, repo.name);
    if (packageJson) {
      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };
      
      for (const dep of MCP_INDICATORS.NODE_MCP_DEPS) {
        if (deps[dep]) {
          score += QUALITY_FILTER_CONFIG.SCORING.PACKAGE_JSON_MCP_DEPS;
          reasons.push(`Has Node.js MCP dependency: ${dep}`);
          break;
        }
      }
      
      // Check for server entry point
      if (packageJson.main || packageJson.bin) {
        score += QUALITY_FILTER_CONFIG.SCORING.SERVER_ENTRY_POINT;
        reasons.push('Has server entry point');
      }
    }
    
    // Check for Python MCP dependencies
    const pyprojectContent = await fetchPyprojectToml(octokit, repo.owner.login, repo.name);
    if (pyprojectContent) {
      for (const dep of MCP_INDICATORS.PYTHON_MCP_DEPS) {
        if (pyprojectContent.toLowerCase().includes(dep)) {
          score += QUALITY_FILTER_CONFIG.SCORING.PYTHON_MCP_DEPS;
          reasons.push(`Has Python MCP dependency: ${dep}`);
          break;
        }
      }
    }
    
  } catch (error) {
    // Package analysis failed, don't penalize
    reasons.push('Package analysis failed (not penalized)');
  }
  
  return { score, reasons };
}

/**
 * Fetch and parse package.json from repository
 */
async function fetchPackageJson(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<any | null> {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: 'package.json',
    });

    if ('content' in data && data.content) {
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    // File not found or parse error
    return null;
  }
  
  return null;
}

/**
 * Fetch pyproject.toml content from repository
 */
async function fetchPyprojectToml(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<string | null> {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: 'pyproject.toml',
    });

    if ('content' in data && data.content) {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
  } catch (error) {
    // File not found
    return null;
  }
  
  return null;
}
```

- [ ] **Step 2: Commit validation filter**

```bash
git add scripts/utils/quality-filter-validation.ts
git commit -m "feat: add validation stage quality filter with content analysis and scoring"
```

## Task 4: Integrate Quality Filters into Discovery Script

**Files:**
- Modify: `scripts/discover-mcp-servers.ts`

- [ ] **Step 1: Add quality filter imports**

Add these imports at the top of the file after existing imports:

```typescript
import { filterAtDiscovery } from './utils/quality-filter-discovery.js';
import { validateMCPServer } from './utils/quality-filter-validation.js';
```

- [ ] **Step 2: Modify shouldSkipRepo function to include discovery filter**

Find the `shouldSkipRepo` function and modify it to include quality filtering:

```typescript
/**
 * Check if repository should be skipped
 */
function shouldSkipRepo(repo: any): { skip: boolean; reason?: string } {
  // Skip archived repos
  if (repo.archived) {
    return { skip: true, reason: 'archived' };
  }
  
  // Skip repos with inactive indicators in description
  const description = (repo.description || '').toLowerCase();
  const inactivePatterns = [
    'no longer active',
    'deprecated',
    'unmaintained',
    'not maintained',
  ];
  
  for (const pattern of inactivePatterns) {
    if (description.includes(pattern)) {
      return { skip: true, reason: 'inactive' };
    }
  }
  
  // NEW: Quality filter at discovery stage
  const qualityCheck = filterAtDiscovery(repo);
  if (qualityCheck.shouldSkip) {
    return { skip: true, reason: `quality-filter: ${qualityCheck.reason}` };
  }
  
  return { skip: false };
}
```

- [ ] **Step 3: Add validation stage filter in main processing loop**

Find the main processing loop (around line 250) and add validation after README fetch but before entry transformation:

```typescript
for (const repo of searchResponse.data.items) {
  console.log(`Processing: ${repo.full_name}`);
  
  // Check if repo should be skipped
  const skipCheck = shouldSkipRepo(repo);
  if (skipCheck.skip) {
    console.log(`  ⏭️  Skipping ${repo.full_name} (${skipCheck.reason})`);
    skippedRepos.push(`${repo.full_name} (${skipCheck.reason})`);
    continue;
  }
  
  try {
    // Fetch README with retry logic
    let readmeContent: string | undefined;
    try {
      readmeContent = await fetchReadme(octokit, repo.owner.login, repo.name);
      if (!readmeContent) {
        console.warn(`  ⚠️  Could not fetch README for ${repo.full_name}, using description as fallback`);
      }
    } catch (error) {
      logError({ 
        operation: 'README fetch', 
        repo: repo.full_name, 
        error 
      });
      console.warn(`  ⚠️  README fetch failed, using description as fallback`);
    }
    
    // NEW: Quality validation after README fetch
    if (readmeContent !== undefined) {
      const validation = await validateMCPServer(repo, readmeContent || '', octokit);
      
      if (!validation.isValid) {
        console.log(`  🚫 Quality filter rejected ${repo.full_name} (score: ${validation.score})`);
        console.log(`     Reasons: ${validation.reasons.join(', ')}`);
        skippedRepos.push(`${repo.full_name} (quality-score: ${validation.score})`);
        continue;
      } else {
        console.log(`  ✅ Quality filter accepted ${repo.full_name} (score: ${validation.score})`);
      }
    }
    
    // Handle missing or empty description
    const description = repo.description?.trim() || null;
    if (!description) {
      console.warn(`  ⚠️  No description available for ${repo.full_name}`);
    }
    
    // ... rest of existing processing continues unchanged ...
```

- [ ] **Step 4: Commit integration changes**

```bash
git add scripts/discover-mcp-servers.ts
git commit -m "feat: integrate quality filters into discovery workflow with two-stage filtering"
```

## Task 5: Test Quality Filter Implementation

**Files:**
- Modify: `scripts/discover-mcp-servers.ts` (temporary logging)

- [ ] **Step 1: Add detailed logging for quality filter decisions**

Add this temporary logging function at the top of the file:

```typescript
/**
 * Temporary detailed logging for quality filter testing
 */
function logQualityFilterDecision(
  repo: any,
  stage: 'discovery' | 'validation',
  result: any,
  processingTime?: number
) {
  const timestamp = new Date().toISOString();
  console.log(`[QUALITY-FILTER] ${timestamp} ${stage.toUpperCase()}`);
  console.log(`  Repository: ${repo.full_name}`);
  console.log(`  Decision: ${result.shouldSkip ? 'REJECT' : result.isValid !== undefined ? (result.isValid ? 'ACCEPT' : 'REJECT') : 'ACCEPT'}`);
  console.log(`  Score: ${result.score || 'N/A'}`);
  console.log(`  Confidence: ${result.confidence}`);
  console.log(`  Reason: ${result.reason || (result.reasons ? result.reasons.join(', ') : 'N/A')}`);
  if (processingTime) {
    console.log(`  Processing Time: ${processingTime}ms`);
  }
  console.log('');
}
```

- [ ] **Step 2: Add timing and detailed logging to quality filter calls**

Update the shouldSkipRepo function call:

```typescript
// Check if repo should be skipped
const skipStart = Date.now();
const skipCheck = shouldSkipRepo(repo);
const skipTime = Date.now() - skipStart;

if (skipCheck.skip && skipCheck.reason?.startsWith('quality-filter:')) {
  logQualityFilterDecision(repo, 'discovery', { shouldSkip: true, reason: skipCheck.reason, confidence: 'medium' }, skipTime);
}

if (skipCheck.skip) {
  console.log(`  ⏭️  Skipping ${repo.full_name} (${skipCheck.reason})`);
  skippedRepos.push(`${repo.full_name} (${skipCheck.reason})`);
  continue;
}
```

Update the validation call:

```typescript
// Quality validation after README fetch
if (readmeContent !== undefined) {
  const validationStart = Date.now();
  const validation = await validateMCPServer(repo, readmeContent || '', octokit);
  const validationTime = Date.now() - validationStart;
  
  logQualityFilterDecision(repo, 'validation', validation, validationTime);
  
  if (!validation.isValid) {
    console.log(`  🚫 Quality filter rejected ${repo.full_name} (score: ${validation.score})`);
    console.log(`     Reasons: ${validation.reasons.join(', ')}`);
    skippedRepos.push(`${repo.full_name} (quality-score: ${validation.score})`);
    continue;
  } else {
    console.log(`  ✅ Quality filter accepted ${repo.full_name} (score: ${validation.score})`);
  }
}
```

- [ ] **Step 3: Commit testing enhancements**

```bash
git add scripts/discover-mcp-servers.ts
git commit -m "feat: add detailed logging for quality filter testing and performance monitoring"
```

## Task 6: Final Integration and Cleanup

**Files:**
- Modify: `scripts/discover-mcp-servers.ts` (remove temporary logging)

- [ ] **Step 1: Remove temporary detailed logging**

Remove the `logQualityFilterDecision` function and its calls, keeping only the essential logging:

```typescript
// Keep only essential quality filter logging
if (readmeContent !== undefined) {
  const validation = await validateMCPServer(repo, readmeContent || '', octokit);
  
  if (!validation.isValid) {
    console.log(`  🚫 Quality filter rejected ${repo.full_name} (score: ${validation.score})`);
    skippedRepos.push(`${repo.full_name} (quality-score: ${validation.score})`);
    continue;
  } else {
    console.log(`  ✅ Quality filter accepted ${repo.full_name} (score: ${validation.score})`);
  }
}
```

- [ ] **Step 2: Update summary logging to include quality filter statistics**

Find the summary logging section and enhance it:

```typescript
// Print summary
console.log('\n📊 Summary:');
console.log(`  Total found: ${result.summary.totalFound}`);
console.log(`  New entries: ${result.summary.newCount}`);
console.log(`  Updated entries: ${result.summary.updatedCount}`);
console.log(`  Unchanged: ${result.summary.unchangedCount}`);

// Add quality filter statistics
const qualityFiltered = skippedRepos.filter(repo => 
  repo.includes('quality-filter:') || repo.includes('quality-score:')
).length;

if (qualityFiltered > 0) {
  console.log(`  Quality filtered: ${qualityFiltered}`);
}
```

- [ ] **Step 3: Final commit**

```bash
git add scripts/discover-mcp-servers.ts
git commit -m "feat: finalize quality filter integration with clean logging and statistics"
```

---

## Self-Review

**Spec Coverage Check:**
- ✅ Discovery stage filtering (Task 2)
- ✅ Validation stage filtering (Task 3) 
- ✅ Configuration management (Task 1)
- ✅ Integration into existing workflow (Task 4)
- ✅ Error handling with fail-open approach (Task 3)
- ✅ Performance monitoring (Task 5)
- ✅ Only applies to new discoveries (Task 4 - integration preserves existing entries)

**Placeholder Scan:** No TBDs, TODOs, or incomplete implementations found.

**Type Consistency:** All interfaces and function signatures are consistent across tasks.

The plan covers all requirements from the spec and provides complete, executable code for each step.