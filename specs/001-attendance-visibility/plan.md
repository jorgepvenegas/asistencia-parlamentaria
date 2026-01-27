# Implementation Plan: QuienAtiende - Citizen Attendance Tracker

**Branch**: `001-attendance-visibility` | **Date**: 2026-01-27 | **Spec**: [specs/001-attendance-visibility/spec.md](spec.md)
**Input**: Feature specification from `specs/001-attendance-visibility/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

QuienAtiende is a public-facing transparency platform enabling citizens to view politician and government official attendance data. Primary feature: yearly overview with 2026 monthly drilldown. Secondary features: party filtering, individual search, stacked chart visualizations. Tech approach: Astro frontend (mobile-first) + Hono.js API backend + SQLite database. Data fetching via GitHub Actions + Playwright script daily at 3 am PT. Zero authentication, fully public. Packaged as pnpm monorepo.

## Technical Context

**Language/Version**: TypeScript (Node.js 18+ for API, browser/Node for frontend)
**Primary Dependencies**: Astro (frontend framework), Hono.js (API framework), SQLite (database), Playwright (data fetching), pnpm (package manager)
**Storage**: SQLite database with simple relational schema (politicians, attendance_records, parties)
**Testing**: Vitest (unit/integration), Playwright (e2e), custom scripts for accessibility testing
**Target Platform**: Web (browser + server). Fully responsive (mobile-first). Modern browsers only (Chrome, Safari, Firefox, Edge last 2 versions).
**Project Type**: Web application (monorepo with frontend + API separated via pnpm workspaces)
**Performance Goals**: <2s load time (yearly view, 4G mobile), <3s search result, <500ms API responses (p95), <500KB initial JS, 10k concurrent users
**Constraints**: No backend state required per spec (stateless). Daily data updates at 3 am PT. WCAG 2.1 AA accessibility mandatory.
**Scale/Scope**: ~400 politicians/officials expected, 1-3 years historical data, ~10k concurrent users estimated, real-time 2026 monthly updates

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Principles Alignment:**

1. ✅ **Code Quality**: TypeScript enforces type safety. ESLint + Prettier for formatting. SQLite schema versioning via migrations. No `any` types allowed.
2. ✅ **Modularity**: pnpm workspaces separate frontend (Astro) and API (Hono.js) into isolated packages. Clear boundaries. Independent testability.
3. ✅ **Usability**: No auth required (spec requirement). Clear data visualization (stacked charts). Self-explanatory UI per spec requirement.
4. ✅ **Accessibility**: WCAG 2.1 AA compliance mandatory per spec. Astro supports semantic HTML. Chart library selection must support alt text/screen readers.
5. ✅ **Testing Standards**: >80% coverage target. Unit tests for data models. Integration tests for API endpoints. E2E tests for user journeys (Playwright).
6. ✅ **UX Consistency**: Astro component-based design enables consistency. Design tokens for colors, spacing, typography.
7. ✅ **Performance Requirements**: <2s load time, <500ms API, <500KB JS, 10k concurrent users. Performance monitoring required. Bundle analysis in CI/CD.

**Violations**: None identified. All principles can be met with chosen tech stack and requirements.

**Quality Gates Pre-Phase-0**:
- ✅ Type safety: TypeScript strict mode
- ✅ Linting: ESLint + Prettier configured
- ✅ Test coverage: >80% target
- ✅ Accessibility: WCAG AA testing plan required (automated + manual)
- ✅ Performance: Bundle analysis + load time monitoring
- ✅ Design: Figma/design system TBD in Phase 1

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
pnpm monorepo structure with workspaces (frontend + API separated):

packages/
├── frontend/                 # Astro web app (pnpm create astro)
│   ├── src/
│   │   ├── components/       # Reusable UI components (charts, filters, etc.)
│   │   ├── layouts/          # Base HTML structure
│   │   ├── pages/            # Route definitions (index, [year], [politician], etc.)
│   │   ├── services/         # API client, data fetching, utilities
│   │   └── styles/           # CSS/SCSS shared across components
│   ├── public/               # Static assets (images, fonts)
│   ├── tests/
│   │   ├── unit/             # Component and utility tests (Vitest)
│   │   ├── integration/       # Page and workflow tests (Vitest)
│   │   └── e2e/              # Full user journeys (Playwright)
│   ├── astro.config.mjs
│   ├── package.json
│   └── tsconfig.json
│
├── api/                      # Hono.js API (pnpm create hono)
│   ├── src/
│   │   ├── routes/           # API endpoints (politicians, attendance, search, etc.)
│   │   ├── models/           # Data models, validation schemas
│   │   ├── services/         # Business logic (queries, calculations)
│   │   ├── middleware/       # CORS, logging, error handling
│   │   ├── db/               # SQLite setup, migrations, queries
│   │   └── index.ts          # Server entry point
│   ├── tests/
│   │   ├── contract/         # API contract tests (request/response validation)
│   │   ├── integration/       # Endpoint tests with database (Vitest)
│   │   └── unit/             # Service and model tests (Vitest)
│   ├── package.json
│   ├── tsconfig.json
│   └── wrangler.toml         # Optional: Cloudflare Workers config if deployed there
│
├── automation/               # Data fetching automation
│   ├── scripts/
│   │   └── fetch-attendance.ts # Playwright script to fetch data
│   ├── .github/
│   │   └── workflows/
│   │       └── fetch-daily.yml # GitHub Actions: 3 am PT daily trigger
│   └── package.json
│
├── shared/                   # Optional: types/schemas shared between packages
│   ├── src/
│   │   ├── types.ts          # Shared TypeScript types
│   │   └── schemas.ts        # Validation schemas (Zod)
│   └── package.json
│
└── pnpm-workspace.yaml       # Workspace configuration
```

