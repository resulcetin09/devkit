# MCP Auto-Discovery Implementation Tasks

## Phase 1: Setup and Dependencies

### Task 1: Install Dependencies
- [x] Add @octokit/rest to package.json dependencies
- [x] Add @types/node to devDependencies
- [x] Run npm install
- [x] Commit: "chore: add dependencies for MCP auto-discovery"

## Phase 2: Discovery Script

### Task 2: Create Name Transformation Utilities
- [x] Create scripts/utils/transform-name.ts
- [x] Implement transformRepoName function (mcp-server-figma → Figma MCP)
- [x] Implement generateId function (Figma MCP → figma-mcp)
- [ ] Write unit tests in scripts/utils/transform-name.test.ts
- [ ] Run tests: npm test
- [ ] Commit: "feat: add repo name transformation utilities"

### Task 3: Create README Parser
- [x] Create scripts/utils/parse-readme.ts
- [x] Implement extractFirstParagraph function
- [x] Implement stripMarkdown function
- [ ] Write unit tests in scripts/utils/parse-readme.test.ts
- [ ] Run tests: npm test
- [ ] Commit: "feat: add README parsing utilities"

### Task 4: Create Entry Transformer
- [x] Create scripts/utils/transform-entry.ts
- [x] Implement transformRepoToEntry function
- [x] Map GitHub repo data to Entry format
- [x] Handle all field mappings (name, description, tags, etc)
- [ ] Write unit tests with mock repo data
- [ ] Run tests: npm test
- [ ] Commit: "feat: add GitHub repo to Entry transformer"

### Task 5: Create Discovery Script
- [x] Create scripts/discover-mcp-servers.ts
- [x] Initialize Octokit client
- [x] Implement GitHub API search (topic:mcp-server stars:>=10)
- [x] Fetch README for each repo
- [x] Transform repos to entries using utilities
- [x] Compare with existing entries.ts
- [x] Generate DiscoveryResult output
- [x] Add --dry-run flag support
- [ ] Write integration tests with mocked Octokit
- [ ] Run tests: npm test
- [ ] Commit: "feat: add MCP server discovery script"

### Task 6: Add Discovery npm Script
- [x] Add "discover-mcp" script to package.json
- [ ] Test locally: npm run discover-mcp -- --dry-run
- [ ] Verify output format
- [ ] Commit: "chore: add discover-mcp npm script"

## Phase 3: Update Script

### Task 7: Create entries.ts Parser
- [ ] Create scripts/utils/parse-entries.ts
- [ ] Implement parseEntriesFile function (read and parse RAW_ENTRIES)
- [ ] Implement findEntryById function
- [ ] Write unit tests
- [ ] Run tests: npm test
- [ ] Commit: "feat: add entries.ts parser utility"

### Task 8: Create entries.ts Writer
- [ ] Create scripts/utils/write-entries.ts
- [ ] Implement writeEntriesFile function
- [ ] Preserve file formatting and structure
- [ ] Sort new entries alphabetically
- [ ] Write unit tests
- [ ] Run tests: npm test
- [ ] Commit: "feat: add entries.ts writer utility"

### Task 9: Create Update Script
- [ ] Create scripts/update-entries.ts
- [ ] Read discovery results from JSON file
- [ ] Parse current entries.ts
- [ ] Merge new and updated entries
- [ ] Preserve installConfig and other manual fields
- [ ] Generate UpdateSummary
- [ ] Write updated entries.ts
- [ ] Add --dry-run flag support
- [ ] Write integration tests
- [ ] Run tests: npm test
- [ ] Commit: "feat: add entries update script"

### Task 10: Add Update npm Script
- [ ] Add "update-entries" script to package.json
- [ ] Test locally: npm run update-entries -- --dry-run
- [ ] Verify entries.ts updates correctly
- [ ] Commit: "chore: add update-entries npm script"

## Phase 4: GitHub Actions Workflow

### Task 11: Create Workflow File
- [ ] Create .github/workflows/auto-discover-mcp.yml
- [ ] Add schedule trigger (cron: '0 0 * * *')
- [ ] Add workflow_dispatch trigger
- [ ] Add checkout step
- [ ] Add setup-node step (v20)
- [ ] Add npm ci step
- [ ] Commit: "ci: add MCP auto-discovery workflow skeleton"

