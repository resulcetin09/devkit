# MCP Server Quality Filter Design

**Date:** 2025-04-19  
**Status:** Approved  
**Author:** Kiro  
**Related:** MCP Auto-Discovery Workflow

## Overview

A two-stage quality filtering system for the MCP server discovery workflow that identifies and filters out repositories tagged with `mcp-server` that are not genuine MCP servers. The system addresses quality issues where frameworks, documentation, API tools, and unrelated projects are incorrectly tagged as MCP servers.

## Problem Statement

The current MCP auto-discovery system finds many false positives:
- General API tools/wrappers that aren't MCP-compliant
- Frameworks or libraries for building MCP servers (not servers themselves)  
- Documentation or tutorial repositories
- Completely unrelated projects that misuse the `mcp-server` tag

This degrades the quality of the Devkit directory and creates noise for users looking for actual MCP servers.

## Goals

1. **Filter false positives** - Remove non-genuine MCP servers from discovery results
2. **Maintain quality** - Ensure directory contains only working MCP servers
3. **Preserve existing entries** - Only apply filtering to newly discovered repositories
4. **Moderate strictness** - Filter most false positives while allowing borderline legitimate servers
5. **Performance** - Minimize impact on discovery workflow execution time

## Architecture

### Two-Stage Filtering Approach

**Stage 1: Discovery Filter** (Fast metadata-based filtering)
- Applied before README fetching and processing
- Uses repository metadata (name, description, topics, owner)
- Skips obviously invalid repositories to save API calls
- Fail-fast approach for clear false positives

**Stage 2: Validation Filter** (Content-based analysis)
- Applied after README fetching but before entry creation
- Analyzes README content and repository structure
- Uses scoring system for nuanced decisions
- More sophisticated analysis with full context

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Search Results                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Discovery Stage Filter                        │
│  • Repository name patterns                                │
│  • Description keyword filtering                           │
│  • Topic combination validation                            │
│  • Owner/organization checks                               │
└─────────────────────┬───────────────────────────────────────┘
                      │ (Pass: Continue processing)
                      │ (Fail: Skip with reason logged)
┌─────────────────────▼───────────────────────────────────────┐
│                README Fetch & Processing                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Validation Stage Filter                       │
│  • README content analysis                                 │
│  • Package structure validation                            │
│  • Installation instruction detection                      │
│  • MCP server indicator scoring                            │
└─────────────────────┬───────────────────────────────────────┘
                      │ (Score >= threshold: Accept)
                      │ (Score < threshold: Reject with reason)
┌─────────────────────▼───────────────────────────────────────┐
│                   Entry Creation                           │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Details

### 1. Filter Configuration

**File**: `scripts/utils/quality-filter-config.ts`

Centralized configuration for all filter rules and thresholds:

```typescript
export const QUALITY_FILTER_CONFIG = {
  // Discovery stage patterns
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
  ],
  
  EXCLUDE_DESCRIPTION_KEYWORDS: [
    'framework', 'library', 'sdk', 'client', 'template',
    'tutorial', 'documentation', 'docs', 'example',
    'awesome', 'list', 'collection', 'resources',
  ],
  
  REQUIRE_POSITIVE_TOPICS: [
    'mcp-server', 'model-context-protocol', 'mcp-tools',
  ],
  
  // Validation stage scoring
  SCORING: {
    README_MCP_MENTIONS: 10,
    INSTALLATION_INSTRUCTIONS: 15,
    PACKAGE_JSON_MCP_DEPS: 20,
    TOOL_DEFINITIONS: 25,
    SERVER_ENTRY_POINT: 20,
    USAGE_EXAMPLES: 10,
  },
  
  THRESHOLDS: {
    MINIMUM_SCORE: 30,
    CONFIDENT_ACCEPT: 60,
  },
};
```

### 2. Discovery Stage Filter

**File**: `scripts/utils/quality-filter-discovery.ts`

Fast metadata-based filtering:

```typescript
export interface DiscoveryFilterResult {
  shouldSkip: boolean;
  reason?: string;
  confidence: 'high' | 'medium' | 'low';
}

export function filterAtDiscovery(repo: GitHubRepo): DiscoveryFilterResult {
  // Check repository name patterns
  for (const pattern of QUALITY_FILTER_CONFIG.EXCLUDE_NAME_PATTERNS) {
    if (pattern.test(repo.name)) {
      return {
        shouldSkip: true,
        reason: `Repository name matches excluded pattern: ${pattern}`,
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

### 3. Validation Stage Filter

**File**: `scripts/utils/quality-filter-validation.ts`

Content-based analysis with scoring:

```typescript
export interface ValidationResult {
  isValid: boolean;
  score: number;
  reasons: string[];
  confidence: 'high' | 'medium' | 'low';
}

