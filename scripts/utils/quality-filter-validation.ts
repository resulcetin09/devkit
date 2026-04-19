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