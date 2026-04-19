# Devkit Directory Project

## Overview

**Devkit Directory** is a browsable, searchable directory of Claude skills and MCP (Model Context Protocol) servers. It's a React-based web application that helps developers discover and install tools for AI-assisted development.

**Live URL:** https://devkit-lime.vercel.app (deployed via Vercel)

## Project Architecture

### Tech Stack
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS with custom dark theme
- **Routing:** React Router DOM v6
- **Build:** Vite with TypeScript compilation
- **Testing:** Vitest + React Testing Library
- **Deployment:** Vercel for production hosting
- **Automation:** GitHub Actions for discovery workflow

### Key Technologies
- **Node.js 20+** for build and scripts
- **ESM modules** throughout (type: "module" in package.json)
- **tsx** for running TypeScript scripts
- **@octokit/rest** for GitHub API integration
- **Hash routing** enabled for SPA compatibility

## Directory Structure

### Core Application Files
```
src/
├── App.tsx                 # Main app with routing
├── main.tsx               # React entry point
├── index.css              # Global styles + Tailwind
├── types/entry.ts         # TypeScript interfaces
├── data/
│   ├── entries.ts         # Main data file (142 entries)
│   └── validateEntries.ts # Data validation
├── components/
│   ├── Layout.tsx         # Main layout wrapper
│   ├── Hero.tsx           # Landing page hero
│   ├── SearchBar.tsx      # Search functionality
│   ├── FilterPanel.tsx    # Category/tag filters
│   ├── EntryGrid.tsx      # Grid display
│   ├── EntryCard.tsx      # Individual entry cards
│   ├── EntryDetail.tsx    # Detailed entry view
│   ├── InstallButton.tsx  # Install button component
│   ├── InstallModal.tsx   # Installation modal
│   ├── IDETabs.tsx        # IDE selection tabs
│   ├── ConfigurationDisplay.tsx # Config display
│   └── ui/                # Reusable UI components
│       ├── Badge.tsx      # Category badges
│       ├── Tag.tsx        # Tag components
│       ├── CodeBlock.tsx  # Code display with scrolling
│       └── CopyButton.tsx # Copy to clipboard
└── pages/
    ├── DirectoryPage.tsx  # Main directory listing
    ├── EntryDetailPage.tsx # Entry detail page
    └── NotFoundPage.tsx   # 404 page
```

### Automation Scripts
```
scripts/
├── discover-mcp-servers.ts    # GitHub discovery script
├── update-entries.ts          # Entry update/merge script
└── utils/                     # Shared utilities
    ├── detect-package.ts      # Package.json detection
    ├── detect-runtime.ts      # Runtime detection (Node/Python)
    ├── generate-install-config.ts # Auto-generate install configs
    ├── generate-server-name.ts   # Clean server names
    ├── parse-entries.ts       # Parse entries.ts file
    ├── parse-env-vars.ts      # Extract env vars from README
    ├── parse-readme.ts        # README content parsing
    ├── quality-filter-config.ts    # Quality filter patterns
    ├── quality-filter-discovery.ts # Discovery stage filtering
    ├── quality-filter-validation.ts # Validation stage filtering
    ├── transform-entry.ts     # GitHub repo → Entry transformation
    ├── transform-name.ts      # Name transformation
    └── write-entries.ts       # Write entries.ts file
```

### Configuration Files
```
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind theme configuration
├── tsconfig.json          # TypeScript configuration
├── tsconfig.app.json      # App-specific TS config
├── tsconfig.node.json     # Node scripts TS config
└── postcss.config.js      # PostCSS configuration
```

## Data Model

### Entry Interface
```typescript
interface Entry {
  id: string;               // Unique slug
  name: string;
  shortDescription: string;
  fullDescription: string;
  category: 'skill' | 'mcp-server';
  tags: string[];
  sourceUrl: string;
  author?: string;
  usageSnippet?: string;
  iconUrl?: string;
  installConfig?: InstallConfig;  // MCP servers only
}
```

### Install Configuration
```typescript
interface InstallConfig {
  cursor: IDEConfig;
  claudeDesktop: IDEConfig;
  antigravity: IDEConfig;
  kiro: IDEConfig;
}

interface IDEConfig {
  configSnippet: string;  // JSON configuration
  filePath: string;       // Config file path
}
```

## Key Features

### 1. Smart Install Modal
- **Purpose:** Interactive installation instructions for MCP servers
- **Components:** InstallModal, IDETabs, ConfigurationDisplay
- **Features:**
  - 4 IDE tabs (Cursor, Claude Desktop, Antigravity, Kiro)
  - JSON configuration display with syntax highlighting
  - Copy-to-clipboard functionality
  - Scrollable code blocks (max-height: 300px)
  - Keyboard navigation and accessibility
  - Focus trap and escape key handling

### 2. Auto-Discovery System
- **GitHub Actions workflow:** `.github/workflows/auto-discover-mcp.yml`
- **Schedule:** Daily at 00:00 UTC + manual trigger
- **Search criteria:** `topic:mcp-server stars:>=10`
- **Process:**
  1. Search GitHub repositories
  2. Apply quality filters (two-stage)
  3. Generate install configurations
  4. Update entries.ts
  5. Create automated PR if changes detected

### 3. Quality Filter System
- **Two-stage filtering:**
  - **Discovery stage:** Fast metadata checks (name patterns, description keywords, topics)
  - **Validation stage:** Content analysis with scoring (README analysis, package dependencies)
- **Patterns filtered:** Frameworks, libraries, SDKs, documentation, tutorials, examples
- **Scoring system:** Minimum 30 points required for acceptance
- **One-time cleanup:** Removed 22 false positives from existing entries