**Structure Decision**: Web application monorepo with **pnpm workspaces** separating frontend (Astro), API (Hono.js), automation (GitHub Actions), and optional shared types package. Each package has independent tests, dependencies, and tsconfig. Frontend communicates with API via HTTP. Data updates via GitHub Actions workflow running Playwright script daily at 3 am PT. SQLite database persists attendance data, accessed by API only.

## Phase 0: Research & Investigation

**Purpose**: Resolve technology decisions and document best practices.

**Research Tasks**:

1. **pnpm workspaces best practices**: Configuration, dependency hoisting, shared scripts
2. **Astro mobile-first optimization**: Image optimization, responsive design, performance budgets
3. **Hono.js API patterns**: Routing, middleware, error handling, CORS for public API
4. **SQLite for web apps**: Connection pooling, migration strategies, data backup
5. **Playwright for data scraping**: Handling JavaScript-heavy pages, error recovery, scheduling
6. **GitHub Actions scheduling**: 3 am PT trigger with timezone handling, retry logic
7. **Accessibility in Astro + charts**: Screen reader support, semantic HTML, chart libraries (Recharts/Chart.js evaluation)
8. **Performance budgeting**: Bundle analysis setup, monitoring, optimization strategies

**Deliverable**: `research.md` documenting decisions, alternatives considered, and rationale.

---

## Phase 1: Design & Contracts

**Prerequisites**: `research.md` complete

### 1.1 Data Model (`data-model.md`)

**Entities to design**:

- **Politician/Official**: id, name, party_id, position, created_at
- **Political Party**: id, name, color (for charts), slug
- **Attendance Record**: id, politician_id, date, session_type, status (attended/unattended/excused), reason, year, month, created_at
- **Attendance Summary**: id, politician_id, year, month, total_sessions, attended_count, unattended_count, excused_count, percentage
- **Metadata**: data_source, last_update_timestamp, data_version

**Relationships**: Politician → Party (many:one), Politician → AttendanceRecords (one:many), AttendanceRecords → AttendanceSummary (one:many)

### 1.2 API Contracts (`contracts/`)

**Endpoints needed** (per functional requirements):

- `GET /api/politicians` - List all politicians with yearly summary
- `GET /api/politicians/:id` - Individual politician profile
- `GET /api/politicians/:id/attendance?year=YYYY&month=MM` - Detailed attendance records
- `GET /api/search?q=name` - Search politicians with autocomplete
- `GET /api/parties` - List all parties
- `GET /api/attendance/summary?year=YYYY&parties=id1,id2` - Aggregated stats (party filtering)
- `GET /api/metadata` - Data source, last update timestamp