export async function validateMCPServer(
  repo: GitHubRepo,
  readme: string,
  octokit: Octokit
): Promise<ValidationResult> {
  let score = 0;
  const reasons: string[] = [];
  
  // Analyze README content
  const readmeScore = analyzeReadmeContent(readme);
  score += readmeScore.score;
  reasons.push(...readmeScore.reasons);
  
  // Check package structure
  const packageScore = await analyzePackageStructure(repo, octokit);
  score += packageScore.score;
  reasons.push(...packageScore.reasons);
  
  // Determine validity
  const isValid = score >= QUALITY_FILTER_CONFIG.THRESHOLDS.MINIMUM_SCORE;
  const confidence = score >= QUALITY_FILTER_CONFIG.THRESHOLDS.CONFIDENT_ACCEPT 
    ? 'high' 
    : score >= QUALITY_FILTER_CONFIG.THRESHOLDS.MINIMUM_SCORE 
    ? 'medium' 
    : 'low';
  
  return { isValid, score, reasons, confidence };
}

function analyzeReadmeContent(readme: string): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const content = readme.toLowerCase();
  
  // Check for MCP-related mentions
  const mcpMentions = [
    'model context protocol',
    'mcp server',
    'mcp-server',
    'claude mcp',
    'anthropic mcp',
  ];
  
  for (const mention of mcpMentions) {
    if (content.includes(mention)) {
      score += QUALITY_FILTER_CONFIG.SCORING.README_MCP_MENTIONS;
      reasons.push(`README mentions: ${mention}`);
      break; // Only count once
    }
  }
  
  // Check for installation instructions
  const installPatterns = [
    /npm install/i,
    /pip install/i,
    /uvx/i,
    /npx/i,
    /installation/i,
    /getting started/i,
  ];
  
  for (const pattern of installPatterns) {
    if (pattern.test(readme)) {
      score += QUALITY_FILTER_CONFIG.SCORING.INSTALLATION_INSTRUCTIONS;
      reasons.push('Contains installation instructions');
      break;
    }
  }
  
  // Check for usage examples
  const usagePatterns = [
    /usage/i,
    /example/i,
    /how to use/i,
    /configuration/i,
  ];
  
  for (const pattern of usagePatterns) {
    if (pattern.test(readme)) {
      score += QUALITY_FILTER_CONFIG.SCORING.USAGE_EXAMPLES;
      reasons.push('Contains usage examples');
      break;
    }
  }
  
  return { score, reasons };
}

