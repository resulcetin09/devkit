/**
 * Environment variable detection patterns
 * Matches common patterns for environment variables in README files
 */
const ENV_VAR_PATTERNS = [
  // Variables ending with common suffixes (API_KEY, TOKEN, etc.)
  /\b([A-Z][A-Z0-9_]*(?:_KEY|_TOKEN|_SECRET|_API_KEY|_ACCESS_TOKEN))\b/g,
  // Export statements
  /export\s+([A-Z][A-Z0-9_]+)=/g,
  // Shell variable references ${VAR} or $VAR
  /\$\{?([A-Z][A-Z0-9_]+)\}?/g,
  // Node.js process.env references
  /process\.env\.([A-Z][A-Z0-9_]+)/g,
  // Python os.environ references
  /os\.environ\[["']([A-Z][A-Z0-9_]+)["']\]/g,
  // General uppercase variables (more permissive)
  /\b([A-Z][A-Z0-9_]{2,})\b/g,
];

/**
 * Parses environment variables from README content
 * @param readme - README content as string
 * @returns Object with variable names as keys and placeholder values
 */
export function parseEnvVars(readme: string): Record<string, string> {
  if (!readme || readme.trim().length === 0) {
    return {};
  }

  const envVars = new Set<string>();

  // Apply all patterns to find environment variables
  for (const pattern of ENV_VAR_PATTERNS) {
    let match;
    while ((match = pattern.exec(readme)) !== null) {
      const varName = match[1];
      if (varName && isLikelyEnvVar(varName)) {
        envVars.add(varName);
      }
    }
  }

  // Convert to object with placeholder values
  const result: Record<string, string> = {};
  const varArray = Array.from(envVars);
  for (const varName of varArray) {
    result[varName] = generatePlaceholder(varName);
  }

  return result;
}

/**
 * Generates appropriate placeholder value based on variable name
 * @param varName - Environment variable name
 * @returns Placeholder value string
 */
export function generatePlaceholder(varName: string): string {
  const name = varName.toLowerCase();

  if (name.includes('token')) {
    return 'your-token-here';
  }
  
  if (name.includes('key')) {
    return 'your-api-key-here';
  }
  
  if (name.includes('secret')) {
    return 'your-secret-here';
  }
  
  if (name.includes('url')) {
    return 'https://example.com';
  }
  
  if (name.includes('host') || name.includes('endpoint')) {
    return 'https://api.example.com';
  }
  
  if (name.includes('port')) {
    return '3000';
  }
  
  if (name.includes('database') || name.includes('db')) {
    return 'your-database-url';
  }
  
  if (name.includes('email')) {
    return 'user@example.com';
  }
  
  if (name.includes('user') || name.includes('username')) {
    return 'your-username';
  }
  
  if (name.includes('password') || name.includes('pass')) {
    return 'your-password';
  }

  // Default placeholder
  return 'your-value-here';
}

/**
 * Checks if a string is likely an environment variable
 * Filters out common false positives
 */
function isLikelyEnvVar(varName: string): boolean {
  // Must be at least 3 characters
  if (varName.length < 3) {
    return false;
  }

  // Filter out common false positives
  const falsePositives = [
    'THE', 'AND', 'FOR', 'YOU', 'ARE', 'NOT', 'BUT', 'CAN', 'ALL', 'ANY',
    'NEW', 'OLD', 'GET', 'SET', 'PUT', 'POST', 'DELETE', 'HEAD', 'OPTIONS',
    'HTTP', 'HTTPS', 'JSON', 'XML', 'HTML', 'CSS', 'JS', 'TS', 'MD',
    'README', 'LICENSE', 'TODO', 'FIXME', 'NOTE', 'WARNING', 'ERROR',
    'TRUE', 'FALSE', 'NULL', 'UNDEFINED', 'NAN', 'INFINITY',
    'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
  ];

  if (falsePositives.includes(varName)) {
    return false;
  }

  // Must contain at least one underscore or end with common env var suffixes
  const hasUnderscore = varName.includes('_');
  const hasCommonSuffix = /_(KEY|TOKEN|SECRET|URL|HOST|PORT|USER|PASS|ID|NAME|PATH|DIR)$/.test(varName);
  const isCommonEnvVar = /^(API_|DB_|DATABASE_|REDIS_|MONGO_|POSTGRES_|MYSQL_|AWS_|GOOGLE_|GITHUB_|SLACK_|DISCORD_|OPENAI_|ANTHROPIC_)/.test(varName);

  return hasUnderscore || hasCommonSuffix || isCommonEnvVar;
}