**Response format**: JSON with typed schemas (Zod validation)

### 1.3 Quickstart Guide (`quickstart.md`)

- Setup pnpm, install dependencies
- Create Astro and Hono.js projects using pnpm create scripts
- Configure workspace
- Run frontend dev server + API server
- Seed sample data
- Run tests

### 1.4 Agent Context Update

Run `.specify/scripts/bash/update-agent-context.sh claude` to add tech stack context.

---

## Post-Phase-1 Constitution Re-Check

After design is complete, verify:
- ✅ Modularity: pnpm workspaces enforce boundaries
- ✅ Testing: test structure defined for >80% coverage
- ✅ Accessibility: WCAG AA testing plan included
- ✅ Performance: Bundle analysis and monitoring strategy defined
- ✅ Code Quality: TypeScript strict mode, ESLint, no `any` types

---

## Phase 2: Implementation Task Generation

**Prerequisites**: Phase 1 complete (research.md, data-model.md, contracts/openapi.yaml, quickstart.md)

**Purpose**: Break down implementation into sequenced, measurable, dependent tasks organized by critical path to MVP.

### 2.1 Task Organization Strategy

Tasks are organized in **three blocking phases** that enforce dependencies:

```
Phase 2a: Database Foundation (CRITICAL PATH)
  ├─ T001-T003: Schema, migrations, seeding
  └─ Blocks: All API endpoints (Phase 2b)

Phase 2b: API Implementation
  ├─ T004-T010: Endpoints ordered by dependency
  └─ Blocks: All frontend features (Phase 2c)

Phase 2c: Frontend Implementation
  ├─ T011-T020: Pages/components by user story priority
  └─ Depends on: Phase 2b complete

Phase 2d: Automation & Deployment
  ├─ T021+: GitHub Actions workflow, performance setup
  └─ Depends on: Phase 2a + 2b complete
```

**Why this ordering?**
- **Foundation (2a) blocks everything**: Without database schema + seeding, no API endpoint can be tested
- **API (2b) blocks frontend**: Frontend needs working endpoints to consume
- **Frontend (2c) can start incrementally**: Each page can be built independently once API ready
- **Automation (2d) last**: Deploy foundation + API + frontend first, then setup daily fetching

### 2.2 Critical Path to MVP

**MVP Definition**: Users can browse yearly attendance for 2025 and see stacked charts by politician + party

**Tasks Required for MVP** (minimum viable product):
- T001-T003 (Database foundation)
- T004 (GET /metadata - health check)
- T005 (GET /parties - party list for filtering)
- T006 (GET /politicians - main data endpoint, implements User Story 1)
- T011 (Yearly overview page - implements User Story 1 frontend)
- T012 (Stacked chart component - implements User Story 5)

**After MVP:** Can deploy and demonstrate core value. Then add remaining features in parallel.

### 2.3 Task Definition Format

Each task should include:

```markdown
**T###** [P] [User Story] - Brief title

**Reference Documents**:
- Spec: spec.md User Story X, FR-YYY
- Data Model: data-model.md section Z
- API: contracts/openapi.yaml /path/method
- Implementation: quickstart.md section N

**Dependencies**:
- Blocks: [Other task IDs that depend on this]
- Blocked By: [Task IDs that must complete first]

**Acceptance Criteria**:
- [ ] Code passes TypeScript strict mode
- [ ] >80% test coverage (unit + integration)
- [ ] Specific functional requirement met (from spec)
- [ ] Accessibility: WCAG AA where applicable
- [ ] Performance: meets constitutional requirement (e.g., <500ms API)

**Test Plan**:
- Unit: [Test file location, e.g., packages/api/tests/unit/...]
- Integration: [Integration test, e.g., packages/api/tests/integration/...]
- E2E: [If frontend, Playwright test location]

**Deliverables**:
- [List of files created/modified]
- [Code quality checks passed]
- [Tests written and passing]
```