async function analyzePackageStructure(
  repo: GitHubRepo,
  octokit: Octokit
): Promise<{ score: number; reasons: string[] }> {
  let score = 0;
  const reasons: string[] = [];
  
  try {
    // Check package.json for MCP dependencies
    const packageJson = await fetchPackageJson(octokit, repo.owner.login, repo.name);
    if (packageJson) {
      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };
      
      const mcpDeps = [
        '@modelcontextprotocol/sdk',
        'mcp',
        '@anthropic/mcp',
      ];
      
      for (const dep of mcpDeps) {
        if (deps[dep]) {
          score += QUALITY_FILTER_CONFIG.SCORING.PACKAGE_JSON_MCP_DEPS;
          reasons.push(`Has MCP dependency: ${dep}`);
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
    const pyprojectToml = await fetchPyprojectToml(octokit, repo.owner.login, repo.name);
    if (pyprojectToml) {
      const pythonMcpDeps = [
        'mcp',
        'model-context-protocol',
        'anthropic-mcp',
      ];
      
      for (const dep of pythonMcpDeps) {
        if (pyprojectToml.includes(dep)) {
          score += QUALITY_FILTER_CONFIG.SCORING.PACKAGE_JSON_MCP_DEPS;
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
```

### 4. Integration Points

**Modified**: `scripts/discover-mcp-servers.ts`

Integration into existing discovery workflow:

```typescript
// Import quality filters
import { filterAtDiscovery } from './utils/quality-filter-discovery.js';
import { validateMCPServer } from './utils/quality-filter-validation.js';

// Modify shouldSkipRepo function
function shouldSkipRepo(repo: any): { skip: boolean; reason?: string } {
  // Existing checks (archived, inactive)
  // ... existing code ...
  
  // NEW: Quality filter at discovery stage
  const qualityCheck = filterAtDiscovery(repo);
  if (qualityCheck.shouldSkip) {
    return { skip: true, reason: `quality-filter: ${qualityCheck.reason}` };
  }
  
  return { skip: false };
}

// Add validation after README fetch
for (const repo of searchResponse.data.items) {
  // ... existing processing ...
  
  // NEW: Quality validation after README fetch
  if (readmeContent !== undefined) {
    const validation = await validateMCPServer(repo, readmeContent, octokit);
    
    if (!validation.isValid) {
      console.log(`  🚫 Quality filter rejected ${repo.full_name} (score: ${validation.score})`);
      console.log(`     Reasons: ${validation.reasons.join(', ')}`);
      skippedRepos.push(`${repo.full_name} (quality-score: ${validation.score})`);
      continue;
    } else {
      console.log(`  ✅ Quality filter accepted ${repo.full_name} (score: ${validation.score})`);
    }
  }
  
  // ... continue with existing entry transformation ...
}
```

## Error Handling & Logging

### Fail-Open Philosophy

The quality filter uses a "fail-open" approach:
- If filter analysis fails, default to accepting the repository
- Log errors for debugging but don't block legitimate servers
- Graceful degradation when README or package analysis fails

### Detailed Logging

```typescript
interface QualityFilterLog {
  repoName: string;
  stage: 'discovery' | 'validation';
  decision: 'accept' | 'reject' | 'error';
  score?: number;
  reasons: string[];
  confidence: 'high' | 'medium' | 'low';
  processingTime: number;
}
```

### Monitoring & Metrics

Track filter effectiveness:
- Repositories filtered at each stage
- Score distributions
- False positive/negative rates (manual review)
- Processing time impact

## Configuration & Tuning

### Adjustable Parameters

All filter criteria are configurable:
- Pattern lists (easy to add/remove patterns)
- Scoring weights (adjust importance of different signals)
- Thresholds (tune strictness level)
- Keyword lists (expand based on observed false positives)

### Testing & Validation

**Unit Tests**:
- Individual filter functions with known examples
- Edge cases and boundary conditions
- Performance benchmarks

**Integration Tests**:
- End-to-end filtering with real repositories
- Known false positives should be filtered
- Known legitimate servers should pass

**Manual Validation**:
- Review filtered repositories for accuracy
- Adjust thresholds based on results
- Monitor directory quality improvements

## Performance Impact

### Expected Overhead

**Discovery Stage**: Minimal (< 1ms per repository)
- Simple pattern matching and keyword checks
- No additional API calls

**Validation Stage**: Moderate (< 100ms per repository)
- README content analysis
- Optional package.json fetching (already done for installConfig)
- Scoring calculations

**Total Impact**: < 5% increase in discovery workflow time

### Optimization Strategies

- Cache package.json analysis results
- Parallel processing where possible
- Early termination for high-confidence decisions
- Configurable timeout for package analysis

## Success Criteria

The quality filter is successful when:

1. **Reduces false positives** by 80%+ in new discoveries
2. **Maintains legitimate servers** - no more than 5% false negatives
3. **Performance impact** < 10% increase in discovery time
4. **Maintainable** - easy to adjust filters based on new patterns
5. **Observable** - clear logging of filter decisions for debugging

## Future Enhancements

**Potential Improvements**:

1. **Machine Learning Scoring** - Train model on manually labeled examples
2. **Community Feedback** - Allow users to report false positives/negatives
3. **Automated Pattern Discovery** - Analyze rejected repos to find new patterns
4. **Quality Scoring API** - Expose quality scores in directory UI
5. **Whitelist/Blacklist** - Manual overrides for specific repositories

## Rollout Plan

**Phase 1**: Implement and test with dry-run mode
**Phase 2**: Deploy with conservative thresholds
**Phase 3**: Monitor and tune based on results
**Phase 4**: Gradually increase strictness as confidence grows

## Conclusion

The MCP Server Quality Filter provides a robust, maintainable solution for improving directory quality while preserving the automated discovery workflow's efficiency. The two-stage approach balances performance with accuracy, and the configurable design allows for continuous improvement based on observed patterns.