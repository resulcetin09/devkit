# Requirements Document

## Introduction

Devkit is a static web application built with React, Tailwind CSS, and Vite. It serves as an open-source directory for Claude skills and MCP (Model Context Protocol) servers. Users can browse, filter, search, and learn about each entry in the directory. The app has no backend — all data is bundled statically at build time.

## Glossary

- **Devkit**: The static web application described in this document.
- **Entry**: A single item in the directory, representing either a Claude Skill or an MCP Server.
- **Skill**: A Claude skill — a packaged capability that extends Claude's behavior.
- **MCP_Server**: A Model Context Protocol server that exposes tools and resources to Claude.
- **Directory**: The full collection of Entries displayed in Devkit.
- **Tag**: A keyword label attached to an Entry used for filtering (e.g., "productivity", "code", "search").
- **Category**: A top-level grouping of Entries, either "Skills" or "MCP Servers".
- **Filter**: A user-applied constraint that narrows the visible Entries in the Directory.
- **Search**: A text-based query that matches Entry names, descriptions, or Tags.
- **Detail_View**: A page or panel that displays the full information for a single Entry.
- **Static_Data**: JSON or TypeScript data files bundled into the app at build time, containing all Entry metadata.

---

## Requirements

### Requirement 1: Directory Listing

**User Story:** As a developer, I want to browse all available Claude skills and MCP servers in one place, so that I can discover tools that extend Claude's capabilities.

#### Acceptance Criteria

1. THE Devkit SHALL display all Entries from the Static_Data on the main directory page.
2. THE Devkit SHALL render each Entry as a card showing its name, short description, Category, and Tags.
3. THE Devkit SHALL visually distinguish Skills from MCP_Servers (e.g., via a badge or icon).
4. WHEN the Static_Data contains zero Entries, THE Devkit SHALL display an empty-state message.

---

### Requirement 2: Search

**User Story:** As a developer, I want to search the directory by keyword, so that I can quickly find a specific skill or server by name or description.

#### Acceptance Criteria

1. THE Devkit SHALL provide a text input field for Search on the main directory page.
2. WHEN a user types into the Search input, THE Devkit SHALL filter the visible Entries to those whose name, short description, or Tags contain the query string (case-insensitive).
3. WHEN the Search query matches zero Entries, THE Devkit SHALL display a no-results message that includes the query string.
4. WHEN the Search input is cleared, THE Devkit SHALL restore the full list of Entries (subject to any active Filters).

---

### Requirement 3: Filtering

**User Story:** As a developer, I want to filter the directory by category and tags, so that I can narrow results to the type of tool I need.

#### Acceptance Criteria

1. THE Devkit SHALL provide a Filter control for Category with options: "All", "Skills", "MCP Servers".
2. THE Devkit SHALL provide a Filter control for Tags, listing all unique Tags present in the Static_Data.
3. WHEN a user selects a Category Filter, THE Devkit SHALL display only Entries matching that Category.
4. WHEN a user selects one or more Tag Filters, THE Devkit SHALL display only Entries that contain all selected Tags.
5. WHEN both a Category Filter and Tag Filters are active, THE Devkit SHALL apply both constraints simultaneously (AND logic).
6. WHEN all Filters are cleared, THE Devkit SHALL restore the full list of Entries (subject to any active Search).
7. THE Devkit SHALL display the count of currently visible Entries after Filters and Search are applied.

---

### Requirement 4: Entry Detail View

**User Story:** As a developer, I want to view full details about a skill or MCP server, so that I can understand what it does and how to use it.

#### Acceptance Criteria

1. WHEN a user selects an Entry card, THE Devkit SHALL navigate to or display the Detail_View for that Entry.
2. THE Detail_View SHALL display the Entry's name, full description, Category, Tags, author, and source URL.
3. WHERE an Entry includes an installation or usage snippet, THE Detail_View SHALL render it in a formatted code block.
4. THE Detail_View SHALL provide a link to the Entry's source repository or documentation URL.
5. WHEN a user navigates directly to a Detail_View URL, THE Devkit SHALL display the correct Entry without requiring navigation from the directory page.