### 2.4 Detailed Phase 2a: Database Foundation

**Purpose**: Get schema working with sample data so API development can proceed.

**T001** [P] [Foundational] - Create SQLite schema migration

**Reference Documents**:
- data-model.md: "Core Entities" (sections 1.1-1.5) for complete schema
- data-model.md: "Data Validation & Constraints" for rules
- data-model.md: "Query Patterns" for indices needed
- quickstart.md: Section 4 for database path

**Dependencies**: None (critical path starts here)

**Acceptance Criteria**:
- [ ] Migration file: `packages/api/db/migrations/001_init.sql`
- [ ] All 5 tables created: politicians, parties, attendance_records, attendance_summaries, metadata
- [ ] All foreign key constraints defined
- [ ] All unique constraints defined (e.g., politician_id + date)
- [ ] All indices created for query performance (see data-model.md indices section)
- [ ] TypeScript types compile without errors

**Test Plan**:
- Unit: `packages/api/tests/unit/db/migration.test.ts` - verify schema structure
- Integration: `packages/api/tests/integration/db/schema.test.ts` - verify constraints work

**Deliverables**:
- `packages/api/db/migrations/001_init.sql` (complete schema)
- `packages/api/tests/unit/db/migration.test.ts`
- `packages/api/tests/integration/db/schema.test.ts`

---

**T002** [P] [Foundational] - Implement migration runner

**Reference Documents**:
- data-model.md: "Migration & Seeding" → "Migration Runner" section (includes code)
- quickstart.md: Section 4 for expected behavior

**Dependencies**:
- Blocked By: T001
- Blocks: T003, T004

**Acceptance Criteria**:
- [ ] File: `packages/api/src/db/migrate.ts`
- [ ] Function tracks applied migrations in database
- [ ] Handles pending migrations correctly
- [ ] Idempotent: running twice doesn't break (test by running twice)
- [ ] Error handling: logs errors clearly, doesn't crash silently

**Test Plan**:
- Unit: `packages/api/tests/unit/db/migrate.test.ts` - test migration tracking
- Integration: `packages/api/tests/integration/db/migrate.test.ts` - test with real DB file

**Deliverables**:
- `packages/api/src/db/migrate.ts`
- `packages/api/tests/unit/db/migrate.test.ts`
- `packages/api/tests/integration/db/migrate.test.ts`

---

**T003** [P] [Foundational] - Create data seeding script

**Reference Documents**:
- data-model.md: "Data Seeding" section (includes sample data structure)
- data-model.md: "Entity Relationships" diagram for seed order
- quickstart.md: Section 4 shows expected usage

**Dependencies**:
- Blocked By: T002 (migration runner must exist)
- Blocks: API testing (all endpoints need sample data)

**Acceptance Criteria**:
- [ ] File: `packages/api/db/seed.ts`
- [ ] Creates: 3 political parties with distinct colors
- [ ] Creates: 3 test politicians across 2-3 parties
- [ ] Creates: 30 days of attendance records (all statuses: attended, unattended, excused)
- [ ] Updates metadata with last_update timestamp
- [ ] Idempotent: can be run multiple times without duplicates
- [ ] Script callable from package.json: `pnpm run seed`

**Test Plan**:
- Integration: `packages/api/tests/integration/db/seed.test.ts` - verify seed produces expected data structure

**Deliverables**:
- `packages/api/db/seed.ts`
- `packages/api/db/seed.sql` (alternative if pure SQL preferred)
- `packages/api/tests/integration/db/seed.test.ts`
- Updated `packages/api/package.json` with seed script

---

### 2.5 Detailed Phase 2b: API Implementation

**Purpose**: Build RESTful endpoints consuming database, ordered by complexity + dependency.

**Endpoint Build Order** (simplest first):
1. T004: GET /metadata (no DB queries, returns static data)
2. T005: GET /parties (simple list query)
3. T006: GET /politicians (main endpoint, aggregation from AttendanceSummary)
4. T007: GET /search (name search, autocomplete)
5. T008: GET /politicians/:id (detail endpoint)
6. T009: GET /politicians/:id/attendance (monthly detail)
7. T010: GET /attendance/summary (party filtering, aggregation)

