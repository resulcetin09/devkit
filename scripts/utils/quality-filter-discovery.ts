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