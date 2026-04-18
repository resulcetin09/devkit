# Implementation Plan: Devkit Directory

## Overview

Build a static React + Tailwind CSS + Vite SPA that serves as a browsable, searchable, filterable directory of Claude skills and MCP servers. All data is bundled at build time. Implementation proceeds from project scaffolding → data layer → core logic → UI components → routing → polish.

## Tasks

- [x] 1. Scaffold project and configure tooling
  - Initialize Vite project with React + TypeScript template (`npm create vite@latest`)
  - Install dependencies: `react-router-dom`, `tailwindcss`, `postcss`, `autoprefixer`, `fast-check`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@vitejs/plugin-react`
  - Configure `tailwind.config.ts` with the dark-theme color tokens (`bg`, `border`, `text`, `accent`) defined in the design
  - Set `darkMode: 'class'` or use the token-only approach; add `bg-bg-base` to `<html>` so the page background is always dark
  - Configure `vite.config.ts` to expose `VITE_HASH_ROUTING` env variable
  - Configure `vitest` in `vite.config.ts` with `jsdom` environment and `@testing-library/jest-dom` setup file
  - _Requirements: 9.3, 10.1_

- [x] 2. Define types and static data
  - [x] 2.1 Create `src/types/entry.ts` with `Entry`, `EntryCategory`, `CategoryFilter`, and `FilterState` interfaces exactly as specified in the design
    - _Requirements: 5.1, 5.2_
  - [x] 2.2 Create `src/data/entries.ts` with `CONTRIBUTION_URL` constant and `RAW_ENTRIES` array containing at least 6 realistic seed entries (mix of `skill` and `mcp-server`, varied tags)
    - _Requirements: 5.4, 8.3_

- [x] 3. Implement data validation
  - [x] 3.1 Create `src/data/validateEntries.ts` with `isValidEntry()` guard and `validateEntries()` function
    - `isValidEntry` checks all required fields are present and non-empty; validates `sourceUrl` and `iconUrl` are valid URLs when present; validates `category` is `'skill' | 'mcp-server'`
    - `validateEntries` iterates `RAW_ENTRIES`, calls `isValidEntry`, pushes valid entries, calls `console.warn` for each invalid entry
    - _Requirements: 5.1, 5.2, 5.3_
  - [ ]* 3.2 Write property test for `validateEntries` (Property 7)
    - **Property 7: Validation excludes any entry missing a required field and warns**
    - Generate arrays mixing fully-valid entries with objects missing one or more required fields; assert only valid entries are returned and `console.warn` is called exactly once per invalid entry
    - **Validates: Requirements 5.1, 5.3**
  - [ ]* 3.3 Write unit tests for `validateEntries`
    - Test: all-valid array returns all entries; single missing required field excludes entry; missing `id` only; missing `sourceUrl` only; invalid URL format excluded; `console.warn` call count matches invalid count
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 4. Implement `filterEntries` utility
  - [x] 4.1 Create `src/utils/filterEntries.ts` implementing `filterEntries(entries: Entry[], state: FilterState): Entry[]`
    - Search: case-insensitive match against `name`, `shortDescription`, and each element of `tags`; empty query skips search filtering
    - Category: skip when `'all'`; otherwise match `entry.category === selectedCategory`
    - Tags: every selected tag must appear in `entry.tags` (AND logic)
    - All three constraints applied as intersection
    - _Requirements: 2.2, 2.4, 3.3, 3.4, 3.5, 3.6_
  - [ ]* 4.2 Write property test for `filterEntries` — Property 1 (search correctness)
    - **Property 1: Search filters by name, description, and tags (case-insensitive)**
    - Generate arbitrary entry arrays + non-empty query strings; assert every result contains query in name/shortDescription/tag; assert no matching entry is absent
    - **Validates: Requirements 2.2**
  - [ ]* 4.3 Write property test for `filterEntries` — Property 2 (empty search)
    - **Property 2: Empty search query does not reduce results beyond active filters**
    - Generate arbitrary entry arrays + filter states with `searchQuery = ''`; assert result equals category+tag filtered set
    - **Validates: Requirements 2.4, 3.6**
  - [ ]* 4.4 Write property test for `filterEntries` — Property 3 (AND intersection)
    - **Property 3: Filter constraints are applied as a strict intersection**
    - Generate arbitrary entry arrays + category + tag set; assert result equals intersection of category-filtered and tag-filtered sets; when `category='all'` and `tags=[]` all entries returned
    - **Validates: Requirements 3.3, 3.4, 3.5**
  - [ ]* 4.5 Write property test for `filterEntries` — Property 8 (determinism)
    - **Property 8: filterEntries is deterministic (pure function)**
    - Generate arbitrary entry arrays + filter states; call `filterEntries` twice with same args; assert identical results
    - **Validates: Requirements 2.2, 3.3, 3.4, 3.5**
  - [ ]* 4.6 Write unit tests for `filterEntries`
    - Test: search by name; search by tag; search by shortDescription; case-insensitive match; category filter `skill`; category filter `mcp-server`; combined category + tag; empty query returns all; no-match returns empty array
    - _Requirements: 2.2, 2.4, 3.3, 3.4, 3.5, 3.6_

- [ ] 5. Checkpoint — Ensure all tests pass
  - Run `vitest --run` and confirm all data/utility tests pass before building UI components.

- [x] 6. Configure Tailwind dark theme and global styles
  - Apply dark background to `body` / root element using `bg-bg-base` token
  - Set default text color to `text-text-primary`
  - Add base `font-sans` and `antialiased` classes
  - Verify color tokens resolve correctly in browser
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 7. Build shared UI primitives
  - [x] 7.1 Create `src/components/ui/Badge.tsx` — renders a pill badge; accepts `label` and `variant` (`'skill' | 'mcp-server'`); uses `accent-skill` green for skills and `accent-secondary` blue for MCP servers
    - _Requirements: 1.3_
  - [x] 7.2 Create `src/components/ui/CodeBlock.tsx` — renders `<pre><code>` with monospace font, `bg-bg-elevated` background, horizontal scroll, and optional `language` label; accepts `CodeBlockProps`
    - _Requirements: 4.3_
  - [x] 7.3 Create `src/components/ui/Tag.tsx` — small pill for displaying a tag string; used inside cards and detail view
    - _Requirements: 1.2, 4.2_

- [x] 8. Build `EntryCard` component
  - [x] 8.1 Create `src/components/EntryCard.tsx` implementing `EntryCardProps`
    - Render: optional icon (lazy-loaded `<img loading="lazy">`), name, shortDescription, `Badge` for category, list of `Tag` components
    - Card uses `bg-bg-surface` background, `border-border-subtle` border, hover state lifts to `bg-bg-elevated`
    - Entire card is clickable (button or anchor)
    - _Requirements: 1.2, 1.3, 10.4_
  - [ ]* 8.2 Write property test for `EntryCard` (Property 5)
    - **Property 5: EntryCard renders all required fields for any entry**
    - Generate arbitrary valid `Entry` objects; assert rendered output contains name, shortDescription, category badge label, and all tags
    - **Validates: Requirements 1.2, 1.3**
  - [ ]* 8.3 Write property test for icon lazy-loading (Property 9)
    - **Property 9: Icon images are lazy-loaded for any entry with an iconUrl**
    - Generate arbitrary valid `Entry` objects with non-empty `iconUrl`; assert rendered `<img>` has `loading="lazy"`
    - **Validates: Requirements 10.4**
  - [ ]* 8.4 Write unit tests for `EntryCard`
    - Test: renders name; renders shortDescription; renders correct badge variant for `skill`; renders correct badge variant for `mcp-server`; renders all tags; icon absent when `iconUrl` undefined; icon present with `loading="lazy"` when `iconUrl` set; `onClick` fires on click
    - _Requirements: 1.2, 1.3, 10.4_

- [x] 9. Build `EntryDetail` component
  - [x] 9.1 Create `src/components/EntryDetail.tsx` implementing `EntryDetailProps`
    - Render: name, fullDescription, `Badge` for category, all `Tag` components, author (when present), source URL as `<a href={entry.sourceUrl} target="_blank" rel="noopener noreferrer">`, `CodeBlock` only when `usageSnippet` is a non-empty string
    - _Requirements: 4.2, 4.3, 4.4_
  - [ ]* 9.2 Write property test for `EntryDetail` (Property 6)
    - **Property 6: EntryDetail renders all fields and conditional elements for any entry**
    - Generate arbitrary valid `Entry` objects (with and without `usageSnippet`/`author`); assert name, fullDescription, category, tags, author (when present), sourceUrl link, and CodeBlock iff `usageSnippet` is non-empty
    - **Validates: Requirements 4.2, 4.3, 4.4**
  - [ ]* 9.3 Write unit tests for `EntryDetail`
    - Test: renders name; renders fullDescription; renders source link with correct href; renders author when present; omits author when absent; renders CodeBlock when `usageSnippet` non-empty; omits CodeBlock when `usageSnippet` absent; renders all tags
    - _Requirements: 4.2, 4.3, 4.4_

- [x] 10. Build `SearchBar` and `FilterPanel` components
  - [x] 10.1 Create `src/components/SearchBar.tsx` implementing `SearchBarProps`
    - Controlled text input; placeholder "Search skills and MCP servers…"; uses `bg-bg-surface` and `border-border-default` styling; calls `onChange` on every keystroke
    - _Requirements: 2.1_
  - [x] 10.2 Create `src/components/FilterPanel.tsx` implementing `FilterPanelProps`
    - `CategoryFilter` section: three buttons/tabs for "All", "Skills", "MCP Servers"; active state uses `accent-primary`
    - `TagFilter` section: renders a toggle chip per unique tag; selected tags highlighted; supports multi-select
    - "Clear filters" button calls `onClear`; only visible when filters are active
    - _Requirements: 3.1, 3.2, 3.6_
  - [x] 10.3 Create `src/components/ResultCount.tsx` implementing `ResultCountProps`
    - Renders e.g. "Showing 12 of 24 entries"; uses `text-text-secondary` styling
    - _Requirements: 3.7_

- [x] 11. Build `EntryGrid` and empty/no-results states
  - Create `src/components/EntryGrid.tsx`
  - When `entries` is non-empty: render responsive CSS grid — 1 col < 640px, 2 cols 640–1023px, 3+ cols ≥ 1024px — using Tailwind `grid-cols-*` responsive prefixes
  - When `entries` is empty and `searchQuery` is non-empty: render no-results message including the query string
  - When `entries` is empty and no search/filter active: render empty-state message
  - _Requirements: 1.1, 1.4, 2.3, 7.1, 7.2, 7.3_

- [x] 12. Build `Header` and `Layout` components
  - Create `src/components/Layout.tsx` with `<Header>` + `<Outlet />` structure for React Router
  - `Header`: app logo/name on the left; "Submit an Entry" `<a>` button on the right that opens `CONTRIBUTION_URL` in a new tab (`target="_blank" rel="noopener noreferrer"`)
  - Header uses `bg-bg-surface` background with `border-border-subtle` bottom border
  - _Requirements: 8.1, 8.2_

- [x] 13. Build `DirectoryPage`
  - Create `src/pages/DirectoryPage.tsx`
  - Local state: `searchQuery`, `selectedCategory`, `selectedTags` via `useState`
  - Derive `allTags` from `validateEntries(RAW_ENTRIES)` (deduplicated, sorted)
  - Compute `visibleEntries = filterEntries(allEntries, { searchQuery, selectedCategory, selectedTags })`
  - Render: `SearchBar`, `FilterPanel`, `ResultCount`, `EntryGrid`
  - Clicking an `EntryCard` navigates to `/entry/:id` via `useNavigate`
  - _Requirements: 1.1, 2.1, 3.1, 3.2, 3.7_

- [x] 14. Build `EntryDetailPage` and `NotFoundPage`
  - [x] 14.1 Create `src/pages/EntryDetailPage.tsx`
    - Use `useParams` to get `:id`; look up entry in `allEntries`; if not found render `NotFoundPage` (or redirect to it)
    - Render `EntryDetail` for the matched entry
    - _Requirements: 4.1, 4.5, 6.1, 6.3_
  - [x] 14.2 Create `src/pages/NotFoundPage.tsx`
    - Render a 404 message and a "Back to directory" link to `/`
    - _Requirements: 6.3_

- [x] 15. Wire up routing in `App.tsx` and `main.tsx`
  - In `main.tsx`: read `import.meta.env.VITE_HASH_ROUTING`; render `<HashRouter>` when truthy, `<BrowserRouter>` otherwise
  - In `App.tsx`: define routes using `<Routes>`:
    - `"/"` → `<Layout>` wrapping `<DirectoryPage>`
    - `"/entry/:id"` → `<EntryDetailPage>`
    - `"*"` → `<NotFoundPage>`
  - Call `validateEntries(RAW_ENTRIES)` once at app startup and pass result down (or store in module-level constant)
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 16. Checkpoint — Smoke test full app
  - Run `vitest --run` to confirm all tests still pass
  - Run `vite build` and confirm it produces only static files with no errors
  - Manually verify: directory page loads, search filters work, category/tag filters work, clicking a card navigates to detail, back navigation works, unknown `/entry/does-not-exist` shows 404 page

- [ ] 17. Implement property test for `ResultCount` accuracy (Property 4)
  - [ ]* 17.1 Write property test — Property 4 (result count accuracy)
    - **Property 4: Result count matches the filtered entry array length**
    - Generate arbitrary entry arrays + arbitrary filter states; assert `filterEntries(...).length` equals the `count` prop that would be passed to `ResultCount`
    - **Validates: Requirements 3.7**

- [ ] 18. Responsive layout and accessibility polish
  - Verify `EntryGrid` breakpoints match requirements (1 col < 640px, 2 cols 640–1023px, 3+ cols ≥ 1024px)
  - Ensure no horizontal scroll at 320px viewport width
  - Add `aria-label` to `SearchBar` input, `FilterPanel` fieldsets, and `EntryCard` buttons
  - Ensure focus-visible ring styles are present on all interactive elements (Tailwind `focus-visible:ring`)
  - Add `<title>` and `<meta name="description">` to `index.html`
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 19. Performance: lazy-loading and image error handling
  - Confirm all `<img>` elements for `iconUrl` have `loading="lazy"`
  - Add `onError` handler to icon `<img>` that swaps `src` to a generic SVG placeholder
  - Verify Vite build output has code-split chunks (React Router lazy-loads pages if desired)
  - _Requirements: 10.3, 10.4_

- [ ] 20. Final checkpoint — Ensure all tests pass
  - Run `vitest --run` and confirm all unit and property tests pass
  - Run `vite build` and confirm clean build output
  - Ensure all tasks pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints (tasks 5, 16, 20) ensure incremental validation
- Property tests use `fast-check` and validate universal correctness properties (Properties 1–9 from the design)
- Unit tests validate specific examples and edge cases
- Hash routing is toggled via `VITE_HASH_ROUTING=true` in `.env` — no code changes needed