**T004** [P] [Foundational] - Implement GET /metadata endpoint

**Reference Documents**:
- contracts/openapi.yaml: `/metadata` section (schema, responses)
- plan.md: "Technical Context" (data source, schema version)
- quickstart.md: Section 7 for test command

**Dependencies**:
- Blocked By: T002 (needs migration runner to initialize DB)
- Blocks: T006+ (provides system health check)

**Acceptance Criteria**:
- [ ] Endpoint: `GET /api/metadata`
- [ ] Returns: last_update, data_source, schema_version, available_years (per openapi.yaml)
- [ ] Response matches openapi.yaml schema exactly
- [ ] Handles missing metadata gracefully
- [ ] Response time <100ms (fast endpoint, no aggregation)

**Test Plan**:
- Contract: `packages/api/tests/contract/metadata.test.ts` - validate response matches openapi.yaml schema
- Integration: `packages/api/tests/integration/routes/metadata.test.ts` - test actual endpoint

**Deliverables**:
- `packages/api/src/routes/metadata.ts`
- `packages/api/src/services/metadata.ts` (if separating logic)
- `packages/api/tests/contract/metadata.test.ts`
- `packages/api/tests/integration/routes/metadata.test.ts`

---

**T005** [P] [Foundational] - Implement GET /parties endpoint

**Reference Documents**:
- contracts/openapi.yaml: `/parties` section (response schema)
- data-model.md: Section 1.2 "Party entity" (fields, colors)
- quickstart.md: Section 7 for manual testing

**Dependencies**:
- Blocked By: T003 (needs seeded parties data)
- Blocks: T006 (politicians endpoint depends on parties for filtering)

**Acceptance Criteria**:
- [ ] Endpoint: `GET /api/parties`
- [ ] Returns: all parties with id, name, slug, color
- [ ] Response matches openapi.yaml schema
- [ ] Colors are valid hex codes (for chart rendering)
- [ ] Response time <200ms
- [ ] Returns empty array if no parties (graceful)

**Test Plan**:
- Contract: `packages/api/tests/contract/parties.test.ts`
- Integration: `packages/api/tests/integration/routes/parties.test.ts` - verify seeded data returned

**Deliverables**:
- `packages/api/src/routes/parties.ts`
- `packages/api/src/services/parties.ts` (queries)
- Contract + integration tests

---

**T006** [P] [User Story 1] - Implement GET /politicians endpoint

**Reference Documents**:
- contracts/openapi.yaml: `/politicians` section (full specification)
- data-model.md: Section 1.1 "Politician entity", Section 1.4 "AttendanceSummary entity"
- data-model.md: "Query Patterns" → Query 1 (get yearly summary)
- spec.md: User Story 1 "Browse Yearly Attendance" (acceptance criteria)
- quickstart.md: Section 7 for testing

**Dependencies**:
- Blocked By: T003, T005 (needs seeded data + parties endpoint working)
- Blocks: T011 (frontend needs this endpoint)

**Acceptance Criteria**:
- [ ] Endpoint: `GET /api/politicians?year=2025&party_id=PARTY_001&sort=attendance_desc&limit=100`
- [ ] Returns: politicians list with attendance_percent (from AttendanceSummary)
- [ ] Filtering by year: only returns records for that year
- [ ] Filtering by party_id: correctly filters by party
- [ ] Sorting: attendance_desc, attendance_asc, name_asc, name_desc
- [ ] Pagination: limit + offset work
- [ ] Response matches openapi.yaml exactly
- [ ] Response time <500ms for 400 politicians (p95)
- [ ] Implements User Story 1 acceptance criteria (yearly attendance visible)

**Test Plan**:
- Unit: `packages/api/tests/unit/services/politicians.test.ts` - test query logic
- Integration: `packages/api/tests/integration/routes/politicians.test.ts` - test endpoint with seeded data
- Contract: `packages/api/tests/contract/politicians.test.ts` - validate schema
- Performance: `packages/api/tests/integration/perf/politicians.perf.test.ts` - verify <500ms response