### 4. Search and Filtering
- **Real-time search:** Name, description, tags
- **Category filters:** All, Skills, MCP Servers
- **Tag filtering:** Multi-select with counts
- **URL state:** Filters preserved in URL parameters

## NPM Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run deploy       # Build and deploy to GitHub Pages
npm run discover-mcp # Run MCP discovery script
npm run update-entries # Update entries from discovery results
```

### Script Usage Examples
```bash
# Discovery with dry run
npm run discover-mcp -- --dry-run

# Update entries with dry run
npm run update-entries -- --dry-run

# One-time quality cleanup
npm run update-entries -- --cleanup
```

## GitHub Actions Workflow

### Auto-Discovery Process
1. **Trigger:** Daily cron job or manual dispatch
2. **Discovery:** Search GitHub for MCP servers
3. **Quality filtering:** Two-stage filtering system
4. **Install config generation:** Auto-generate for 4 IDEs
5. **Entry updates:** Merge with existing entries
6. **PR creation:** Automated PR with detailed summary
7. **Preservation:** Manual fields (installConfig, usageSnippet, iconUrl) never overwritten

### Workflow Outputs
- `mcp-discovery-result.json` - Discovery results
- `mcp-update-summary.json` - Update summary
- `pr_body.txt` - Generated PR description
- Automated PR with labels: `automated`, `mcp-servers`, `dependencies`

## Design System

### Color Palette (Dark Theme)
```css
--bg-base: #0f1117      /* Page background */
--bg-surface: #1a1d27   /* Card/panel background */
--bg-elevated: #22263a  /* Hover/active surface */
--border-subtle: #2e3347
--border-default: #3d4460
--text-primary: #e8eaf0
--text-secondary: #9ba3bf
--text-muted: #5c6480
--accent-primary: #7c6af7   /* Purple - primary CTA */
--accent-secondary: #4fa3e0 /* Blue - MCP Server badge */
--accent-skill: #34c98a     /* Green - Skill badge */
```

### Typography
- **Display font:** Custom font family via CSS variables
- **Monospace:** For code blocks and file paths
- **Font sizes:** Tailwind scale (text-sm, text-base, text-lg, etc.)

## Current State

### Statistics (as of latest cleanup)
- **Total entries:** 142
- **Skills:** ~70 entries
- **MCP servers:** ~72 entries
- **Recent cleanup:** Removed 22 false positives

### Recent Major Features
1. ✅ **Quality Filter System** - Two-stage filtering with scoring
2. ✅ **Auto-Discovery Workflow** - Daily GitHub Actions automation
3. ✅ **Smart Install Modal** - Interactive installation instructions
4. ✅ **InstallConfig Generation** - Auto-generate for 4 IDEs
5. ✅ **One-time Cleanup** - Removed historical false positives

## What's Next

### Immediate Priorities
1. **Monitor auto-discovery** - Ensure daily workflow runs smoothly
2. **Quality filter tuning** - Adjust patterns based on new discoveries
3. **Manual entry curation** - Add high-quality missing entries
4. **Install config expansion** - Add configs to more existing entries

### Future Enhancements
1. **Entry validation** - Automated validation of entry data
2. **Analytics** - Track popular entries and search terms
3. **User contributions** - Community submission workflow
4. **API endpoints** - Programmatic access to directory data
5. **Enhanced search** - Fuzzy search, better ranking
6. **Entry versioning** - Track changes over time

### Technical Debt
1. **Test coverage** - Expand test suite for components
2. **Performance** - Optimize for large entry counts
3. **Accessibility** - Full WCAG compliance audit
4. **Mobile UX** - Enhanced mobile experience
5. **Error handling** - Better error states and recovery

## Development Guidelines

### Code Style
- **TypeScript strict mode** enabled
- **ESM imports** with .js extensions for local files
- **React functional components** with hooks
- **Tailwind classes** for styling (no custom CSS unless necessary)
- **Semantic HTML** with proper ARIA attributes

### File Naming
- **Components:** PascalCase (EntryCard.tsx)
- **Utilities:** camelCase (parse-entries.ts)
- **Types:** Interfaces in types/ directory
- **Scripts:** kebab-case in scripts/ directory

### Git Workflow
- **Main branch:** `master`
- **Feature branches:** Descriptive names
- **Commit messages:** Conventional commits format
- **Automated PRs:** From GitHub Actions workflow

## Environment Variables

### Required for Scripts
```bash
GITHUB_TOKEN=<token>  # For GitHub API access (discovery script)
```

### Optional for Development
```bash
VITE_HASH_ROUTING=true  # Enable hash routing (set in .env)
```

## Deployment

### Vercel Setup
- **Platform:** Vercel for production hosting
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Framework preset:** Vite
- **Hash routing:** Enabled for SPA compatibility

### Manual Deployment
```bash
npm run build    # Build production assets
# Deploy via Vercel CLI or Git integration
```

## Troubleshooting

### Common Issues
1. **Build failures:** Check TypeScript errors with `tsc --noEmit`
2. **Discovery script errors:** Verify GITHUB_TOKEN environment variable
3. **Import errors:** Ensure .js extensions on local imports
4. **Routing issues:** Verify hash routing is enabled for SPA compatibility

### Debug Commands
```bash
npm run test                    # Run test suite
npm run discover-mcp -- --dry-run  # Test discovery without changes
npm run update-entries -- --dry-run # Test updates without changes
```

This project represents a comprehensive directory system with automated discovery, quality filtering, and user-friendly installation workflows for the Claude/MCP ecosystem.