import type { Entry } from '../types/entry';

export const CONTRIBUTION_URL =
  'https://github.com/your-org/devkit/compare?template=add_entry.md';

export const RAW_ENTRIES: unknown[] = [
  {
    id: 'code-reviewer',
    name: 'Code Reviewer',
    shortDescription: 'Performs thorough code reviews with actionable feedback on style, correctness, and performance.',
    fullDescription: `Code Reviewer is a Claude skill that brings senior-engineer-level scrutiny to any diff or file. It checks for logic errors, naming conventions, potential security issues, and performance anti-patterns. Feedback is structured as inline comments grouped by severity (blocking, suggestion, nit), making it easy to triage and act on.

The skill understands context from surrounding code and can reference project-specific conventions when a style guide is provided in the system prompt.`,
    category: 'skill',
    tags: ['code-quality', 'review', 'productivity', 'engineering'],
    sourceUrl: 'https://github.com/anthropics/claude-skills/tree/main/code-reviewer',
    author: 'Anthropic',
    usageSnippet: `// Add to your Claude system prompt:
You have access to the Code Reviewer skill.
When asked to review code, use structured feedback with severity levels:
- BLOCKING: must fix before merge
- SUGGESTION: recommended improvement
- NIT: minor style preference`,
  },
  {
    id: 'sql-agent',
    name: 'SQL Agent',
    shortDescription: 'Translates natural language questions into safe, optimized SQL queries against your schema.',
    fullDescription: `SQL Agent lets you query databases using plain English. Provide your schema (as CREATE TABLE statements or a JSON schema description) and ask questions like "Which customers placed more than 3 orders last month?" — the skill generates the corresponding SQL, explains its reasoning, and flags any assumptions it made.

Supports PostgreSQL, MySQL, SQLite, and BigQuery dialects. Includes a dry-run mode that explains what a query would do without executing it, and a safety layer that refuses to generate destructive statements (DROP, TRUNCATE, DELETE without WHERE) unless explicitly unlocked.`,
    category: 'skill',
    tags: ['database', 'sql', 'analytics', 'productivity'],
    sourceUrl: 'https://github.com/example-org/sql-agent-skill',
    author: 'DataTools OSS',
    usageSnippet: `// System prompt setup:
You have access to the SQL Agent skill.
Schema context:
  CREATE TABLE orders (id SERIAL PRIMARY KEY, customer_id INT, total NUMERIC, created_at TIMESTAMPTZ);
  CREATE TABLE customers (id SERIAL PRIMARY KEY, email TEXT, name TEXT);

Translate user questions to SQL. Always explain your query before showing it.`,
  },
  {
    id: 'diagram-generator',
    name: 'Diagram Generator',
    shortDescription: 'Converts architecture descriptions and code into Mermaid or PlantUML diagrams.',
    fullDescription: `Diagram Generator takes prose descriptions of systems, codebases, or workflows and produces clean, accurate diagrams in Mermaid or PlantUML syntax. It can also reverse-engineer diagrams from source code — paste a set of TypeScript files and get a class diagram or dependency graph back.

Supports: flowcharts, sequence diagrams, entity-relationship diagrams, class diagrams, state machines, and Gantt charts. Output is copy-paste ready for GitHub Markdown, Notion, Confluence, or any tool that renders Mermaid.`,
    category: 'skill',
    tags: ['diagrams', 'documentation', 'architecture', 'visualization'],
    sourceUrl: 'https://github.com/example-org/diagram-generator',
    author: 'Mira Okonkwo',
    usageSnippet: `// Example prompt:
"Generate a sequence diagram for our OAuth2 login flow:
 1. User clicks Login
 2. App redirects to /authorize
 3. Auth server returns code
 4. App exchanges code for token at /token
 5. App stores token and redirects to dashboard"`,
  },
  {
    id: 'filesystem-mcp',
    name: 'Filesystem MCP',
    shortDescription: 'Exposes local filesystem read/write operations to Claude via the Model Context Protocol.',
    fullDescription: `Filesystem MCP is a lightweight MCP server that gives Claude controlled access to your local filesystem. It exposes tools for reading files, listing directories, writing content, and moving or deleting files — all scoped to a configurable root directory so Claude can never escape the sandbox.

Ideal for agentic workflows where Claude needs to read source files, write generated output, or manage project assets without requiring manual copy-paste. Supports glob patterns for batch reads and an optional dry-run flag for write operations.`,
    category: 'mcp-server',
    tags: ['filesystem', 'files', 'local', 'agentic'],
    sourceUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
    author: 'Anthropic',
    usageSnippet: `# Install and run via npx:
npx @modelcontextprotocol/server-filesystem /path/to/allowed/root

# Or add to your MCP config:
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/you/projects"]
    }
  }
}`,
  },
  {
    id: 'github-mcp',
    name: 'GitHub MCP',
    shortDescription: 'Connects Claude to the GitHub API for reading repos, issues, PRs, and triggering workflows.',
    fullDescription: `GitHub MCP bridges Claude and the GitHub REST API, exposing tools for searching repositories, reading file contents, listing and creating issues, reviewing pull requests, and triggering GitHub Actions workflows.

Authentication is handled via a personal access token or GitHub App credentials stored in environment variables — never passed through the conversation. Supports both github.com and GitHub Enterprise Server endpoints. Rate limiting is handled transparently with automatic retry and backoff.`,
    category: 'mcp-server',
    tags: ['github', 'git', 'devops', 'code', 'ci-cd'],
    sourceUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github',
    author: 'Anthropic',
    usageSnippet: `# Set your token:
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_...

# Add to MCP config:
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "\${GITHUB_PERSONAL_ACCESS_TOKEN}" }
    }
  }
}`,
  },
  {
    id: 'web-search-mcp',
    name: 'Web Search MCP',
    shortDescription: 'Gives Claude real-time web search via Brave Search API with structured result summaries.',
    fullDescription: `Web Search MCP connects Claude to the Brave Search API, enabling real-time web queries during conversations. Results are returned as structured objects (title, URL, snippet, published date) rather than raw HTML, making them easy for Claude to reason over and cite.

Supports standard web search, news search, and image search. Includes a configurable result count (1–20), safe-search toggle, and country/language targeting. Results are automatically deduplicated and ranked by relevance score.`,
    category: 'mcp-server',
    tags: ['search', 'web', 'real-time', 'research'],
    sourceUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search',
    author: 'Anthropic',
    usageSnippet: `# Requires a Brave Search API key (free tier available):
export BRAVE_API_KEY=BSA...

{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": { "BRAVE_API_KEY": "\${BRAVE_API_KEY}" }
    }
  }
}`,
  },
  {
    id: 'test-writer',
    name: 'Test Writer',
    shortDescription: 'Generates comprehensive unit and integration tests from source code or function signatures.',
    fullDescription: `Test Writer analyzes your source code and produces a thorough test suite covering happy paths, edge cases, and error conditions. It understands common testing frameworks (Jest, Vitest, pytest, Go testing, RSpec) and generates idiomatic tests that match your project's existing style.

Provide a function, class, or module and Test Writer will identify the key behaviors to verify, write test cases with descriptive names, and add inline comments explaining the intent of non-obvious assertions. It can also identify gaps in an existing test suite and suggest additional cases.`,
    category: 'skill',
    tags: ['testing', 'code-quality', 'productivity', 'engineering'],
    sourceUrl: 'https://github.com/example-org/test-writer-skill',
    author: 'Priya Nair',
    usageSnippet: `// Prompt example:
"Write Vitest unit tests for this function:

export function filterEntries(entries: Entry[], state: FilterState): Entry[] {
  // ... implementation
}

Cover: empty input, no matching results, case-insensitive search,
category filter, tag filter, combined filters."`,
  },
  {
    id: 'postgres-mcp',
    name: 'PostgreSQL MCP',
    shortDescription: 'Connects Claude directly to a PostgreSQL database for schema inspection and safe read queries.',
    fullDescription: `PostgreSQL MCP gives Claude a live connection to your Postgres database. It exposes tools for listing schemas and tables, describing table structures, running read-only SELECT queries, and explaining query execution plans.

Write operations (INSERT, UPDATE, DELETE, DDL) are disabled by default and require an explicit opt-in flag, keeping the server safe for use in development and staging environments. Connection strings are loaded from environment variables and never exposed in tool responses.`,
    category: 'mcp-server',
    tags: ['database', 'postgresql', 'sql', 'analytics', 'backend'],
    sourceUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres',
    author: 'Anthropic',
    usageSnippet: `export POSTGRES_CONNECTION_STRING="postgresql://user:pass@localhost:5432/mydb"

{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": { "POSTGRES_CONNECTION_STRING": "\${POSTGRES_CONNECTION_STRING}" }
    }
  }
}`,
  },
] satisfies Entry[];