**Deliverables**:
- `packages/api/src/routes/politicians.ts`
- `packages/api/src/services/politicians.ts` (getPoliticiansWithSummary query)
- All test files above
- Update API middleware if needed (CORS, error handling)

---

**T007** [P] [User Story 4] - Implement GET /search endpoint

**Reference Documents**:
- contracts/openapi.yaml: `/search` section
- data-model.md: Section 1.1 Politician entity, Query Pattern 3 (search index)
- spec.md: User Story 4 "Search and View Individual Politician Details"
- quickstart.md: Section 7 for testing

**Dependencies**:
- Blocked By: T003 (needs seeded politicians data)
- Independent of: T006 (can be built in parallel)

**Acceptance Criteria**:
- [ ] Endpoint: `GET /api/search?q=María&limit=10`
- [ ] Returns: matching politicians with autocomplete suggestions
- [ ] Search uses name field with LIKE or full-text index
- [ ] Limit parameter works (default 10, max 50)
- [ ] Case-insensitive search
- [ ] Response time <200ms
- [ ] Returns [] if no matches

**Test Plan**:
- Integration: `packages/api/tests/integration/routes/search.test.ts` - test with seeded data

**Deliverables**:
- `packages/api/src/routes/search.ts`
- `packages/api/src/services/politicians.ts` - add searchPoliticians function

---

**T008, T009, T010** - [Continue for remaining endpoints following same pattern]

Each endpoint task should:
- Reference openapi.yaml for exact contract
- Reference data-model.md for entities + query patterns
- Reference spec.md for user stories it implements
- Include contract + integration tests
- Specify performance requirements

### 2.6 Detailed Phase 2c: Frontend Implementation

**Purpose**: Build Astro pages + components consuming API, ordered by user story priority + dependencies.

**T011** [P] [User Story 1] - Create yearly overview page (index.astro)

**Reference Documents**:
- spec.md: User Story 1 "Browse Yearly Attendance" (acceptance scenarios)
- contracts/openapi.yaml: `/politicians`, `/parties`, `/metadata` endpoints consumed
- research.md: Section 2 "Astro Mobile-First Optimization" (image optimization, responsive design)
- research.md: Section 7 "Accessibility in Astro + charts" (WCAG AA requirements)
- quickstart.md: Section 2 "Create Astro Frontend"

**Dependencies**:
- Blocked By: T006, T005 (API endpoints must be working)
- Blocks: T012, T013 (chart + filter components)

**Acceptance Criteria**:
- [ ] Page: `packages/frontend/src/pages/index.astro`
- [ ] Displays: all politicians with attendance % (User Story 1 acceptance scenario 1)
- [ ] Shows: top performers + bottom performers highlighted (scenario 2)
- [ ] Includes: legend explaining "attended", "unattended", "reason unavailable" (scenario 3)
- [ ] Mobile-responsive: works on mobile without horizontal scroll (User Story 6)
- [ ] Accessible: WCAG 2.1 AA (semantic HTML, keyboard nav, screen reader)
- [ ] Performance: page load <2s on 4G mobile (constitution requirement)
- [ ] Tests: E2E test verifies data displays correctly

**Test Plan**:
- E2E: `packages/frontend/tests/e2e/pages/index.e2e.ts` - load page, verify data renders
- Accessibility: Manual screen reader testing (NVDA/JAWS/VoiceOver)
- Performance: Lighthouse CI check in pre-deploy

**Deliverables**:
- `packages/frontend/src/pages/index.astro`
- `packages/frontend/src/layouts/BaseLayout.astro` (if creating shared layout)
- `packages/frontend/tests/e2e/pages/index.e2e.ts`
- Accessibility testing notes

---

**T012** [P] [User Story 5] - Create stacked chart component

**Reference Documents**:
- spec.md: User Story 5 "Visualize Attendance Distribution with Stacked Charts" (acceptance criteria)
- research.md: Section 7 "Accessibility in Astro + charts" (Recharts vs Chart.js, WCAG AA)
- data-model.md: "AttendanceSummary" entity (attended_count, unattended_count, excused_count fields)

