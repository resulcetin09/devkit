# Design Document: Devkit Directory

## Overview

Devkit Directory is a static single-page application (SPA) built with React, Tailwind CSS, and Vite. It serves as a browsable, searchable, filterable directory of Claude skills and MCP servers. All data is bundled at build time as TypeScript files — there is no backend, no API, and no runtime data fetching.

The app is dark-theme only, uses client-side routing (React Router v6 with optional hash routing), and is designed to be deployed to any static host (GitHub Pages, Netlify, Vercel, S3, etc.).

Key design goals:
- Fast initial load (Lighthouse ≥ 90, visible content within 3s on Fast 3G)
- Fully shareable deep links to individual entries
- Simple contribution path via GitHub PR template
- Responsive from 320px mobile to wide desktop

---

## Architecture

The app follows a standard React SPA architecture with no server-side rendering. All routing, filtering, and search logic runs in the browser.

```mermaid
graph TD
    A[Static Data Files<br/>src/data/entries.ts] --> B[Data Validation Layer<br/>validateEntries()]
    B --> C[React App<br/>main.tsx]
    C --> D[React Router]
    D --> E[DirectoryPage<br/>/ route]
    D --> F[EntryDetailPage<br/>/entry/:id route]
    D --> G[NotFoundPage<br/>* route]
    E --> H[SearchBar]
    E --> I[FilterPanel]
    E --> J[EntryGrid]
    J --> K[EntryCard]
    F --> L[EntryDetail]
```

### Data Flow

```mermaid
flowchart LR
    RawData[entries.ts] -->|import| Validate[validateEntries]
    Validate -->|valid entries| Store[useDirectoryStore / Context]
    Store -->|all entries| DirectoryPage
    DirectoryPage -->|search + filters| FilterEngine[filterEntries()]
    FilterEngine -->|filtered entries| EntryGrid
```

### Routing Strategy

React Router v6 is used for client-side routing. A `VITE_HASH_ROUTING` environment variable (boolean) switches between `BrowserRouter` and `HashRouter` at build time, enabling deployment to static hosts that cannot serve arbitrary paths.

| Mode | URL example | Use case |
|------|-------------|----------|
| Browser routing (default) | `/entry/my-skill` | Hosts with redirect rules (Netlify, Vercel) |
| Hash routing | `/#/entry/my-skill` | GitHub Pages, plain S3 |

---

## Components and Interfaces

### Component Tree

```
App
├── Router (BrowserRouter | HashRouter)
│   ├── Layout
│   │   ├── Header (logo + "Submit an Entry" CTA)
│   │   └── <Outlet />
│   ├── DirectoryPage  [route: /]
│   │   ├── SearchBar
│   │   ├── FilterPanel
│   │   │   ├── CategoryFilter
│   │   │   └── TagFilter
│   │   ├── ResultCount
│   │   └── EntryGrid
│   │       └── EntryCard (×N)
│   ├── EntryDetailPage  [route: /entry/:id]
│   │   └── EntryDetail
│   │       └── CodeBlock (optional)
│   └── NotFoundPage  [route: *]
```

### Component Interfaces

```typescript
// EntryCard
interface EntryCardProps {
  entry: Entry;
  onClick?: () => void;
}

// EntryDetail
interface EntryDetailProps {
  entry: Entry;
}

// SearchBar
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

// FilterPanel
interface FilterPanelProps {
  categories: CategoryOption[];
  allTags: string[];
  selectedCategory: CategoryFilter;
  selectedTags: string[];
  onCategoryChange: (cat: CategoryFilter) => void;
  onTagsChange: (tags: string[]) => void;
  onClear: () => void;
}

// ResultCount
interface ResultCountProps {
  count: number;
  total: number;
}

// CodeBlock
interface CodeBlockProps {
  code: string;
  language?: string;
}
```

### State Management

No external state library is needed. State lives in the `DirectoryPage` component via `useState` hooks, with the filter/search logic extracted into a pure `filterEntries()` utility function.

```typescript
// DirectoryPage local state
const [searchQuery, setSearchQuery] = useState('');
const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
const [selectedTags, setSelectedTags] = useState<string[]>([]);

const visibleEntries = filterEntries(allEntries, { searchQuery, selectedCategory, selectedTags });
```

URL state is not synced to query params (out of scope per requirements — only entry detail URLs need to be shareable).

---

## Data Models

### Entry Type

```typescript
// src/types/entry.ts

export type EntryCategory = 'skill' | 'mcp-server';

export interface Entry {
  // Required fields
  id: string;               // unique slug, e.g. "my-skill"
  name: string;
  shortDescription: string;
  fullDescription: string;
  category: EntryCategory;
  tags: string[];
  sourceUrl: string;        // valid URL

  // Optional fields
  author?: string;
  usageSnippet?: string;
  iconUrl?: string;         // valid URL, lazy-loaded
}
```