### Task 12: Add Discovery and Update Steps
- [ ] Add step to run discovery script
- [ ] Save discovery results to JSON file
- [ ] Add step to run update script
- [ ] Configure git user for commits
- [ ] Add conditional commit step (only if changes)
- [ ] Commit: "ci: add discovery and update steps to workflow"

### Task 13: Add PR Creation Step
- [ ] Add peter-evans/create-pull-request action
- [ ] Configure branch name: auto-update-mcp-servers-YYYY-MM-DD
- [ ] Set PR title template
- [ ] Create PR body template with summary
- [ ] Add labels: automated, mcp-servers
- [ ] Set assignee to repo owner
- [ ] Commit: "ci: add PR creation to workflow"

### Task 14: Add PR Body Template
- [ ] Create scripts/utils/generate-pr-body.ts
- [ ] Implement generatePRBody function
- [ ] Format new entries section
- [ ] Format updated entries section
- [ ] Include change details
- [ ] Write unit tests
- [ ] Run tests: npm test
- [ ] Update workflow to use generated PR body
- [ ] Commit: "feat: add PR body generator"

## Phase 5: Error Handling and Validation

### Task 15: Add Rate Limit Handling
- [ ] Add rate limit check in discovery script
- [ ] Implement exponential backoff for retries
- [ ] Log remaining rate limit
- [ ] Add timeout handling (30s per request)
- [ ] Write tests for retry logic
- [ ] Run tests: npm test
- [ ] Commit: "feat: add rate limit and retry handling"

### Task 16: Add Entry Validation
- [ ] Import validateEntries from src/data/validateEntries.ts
- [ ] Validate all generated entries
- [ ] Skip invalid entries with warnings
- [ ] Include skipped entries in summary
- [ ] Write tests for validation integration
- [ ] Run tests: npm test
- [ ] Commit: "feat: add entry validation to discovery"

### Task 17: Add Error Handling
- [ ] Add try-catch blocks in discovery script
- [ ] Handle README fetch failures (use description fallback)
- [ ] Handle empty descriptions (use "No description provided")
- [ ] Handle missing topics (empty array)
- [ ] Handle API errors gracefully
- [ ] Log errors with context
- [ ] Write tests for error scenarios
- [ ] Run tests: npm test
- [ ] Commit: "feat: add comprehensive error handling"

## Phase 6: Testing and Documentation

### Task 18: Add End-to-End Test
- [ ] Create scripts/test-e2e.ts
- [ ] Mock GitHub API responses
- [ ] Run full discovery → update flow
- [ ] Verify entries.ts changes
- [ ] Verify summary output
- [ ] Run test: npm run test:e2e
- [ ] Commit: "test: add end-to-end test for auto-discovery"

### Task 19: Update README
- [ ] Add "Auto-Discovery" section to README.md
- [ ] Document how the workflow works
- [ ] Explain manual trigger process
- [ ] Document npm scripts (discover-mcp, update-entries)
- [ ] Add troubleshooting section
- [ ] Commit: "docs: document MCP auto-discovery workflow"

### Task 20: Test Workflow Manually
- [ ] Push all changes to GitHub
- [ ] Trigger workflow manually via GitHub Actions UI
- [ ] Verify workflow runs successfully
- [ ] Check PR is created correctly
- [ ] Review PR content and formatting
- [ ] Merge PR if everything looks good
- [ ] Document any issues found

## Phase 7: Monitoring and Refinement

### Task 21: Add Logging
- [ ] Add structured logging to discovery script
- [ ] Log API calls and responses
- [ ] Log entry transformations
- [ ] Log validation results
- [ ] Add log level configuration
- [ ] Commit: "feat: add structured logging"

### Task 22: Add Metrics
- [ ] Track discovery duration
- [ ] Track API request count
- [ ] Track success/failure rates
- [ ] Output metrics in workflow summary
- [ ] Commit: "feat: add metrics tracking"

### Task 23: Final Review
- [ ] Run all tests: npm test
- [ ] Run TypeScript build: npm run build
- [ ] Test dry-run mode locally
- [ ] Review all code for consistency
- [ ] Check for any TODOs or placeholders
- [ ] Verify all commits are clean
- [ ] Create final summary commit

## Notes

- Each task should be completed and tested before moving to the next
- Commit frequently with clear, descriptive messages
- Run tests after each implementation task
- Use --dry-run flags for local testing before running actual updates
- Review PR carefully before merging automated changes