---

### Requirement 5: Static Data Model

**User Story:** As a contributor, I want a well-defined data schema for entries, so that I can add new skills and MCP servers to the directory consistently.

#### Acceptance Criteria

1. THE Static_Data SHALL define each Entry with the following required fields: `id` (unique string), `name` (string), `shortDescription` (string), `fullDescription` (string), `category` ("skill" | "mcp-server"), `tags` (array of strings), `sourceUrl` (valid URL string).
2. THE Static_Data SHALL support the following optional fields per Entry: `author` (string), `usageSnippet` (string), `iconUrl` (URL string).
3. IF an Entry is missing a required field, THEN THE Devkit SHALL exclude that Entry from the Directory and log a warning to the browser console.
4. THE Static_Data SHALL be stored as a TypeScript or JSON file co-located with the source code and imported at build time.

---

### Requirement 6: Routing and Shareability

**User Story:** As a developer, I want to share a direct link to a specific entry, so that I can point colleagues to a tool without them having to search for it.

#### Acceptance Criteria

1. THE Devkit SHALL implement client-side routing with a unique URL path per Entry (e.g., `/entry/:id`).
2. THE Devkit SHALL implement a URL path for the main directory page (e.g., `/`).
3. WHEN a user navigates to an Entry URL that does not match any Entry in the Static_Data, THE Devkit SHALL display a 404 not-found page.
4. WHERE the deployment environment supports hash-based routing, THE Devkit SHALL support hash routing as a configuration option to enable static hosting without server-side redirect rules.

---

### Requirement 7: Responsive Layout

**User Story:** As a developer browsing on any device, I want the directory to be usable on both desktop and mobile screens, so that I can explore tools from wherever I am.

#### Acceptance Criteria

1. THE Devkit SHALL render a multi-column card grid on viewport widths of 1024px and above.
2. THE Devkit SHALL render a single-column card list on viewport widths below 640px.
3. THE Devkit SHALL render an intermediate layout on viewport widths between 640px and 1023px.
4. THE Devkit SHALL remain fully navigable and readable without horizontal scrolling on viewport widths of 320px and above.

---

### Requirement 8: Contribution Call-to-Action

**User Story:** As an open-source contributor, I want a clear way to submit a new skill or MCP server, so that I can add entries to the directory without needing to know the project internals.

#### Acceptance Criteria

1. THE Devkit SHALL display a "Submit an Entry" call-to-action element that is visible on the main directory page.
2. WHEN a user activates the "Submit an Entry" call-to-action, THE Devkit SHALL open the GitHub PR template URL in a new browser tab.
3. THE Static_Data SHALL include a configurable `contributionUrl` field that stores the GitHub PR template URL used by the call-to-action.

---

### Requirement 9: Dark Theme

**User Story:** As a developer, I want the app to use a dark visual theme, so that it is comfortable to use in low-light environments and consistent with developer tooling aesthetics.

#### Acceptance Criteria

1. THE Devkit SHALL apply a dark color theme to all UI surfaces, including backgrounds, cards, text, and controls.
2. THE Devkit SHALL NOT provide a light/dark theme toggle; the dark theme is the sole supported appearance.
3. THE Devkit SHALL define dark theme color tokens (background, surface, border, text, accent) in the Tailwind CSS configuration so that all components reference shared tokens.

---

### Requirement 10: Performance and Build

**User Story:** As a user, I want the app to load quickly, so that I can start browsing without delay.

#### Acceptance Criteria

1. THE Devkit SHALL be built using Vite and produce a static output directory containing only HTML, CSS, JavaScript, and asset files.
2. THE Devkit SHALL achieve a Lighthouse Performance score of 90 or above on the production build when tested on a standard desktop connection.
3. THE Devkit SHALL load and display the directory listing within 3 seconds on a simulated Fast 3G connection.
4. WHERE an Entry includes an `iconUrl`, THE Devkit SHALL lazy-load the image to avoid blocking initial render.