### Static Data File

```typescript
// src/data/entries.ts

import type { Entry } from '../types/entry';

export const CONTRIBUTION_URL =
  'https://github.com/your-org/devkit/compare?template=add_entry.md';

export const RAW_ENTRIES: unknown[] = [
  {
    id: 'example-skill',
    name: 'Example Skill',
    shortDescription: 'Does something useful.',
    fullDescription: 'A longer explanation of what this skill does...',
    category: 'skill',
    tags: ['productivity', 'code'],
    sourceUrl: 'https://github.com/example/skill',
    author: 'Jane Dev',
  },
  // ...more entries
];
```

### Validation

```typescript
// src/data/validateEntries.ts

const REQUIRED_FIELDS: (keyof Entry)[] = [
  'id', 'name', 'shortDescription', 'fullDescription',
  'category', 'tags', 'sourceUrl',
];

export function validateEntries(raw: unknown[]): Entry[] {
  const valid: Entry[] = [];
  for (const item of raw) {
    if (!isValidEntry(item)) {
      console.warn('[Devkit] Skipping invalid entry:', item);
      continue;
    }
    valid.push(item as Entry);
  }
  return valid;
}
```

### Filter State Types

```typescript
export type CategoryFilter = 'all' | 'skill' | 'mcp-server';

export interface FilterState {
  searchQuery: string;
  selectedCategory: CategoryFilter;
  selectedTags: string[];
}
```

### Tailwind Theme Tokens

Defined in `tailwind.config.ts` under `theme.extend.colors`:

```typescript
colors: {
  bg: {
    base: '#0f1117',      // page background
    surface: '#1a1d27',   // card / panel background
    elevated: '#22263a',  // hover / active surface
  },
  border: {
    subtle: '#2e3347',
    default: '#3d4460',
  },
  text: {
    primary: '#e8eaf0',
    secondary: '#9ba3bf',
    muted: '#5c6480',
  },
  accent: {
    primary: '#7c6af7',   // purple — primary CTA, links
    secondary: '#4fa3e0', // blue — MCP Server badge
    skill: '#34c98a',     // green — Skill badge
  },
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Search filters by name, description, and tags (case-insensitive)

*For any* list of entries and any non-empty search query string, every entry returned by `filterEntries` must have its name, shortDescription, or at least one tag contain the query string (case-insensitively), and every entry that does contain the query in one of those fields must appear in the result — no false positives, no false negatives.

**Validates: Requirements 2.2**

### Property 2: Empty search query does not reduce results beyond active filters

*For any* entries array and any filter state where `searchQuery` is the empty string, `filterEntries` must return the same set of entries as calling `filterEntries` with only the category and tag filters applied (i.e., search has no effect when the query is empty).

**Validates: Requirements 2.4, 3.6**

### Property 3: Filter constraints are applied as a strict intersection (AND logic)

*For any* entries array, any category filter value, and any set of selected tags, the result of `filterEntries` must equal the intersection of: (a) entries matching the category filter, and (b) entries containing all selected tags. When category is "all" and tags is empty, all entries are returned.

**Validates: Requirements 3.3, 3.4, 3.5**

### Property 4: Result count matches the filtered entry array length

*For any* entries array and any filter + search state, the integer count surfaced to `ResultCount` must equal `filterEntries(entries, state).length`.

**Validates: Requirements 3.7**

### Property 5: EntryCard renders all required fields for any entry

*For any* valid `Entry` object, the rendered `EntryCard` must display the entry's name, shortDescription, a category badge whose label corresponds to the entry's `category` value, and all of the entry's tags.

**Validates: Requirements 1.2, 1.3**

### Property 6: EntryDetail renders all fields and conditional elements for any entry

*For any* valid `Entry` object, the rendered `EntryDetail` must display the entry's name, fullDescription, category, all tags, author (when present), a link whose `href` equals `entry.sourceUrl`, and a `CodeBlock` containing `entry.usageSnippet` if and only if `usageSnippet` is a non-empty string.

**Validates: Requirements 4.2, 4.3, 4.4**

### Property 7: Validation excludes any entry missing a required field and warns

*For any* array of raw objects, `validateEntries` must return only objects that contain all required fields (`id`, `name`, `shortDescription`, `fullDescription`, `category`, `tags`, `sourceUrl`), and must call `console.warn` exactly once for each excluded object.

**Validates: Requirements 5.1, 5.3**

### Property 8: filterEntries is deterministic (pure function)

*For any* entries array and filter state, calling `filterEntries` twice with identical arguments must return arrays with identical contents in the same order — the function produces no side effects and its output depends only on its inputs.

**Validates: Requirements 2.2, 3.3, 3.4, 3.5**

### Property 9: Icon images are lazy-loaded for any entry with an iconUrl

*For any* `Entry` where `iconUrl` is a non-empty string, the `<img>` element rendered for that icon must have the attribute `loading="lazy"`.

**Validates: Requirements 10.4**

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Entry missing required field | Excluded from directory; `console.warn` logged at startup |
| Entry URL navigated to unknown `:id` | `NotFoundPage` rendered with link back to directory |
| `iconUrl` fails to load | `<img>` `onError` replaces with a generic placeholder icon |
| `sourceUrl` is not a valid URL | Entry is excluded by validation (URL format checked in `isValidEntry`) |
| Zero entries in static data | `DirectoryPage` renders empty-state message |
| Search returns zero results | `EntryGrid` renders no-results message including the query string |

---

## Testing Strategy

### Unit Tests (Vitest)

Focus on pure functions and component rendering with concrete examples:

- `validateEntries()` — entries with all required fields pass; entries missing any required field are excluded and trigger `console.warn`
- `filterEntries()` — specific examples: search by name, search by tag, category filter, combined filter, empty query restores all
- `EntryCard` — renders name, shortDescription, category badge, tags
- `EntryDetail` — renders all fields; renders `CodeBlock` only when `usageSnippet` is present; renders source link
- `NotFoundPage` — renders 404 message and back link
- Routing — navigating to `/entry/:id` renders the correct entry; unknown id renders `NotFoundPage`

### Property-Based Tests (fast-check)

Using [fast-check](https://github.com/dubzzz/fast-check) (TypeScript-native PBT library). Each property test runs a minimum of 100 iterations.

**Property 1 — Search filters correctly**
Generate: arbitrary entry arrays + arbitrary non-empty query strings.
Assert: every result contains the query in name, shortDescription, or a tag (case-insensitive); no matching entry is absent.
Tag: `Feature: devkit-directory, Property 1: search filters by name, description, and tags`

**Property 2 — Empty search does not reduce results beyond filters**
Generate: arbitrary entry arrays + arbitrary filter states with `searchQuery = ''`.
Assert: result equals the category+tag filtered set with no search applied.
Tag: `Feature: devkit-directory, Property 2: empty search query does not reduce results beyond active filters`

**Property 3 — Filter constraints are a strict intersection**
Generate: arbitrary entry arrays + arbitrary category + arbitrary tag set.
Assert: result equals intersection of category-filtered and tag-filtered sets; when category='all' and tags=[], all entries returned.
Tag: `Feature: devkit-directory, Property 3: filter constraints are applied as a strict intersection`

**Property 4 — Result count accuracy**
Generate: arbitrary entry arrays + arbitrary filter states.
Assert: `filterEntries(...).length` equals the count value passed to `ResultCount`.
Tag: `Feature: devkit-directory, Property 4: result count matches the filtered entry array length`

**Property 5 — EntryCard renders all required fields**
Generate: arbitrary valid Entry objects.
Assert: rendered EntryCard contains name, shortDescription, category badge matching category, and all tags.
Tag: `Feature: devkit-directory, Property 5: EntryCard renders all required fields for any entry`

**Property 6 — EntryDetail renders all fields and conditional elements**
Generate: arbitrary valid Entry objects (with and without usageSnippet/author).
Assert: rendered EntryDetail contains name, fullDescription, category, tags, author (when present), sourceUrl link, and CodeBlock iff usageSnippet is non-empty.
Tag: `Feature: devkit-directory, Property 6: EntryDetail renders all fields and conditional elements for any entry`

**Property 7 — Validation excludes invalid entries and warns**
Generate: arrays mixing valid entries with objects missing one or more required fields.
Assert: `validateEntries` returns only fully-valid entries; `console.warn` called exactly once per invalid entry.
Tag: `Feature: devkit-directory, Property 7: validation excludes any entry missing a required field and warns`

**Property 8 — filterEntries is deterministic**
Generate: arbitrary entry arrays + arbitrary filter states.
Assert: calling `filterEntries` twice with same args returns identical results.
Tag: `Feature: devkit-directory, Property 8: filterEntries is deterministic`

**Property 9 — Icon images are lazy-loaded**
Generate: arbitrary valid Entry objects with non-empty iconUrl.
Assert: rendered img element has `loading="lazy"` attribute.
Tag: `Feature: devkit-directory, Property 9: icon images are lazy-loaded for any entry with an iconUrl`

### Integration / Smoke Tests

- Build output (`vite build`) produces only static files (HTML, CSS, JS, assets) — smoke test
- Lighthouse CI run against production build asserts Performance ≥ 90 — smoke test
- Hash routing mode: navigating to `/#/entry/:id` renders the correct entry — example test