**Dependencies**:
- Blocked By: T011 (page needs chart component)
- Blocks: All pages using charts

**Acceptance Criteria**:
- [ ] Component: `packages/frontend/src/components/StackedChart.astro`
- [ ] Renders: stacked bar chart with attended/unattended/excused breakdown
- [ ] Tooltip: hovering/tapping shows exact count + percentage (scenario 2)
- [ ] Mobile: readable on small screens, optimized layout (scenario 3, User Story 6)
- [ ] Accessible: WCAG 2.1 AA (aria-label, color not sole info source, keyboard nav)
- [ ] Props: accepts data array with attended/unattended/excused counts

**Test Plan**:
- Unit: `packages/frontend/tests/unit/components/StackedChart.test.ts` - component renders correctly
- Accessibility: `packages/frontend/tests/a11y/StackedChart.a11y.ts` - axe-core checks, manual review
- E2E: Charts in page tests verify interactivity

**Deliverables**:
- `packages/frontend/src/components/StackedChart.astro`
- Unit + a11y tests
- Integration with Recharts or Chart.js (per research.md selection)

---

[Subsequent tasks T013-T020 follow same pattern for remaining user stories]

### 2.7 Phase 2d: Automation & Deployment

**T021** - Setup GitHub Actions daily fetch workflow

**Reference Documents**:
- research.md: Section 6 "GitHub Actions Scheduling (3 am PT daily)" (workflow template)
- quickstart.md: Section 3 "Create Hono.js API" (API setup for automated runner)

**Dependencies**:
- Blocked By: T001-T010 (API + database must be stable before automation)

**Acceptance Criteria**:
- [ ] Workflow: `.github/workflows/fetch-daily.yml`
- [ ] Trigger: cron `0 10 * * *` (10 am UTC = 3 am PT, handles DST)
- [ ] Runs: Playwright script to fetch attendance data
- [ ] Updates: database with new records
- [ ] Error handling: logs errors, retries up to 3x with backoff

---

### 2.8 MVP Checkpoint

**After T001-T003, T004-T006, T011, T012 complete:**

✅ **Minimum Viable Product Ready**

What's working:
- Citizens can load home page
- See all politicians with yearly attendance %
- View stacked charts showing attended/unattended/excused breakdown
- Mobile responsive

What's coming next (parallel development):
- Monthly detail view (T014)
- Party filtering (T015)
- Individual search (T016)
- GitHub Actions automation (T021)
- Performance optimization & deployment (T022+)

Can deploy at this checkpoint and gather user feedback.

### 2.9 Task Generation Command

Run `/speckit.tasks` to generate the complete task list from this plan.

**Command**:
```bash
speckit.tasks
```

**Expected Output**:
- `specs/001-attendance-visibility/tasks.md`
- Detailed breakdown of all 25+ tasks
- Dependencies clearly marked
- Test requirements specified
- Cross-references to spec, data-model, openapi

---

## Implementation Quality Checklist

Every task should include tests that verify:

### Code Quality (per Constitution)
- [ ] TypeScript strict mode passes (no `any`, strict null checks)
- [ ] ESLint + Prettier pass (code formatting)
- [ ] No dead code or unused imports

### Testing (per Constitution)
- [ ] Unit tests for services/models (>80% coverage target)
- [ ] Integration tests for API endpoints
- [ ] E2E tests for user workflows (Playwright)
- [ ] Contract tests validate openapi.yaml compliance

### Accessibility (per Constitution)
- [ ] WCAG 2.1 AA level for UI components
- [ ] Screen reader testing (manual)
- [ ] Keyboard navigation verified
- [ ] Color contrast 4.5:1 minimum (axe-core checks)

### Performance (per Constitution)
- [ ] API responses <500ms (p95)
- [ ] Frontend <2s load time (Lighthouse CI)
- [ ] JS bundle <500KB
- [ ] Images optimized (WebP with fallback)

### Documentation
- [ ] Inline code comments for complex logic
- [ ] README updates for new features
- [ ] Test descriptions explain acceptance criteria
