---
description: "Task list for QuienAtiende feature implementation"
---

# Tasks: QuienAtiende - Citizen Attendance Tracker

**Input**: Design documents from `/specs/001-attendance-visibility/`
**Prerequisites**: plan.md (tech stack), spec.md (user stories), data-model.md (entities), contracts/openapi.yaml (API), quickstart.md (setup)

**Organization**: Tasks grouped by critical path + user story priority. Each user story independently testable and deployable.

**Total Tasks**: 28 core tasks (+ optional Polish phase tasks)
**Phases**: Setup (1) → Foundational (3) → User Stories (18) → Automation (2) → Polish (4)

---

## Format: `[ID] [P?] [Story?] Description`

- **[ID]**: Task identifier (T001, T002, etc.) in execution order
- **[P]**: Task can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label [US1], [US2], etc. (only in User Story phases)
- **File paths**: Exact location where code lives

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize monorepo structure, install dependencies, configure tooling

### Monorepo & Workspace Setup

- [x] T001 Setup pnpm workspaces and root configuration
  - Create `pnpm-workspace.yaml` defining `packages/**` glob
  - Create root `package.json` with shared scripts: `pnpm -r run build`, `pnpm -r run test`
  - Create root `tsconfig.json` base configuration for TypeScript inheritance
  - Reference: plan.md Section "Project Structure", quickstart.md Section 1
  - Expected: Workspace ready for `pnpm install`

- [x] T002 [P] Create Astro frontend project structure
  - Run: `pnpm create astro -- --template minimal packages/frontend`
  - Configure `packages/frontend/package.json` with Astro, Tailwind, Vitest, Playwright
  - Setup TypeScript strict mode in `packages/frontend/tsconfig.json`
  - Install: `cd packages/frontend && pnpm install && npx astro add tailwind`
  - Reference: quickstart.md Section 2
  - Expected: `packages/frontend/` ready for component development

- [x] T003 [P] Create Hono.js API project structure
  - Run: `pnpm create hono -- packages/api`
  - Configure `packages/api/package.json` with Hono, better-sqlite3, Zod, Vitest
  - Setup TypeScript strict mode in `packages/api/tsconfig.json`
  - Install: `cd packages/api && pnpm install`
  - Reference: quickstart.md Section 3
  - Expected: `packages/api/` ready for endpoint development

- [x] T004 [P] Create shared types/schemas package
  - Create `packages/shared/src/types.ts` with TypeScript interfaces for all entities
  - Create `packages/shared/src/schemas.ts` with Zod validation schemas
  - Setup `packages/shared/package.json` and `tsconfig.json`
  - Reference: data-model.md "Core Entities" sections 1.1-1.5
  - Expected: Shared types available to both frontend and API via `@quienatiende/shared`

- [x] T005 [P] Configure linting, formatting, and CI/CD foundations
  - Create `.eslintrc.json` at root (TypeScript strict rules)
  - Create `.prettierrc` for code formatting
  - Create `scripts/lint.sh` and `scripts/format.sh` at root
  - Add pre-commit hooks (optional: husky configuration)
  - Reference: constitution.md "Quality Gates" (linting & formatting mandatory)
  - Expected: All packages can run `pnpm lint` and `pnpm format`

---

## Phase 2: Foundational (BLOCKING all user stories)

**Purpose**: Database infrastructure + shared services that all features depend on. MUST complete before Phase 3.

**Critical Path**: These 3 tasks unlock all API endpoints and frontend features.

- [x] T006 Create SQLite schema migration
  - Create: `packages/api/db/migrations/001_init.sql`
  - Schema: All 5 tables per data-model.md sections 1.1-1.5
    - `parties` (id, name, slug, color)
    - `politicians` (id, name, party_id, position, is_active)
    - `attendance_records` (id, politician_id, date, status, reason, year, month)
    - `attendance_summaries` (id, politician_id, year, month, attended_count, percentage_attended)
    - `metadata` (key, value)
  - Constraints: Foreign keys, unique constraints (politician_id + date), is_active = TRUE default
  - Indices: Per data-model.md "Query Patterns" section (6 indices for performance)
  - Reference: data-model.md sections 1.1-1.5, "Core Entities" + "Data Validation & Constraints"
  - Test: `packages/api/tests/integration/db/schema.test.ts` verify table structure + constraints
  - Expected: Migration file ready to apply, schema matches data-model.md exactly

- [x] T007 Implement migration runner & database initialization
  - Create: `packages/api/src/db/migrate.ts`
  - Functionality: Runs pending migrations, tracks applied migrations in DB
  - Create: `packages/api/src/db/init.ts` (database connection + migration execution)
  - Add to `packages/api/package.json`: script `pnpm run migrate`
  - Reference: data-model.md "Migration & Seeding" → "Migration Runner" section (includes code)
  - Test: `packages/api/tests/unit/db/migrate.test.ts` verify tracking + idempotence
  - Expected: Can run `pnpm -F api run migrate` successfully; second run is idempotent

- [x] T008 Create data seeding script with sample data
  - Create: `packages/api/db/seed.ts` or `seed.sql`
  - Seed data: 3 political parties, 3 test politicians, 30 days attendance records (all statuses)
  - Reference: data-model.md "Data Seeding" section + spec.md edge cases (handle missing data)
  - Add to `packages/api/package.json`: script `pnpm run seed`
  - Test: `packages/api/tests/integration/db/seed.test.ts` verify seed produces correct structure
  - Expected: Can run `pnpm -F api run seed`; creates expected test data without duplicates

---

## Phase 3: User Story 1 - Browse Yearly Attendance Overview (Priority: P1)

**Goal**: Citizens view yearly attendance for all politicians with summary statistics and stacked charts

**Independent Test**: Load home page → verify politicians list visible → verify attendance % displayed → verify charts render

**API Requirements** (from data-model.md query patterns):
- Query 1: Get yearly summary (Politician + AttendanceSummary aggregation)

**Frontend Requirements** (from spec.md User Story 1):
- Display politician names, attendance percentages
- Show top/bottom performers highlighted
- Include legend explaining attendance statuses

---

### API Implementation for US1

- [x] T009 [P] Create TypeScript types and Zod schemas for API responses
  - Export from `packages/shared/src/types.ts`: Politician, Party, AttendanceSummary, AttendanceRecord
  - Create in `packages/shared/src/schemas.ts`: Zod schemas for validation
  - Reference: data-model.md sections 1.1, 1.2, 1.4 for field definitions
  - Test: `packages/shared/tests/schemas.test.ts` verify schema validation
  - Expected: Types + schemas compile, usable by API routes + frontend

- [x] T010 [P] Implement GET /metadata endpoint (health check, no aggregation)
  - Create: `packages/api/src/routes/metadata.ts`
  - Response: `{ last_update, data_source, schema_version, available_years }`
  - Reference: contracts/openapi.yaml `/metadata` section
  - Test: `packages/api/tests/contract/metadata.test.ts` validate schema matches openapi.yaml
  - Performance: <100ms response (no DB aggregation)
  - Expected: `GET http://localhost:3000/api/metadata` returns correct structure

- [x] T011 [P] Implement GET /parties endpoint (foundational for filtering)
  - Create: `packages/api/src/routes/parties.ts` + `packages/api/src/services/parties.ts`
  - Service function: `getParties()` → returns all parties with colors
  - Response: Array of `{ id, name, slug, color, abbreviation }`
  - Reference: contracts/openapi.yaml `/parties` section, data-model.md 1.2
  - Test: `packages/api/tests/contract/parties.test.ts` + integration test with seeded data
  - Performance: <200ms response
  - Expected: `GET http://localhost:3000/api/parties` returns 3 test parties with colors

- [x] T012 [P] Implement database service layer for politicians queries
  - Create: `packages/api/src/services/politicians.ts`
  - Functions:
    - `getPoliticiansWithSummary(year, party_id?, sort?, limit, offset)` → yearly overview
    - `getPoliticianDetail(id)` → single politician profile
    - `searchPoliticians(query, limit)` → name search
  - Reference: data-model.md "Query Patterns" queries 1-3, 5
  - Query joins: politicians → party, politicians → attendance_summaries
  - Test: `packages/api/tests/unit/services/politicians.test.ts` query correctness
  - Expected: All functions return correct data structure, handle edge cases (missing data)

- [x] T013 Implement GET /politicians endpoint (main data endpoint for US1)
  - Create: `packages/api/src/routes/politicians.ts`
  - Endpoint: `GET /api/politicians?year=2025&party_id=PARTY_001&sort=attendance_desc&limit=100&offset=0`
  - Uses: `getPoliticiansWithSummary()` from T012 service
  - Response: `{ data: [...politicians with attendance_percent], pagination, metadata }`
  - Filtering: year (required), party_id (optional), sort (attendance_desc/asc, name_asc/desc)
  - Reference: contracts/openapi.yaml `/politicians` section, spec.md User Story 1 acceptance criteria
  - Test: `packages/api/tests/contract/politicians.test.ts` schema validation + `packages/api/tests/integration/routes/politicians.test.ts`
  - Performance: <500ms p95 for 400 politicians (per constitution.md)
  - Expected: Endpoint works, returns correct data, performance target met

- [x] T014 [US1] Implement error handling and CORS middleware for API
  - Create: `packages/api/src/middleware/errorHandler.ts`
  - Create: `packages/api/src/middleware/cors.ts`
  - Setup in `packages/api/src/index.ts`: middleware chain
  - Error responses: Consistent JSON shape `{ error, statusCode, details }`
  - CORS: Allow public access (no auth required per FR-008)
  - Reference: contracts/openapi.yaml error handling section
  - Expected: All endpoints return consistent error format, CORS enabled for frontend requests

---

### Frontend Implementation for US1

- [x] T015 [US1] Create yearly overview page (index.astro)
  - Create: `packages/frontend/src/pages/index.astro`
  - Layout: Use `BaseLayout.astro` (create in T016)
  - Content:
    - Year selector (default 2025)
    - Politicians list with attendance % per spec.md acceptance scenario 1
    - Top/bottom performers highlighted (scenario 2)
    - Legend explaining attendance statuses (scenario 3)
    - Mobile responsive (per User Story 6)
  - Fetch: Call `GET /api/politicians?year=2025` from API (created in T013)
  - Call `GET /api/parties` from API (created in T011) for colors
  - Reference: spec.md User Story 1 acceptance scenarios, research.md Astro mobile-first
  - Test: `packages/frontend/tests/e2e/pages/yearly.e2e.ts` Playwright test
  - Performance: <2s load time on 4G mobile (per SC-001)
  - Expected: Home page renders, fetches data, displays correctly

- [x] T016 [P] [US1] Create base layout component
  - Create: `packages/frontend/src/layouts/BaseLayout.astro`
  - Content: Header with app title, navigation, metadata display (last update timestamp)
  - Style: Tailwind CSS, mobile-responsive, accessible semantic HTML
  - Include: Last update timestamp from `GET /api/metadata` (FR-010)
  - Reference: research.md "Astro Mobile-First", constitution.md "Usability"
  - Expected: Reusable layout for all pages

- [x] T017 [P] [US1] Create stacked chart component (implementation for User Story 5)
  - Create: `packages/frontend/src/components/StackedChart.astro`
  - Visualization: Stacked bar chart with attended/unattended/excused breakdown
  - Interactivity:
    - Tooltip on hover/tap showing counts + percentages (spec.md US5 acceptance scenario 2)
    - Mobile optimized layout (vertical stacking, spec.md scenario 3)
  - Accessibility: WCAG 2.1 AA (aria-label, color not sole info source, keyboard nav)
  - Library: Recharts or Chart.js per research.md section 7 evaluation
  - Props: `{ data: { attended, unattended, excused }, title }`
  - Reference: spec.md User Story 5 acceptance criteria, research.md section 7 (a11y)
  - Test: `packages/frontend/tests/unit/components/StackedChart.test.ts` + a11y test
  - Expected: Chart renders correctly, responsive, accessible

- [x] T018 [US1] Integrate API calls and display data on yearly page
  - Update: `packages/frontend/src/pages/index.astro` with API integration
  - Use: `fetch('/api/politicians?year=2025')` to get data
  - Use: `fetch('/api/parties')` to get party colors
  - Handle: Loading states, error states, empty data states
  - Reference: quickstart.md Section 7 (manual testing with curl)
  - Test: `packages/frontend/tests/e2e/pages/yearly.e2e.ts` end-to-end test
  - Expected: Page loads data, displays politicians, no console errors

- [x] T019 [US1] Add accessibility testing and WCAG AA compliance for yearly page
  - Manual: Screen reader testing (VoiceOver, NVDA, JAWS)
  - Automated: Axe-core accessibility checks in `packages/frontend/tests/a11y/yearly.a11y.ts`
  - Verify: Semantic HTML, keyboard navigation, color contrast (4.5:1 per constitution.md)
  - Reference: constitution.md "Accessibility" principle, spec.md SC-005
  - Expected: Page passes WCAG 2.1 AA validation

---

## Phase 4: User Story 2 - View Monthly Attendance Progress for 2026 (Priority: P1)

**Goal**: Citizens select 2026 to see month-by-month attendance with daily participation data

**Independent Test**: Load yearly page for 2026 → click/select month → view monthly detail → verify daily records visible

---

### API Implementation for US2

- [x] T020 [P] Implement GET /politicians/:id endpoint (politician detail)
  - Create: `packages/api/src/routes/politicians/:id.ts`
  - Response: `{ id, name, party_id, position, yearly_summaries: [...], recent_attendance: [...] }`
  - Uses: `getPoliticianDetail(id)` from T012 service
  - Reference: contracts/openapi.yaml `/politicians/:id` section
  - Test: Contract + integration tests for politician detail
  - Expected: Returns full politician profile with attendance history

- [x] T021 [P] [US2] Implement GET /politicians/:id/attendance endpoint (monthly detail)
  - Create: `packages/api/src/routes/politicians/:id/attendance.ts`
  - Endpoint: `GET /api/politicians/:id/attendance?year=2026&month=3`
  - Response: Array of `{ date, status, reason }` for that month
  - Uses: Query attendance_records for politician_id + year + month
  - Reference: contracts/openapi.yaml `/politicians/:id/attendance` section
  - Test: Integration test with seeded monthly data
  - Expected: Returns daily attendance records for specified month

### Frontend Implementation for US2

- [x] T022 [P] [US2] Create monthly detail page
  - Create: `packages/frontend/src/pages/[year]/[month].astro`
  - Content: Politicians list with daily attendance for selected month
  - Fetch: `GET /api/politicians/:id/attendance?year=2026&month=3`
  - Indicator: Show "data incomplete" if current month (spec.md edge case)
  - Reference: spec.md User Story 2 acceptance scenarios 1-3
  - Test: `packages/frontend/tests/e2e/pages/monthly.e2e.ts`
  - Expected: Monthly view renders, shows daily attendance

---

## Phase 5: User Story 3 - Filter by Political Party (Priority: P2)

**Goal**: Citizens filter data by party to see party-level attendance patterns

**Independent Test**: View yearly page → apply party filter → verify only selected party shown → verify aggregate stats correct

---

### API Implementation for US3

- [x] T023 [P] Implement GET /attendance/summary endpoint (party aggregation)
  - Create: `packages/api/src/routes/attendance/summary.ts`
  - Endpoint: `GET /api/attendance/summary?year=2025&parties=PARTY_001,PARTY_002&month=3`
  - Response: Aggregate attendance by party with per-politician stats
  - Filtering: year (required), parties (optional comma-separated), month (optional)
  - Reference: contracts/openapi.yaml `/attendance/summary` section
  - Test: Integration test verify aggregation correctness
  - Performance: <500ms p95 (per constitution.md)
  - Expected: Party-level aggregation works, filtering correct

### Frontend Implementation for US3

- [x] T024 [P] [US3] Create party filter component
  - Create: `packages/frontend/src/components/PartyFilter.astro`
  - Multi-select dropdown: Select multiple parties
  - "Clear Filters" button (spec.md US3 acceptance scenario 3)
  - State management: Use Astro islands or client-side state as needed
  - Reference: spec.md User Story 3 acceptance scenarios 1-3
  - Test: `packages/frontend/tests/unit/components/PartyFilter.test.ts`
  - Expected: Filter component selectable, working

- [x] T025 [US3] Integrate party filter into yearly page
  - Update: `packages/frontend/src/pages/index.astro`
  - Add: PartyFilter component (T024)
  - Behavior: When filter changes, re-fetch data with `?party_id=...`
  - Update: Charts + table to show filtered results
  - Reference: spec.md User Story 3
  - Test: E2E test verify filtering works end-to-end
  - Expected: Filter updates page data correctly

---

## Phase 6: User Story 4 - Search & Individual Politician Details (Priority: P2)

**Goal**: Citizens search for politicians by name and view full attendance profile

**Independent Test**: Enter politician name in search → see autocomplete → select politician → view profile page

---

### API Implementation for US4

- [x] T026 [P] Implement GET /search endpoint (autocomplete)
  - Create: `packages/api/src/routes/search.ts`
  - Endpoint: `GET /api/search?q=María&limit=10`
  - Uses: `searchPoliticians(query, limit)` from T012 service
  - Response: Array of `{ id, name, party_id, party_name, position }`
  - Search: Case-insensitive name LIKE query or full-text index
  - Reference: contracts/openapi.yaml `/search` section, spec.md User Story 4
  - Test: Integration test verify search results
  - Expected: Search returns matching politicians

### Frontend Implementation for US4

- [x] T027 [P] [US4] Create search component
  - Create: `packages/frontend/src/components/Search.astro`
  - Input: Text field with autocomplete
  - Fetch: On input change, call `GET /api/search?q=...`
  - Display: Dropdown with matching politicians
  - Click: Navigate to politician detail page
  - Reference: spec.md User Story 4 acceptance scenario 1
  - Test: Unit + E2E test verify autocomplete works
  - Expected: Search suggests politician names

- [x] T028 [US4] Create politician profile page
  - Create: `packages/frontend/src/pages/politician/[id].astro`
  - Content: Name, party, position, total attendance %, reasons for absence (spec.md scenario 2)
  - Visualization: Month-by-month trend chart (scenario 3)
  - Fetch: `GET /api/politicians/:id` + `GET /api/politicians/:id/attendance?year=2026`
  - Reference: spec.md User Story 4 acceptance scenarios 2-3
  - Test: `packages/frontend/tests/e2e/pages/politician.e2e.ts`
  - Expected: Profile page renders, shows attendance history + trend

---

## Phase 7: User Story 6 - Mobile Feature Parity (Priority: P1)

**Goal**: All features work identically on mobile and desktop with touch-friendly interactions

**Independent Test**: Access all pages/features on mobile device → verify no horizontal scroll → verify all interactions work → verify charts readable

---

### Testing for US6

- [x] T029 [US6] Mobile responsive testing and optimization
  - Test: On real mobile device (iPhone, Android) or emulator
  - Verify: No horizontal scrolling, text readable, buttons touchable
  - Optimize: Tailwind responsive classes, touch-friendly button sizes (48px minimum)
  - Reference: spec.md User Story 6 acceptance scenarios 1-3, research.md Astro section
  - Test: `packages/frontend/tests/e2e/mobile.e2e.ts` Playwright mobile emulation test
  - Expected: All pages render correctly on mobile, <2s load time on 4G

- [x] T030 [US6] Charts and interactions optimized for mobile
  - Verify: Stacked charts readable on small screens
  - Optimize: Touch interactions (no hover-only features)
  - Verify: Tooltips appear on tap (not hover)
  - Reference: spec.md User Story 5 acceptance scenario 3
  - Test: Manual verification on mobile device
  - Expected: Charts work on mobile, fully interactive

---

## Phase 8: Automation & Deployment

**Purpose**: Setup daily data fetching, performance monitoring, deployment infrastructure

- [ ] T031 Create GitHub Actions workflow for daily data fetch (3 am PT)
  - Create: `.github/workflows/fetch-daily.yml`
  - Trigger: Cron `0 10 * * *` (10 am UTC = 3 am PT)
  - Runs: Playwright script to fetch attendance data (see T032)
  - Error handling: Retries up to 3x with exponential backoff
  - Notification: Logs result in GitHub Actions
  - Reference: research.md section 6 "GitHub Actions Scheduling", plan.md phase 2d
  - Expected: Workflow runs daily, logs available in GitHub Actions

- [ ] T032 [P] Implement Playwright data fetching script
  - Create: `packages/automation/scripts/fetch-attendance.ts`
  - Functionality:
    - Use Playwright to navigate external data source
    - Extract attendance data from HTML/API
    - Validate + transform to database schema
    - Upsert into SQLite (no duplicates)
    - Update metadata `last_update` timestamp
  - Error handling: Log errors, retry logic, graceful degradation
  - Reference: research.md section 5 "Playwright for Data Fetching", data-model.md schema
  - Expected: Script runs, fetches data, updates database

- [ ] T033 [P] Setup bundle analysis and performance monitoring
  - Setup: `packages/frontend/bundle-analyzer.config.js` (Webpack analyzer or similar)
  - CI: Add bundle size check to GitHub Actions (fail if >500KB)
  - Setup: Lighthouse CI in `.github/workflows/lighthouse.yml`
  - Metrics: Track load time, CLS, LCP, FID per constitution.md
  - Reference: research.md section 8 "Performance Budgeting"
  - Expected: Bundle size monitored, performance tracked

- [ ] T034 [P] Create deployment script and documentation
  - Create: `deploy.sh` or GitHub Actions deployment workflow
  - Deployment target: Cloud platform (Vercel, Railway, or self-hosted)
  - Environment setup: Configure database path, API URL for frontend
  - Migration: Automatically run migrations on deploy
  - Documentation: `DEPLOYMENT.md` with setup instructions
  - Expected: Deployment process automated, documented

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple user stories, documentation, refinement

- [ ] T035 [P] Add comprehensive API documentation
  - OpenAPI: Validate `contracts/openapi.yaml` is accurate
  - Swagger UI: Host at `/api/docs` (optional)
  - README: Document API usage, examples, error handling
  - Reference: contracts/openapi.yaml
  - Expected: Developers can understand API from documentation

- [ ] T036 [P] Create user-facing documentation and help content
  - Create: `docs/user-guide.md` explaining features
  - FAQ: Address common questions
  - Accessibility: Ensure documentation is accessible (WCAG AA)
  - Expected: Users can understand how to use the app

- [ ] T037 [P] Refactor and cleanup (code organization, dead code removal)
  - Remove: Any unused code, imports, files
  - Organize: Code follows structure defined in plan.md
  - Naming: Consistent, clear variable/function names
  - Comments: Add for complex logic only (code is documentation)
  - Expected: Codebase clean, maintainable

- [ ] T038 Run full integration tests and validation
  - E2E tests: Run all Playwright tests for all pages
  - Performance: Verify load times, bundle size meet goals
  - Accessibility: Full WCAG AA audit (automated + manual)
  - Quickstart: Run quickstart.md steps end-to-end to verify setup docs accurate
  - Expected: All systems working, documentation accurate

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** (Setup): No dependencies - start immediately
- **Phase 2** (Foundational): Depends on Phase 1 - BLOCKS all features
- **Phase 3** (US1): Depends on Phase 2 - Foundation + core data retrieval
- **Phase 4** (US2): Depends on Phase 3 - Builds on yearly view
- **Phase 5** (US3): Depends on Phase 3 - Can run in parallel with US2
- **Phase 6** (US4): Depends on Phase 3 - Can run in parallel with US2, US3
- **Phase 7** (US6): Depends on Phases 3-6 - Cross-cutting testing for all features
- **Phase 8** (Automation): Depends on Phase 2 + Phase 3 API - Deployed last
- **Phase 9** (Polish): Depends on all phases - Final refinements

### Within User Stories (Parallel Opportunities)

**Phase 3 (US1) Parallelization**:
- API tasks (T009-T014) can run in parallel (different files)
- Frontend tasks (T015-T019) can run after T013 (API endpoint ready)
- Optimal: Build API tasks together, then start frontend tasks

**Phase 4 (US2) Parallelization**:
- T020-T021 (API) can run in parallel with Phase 5/6 frontend tasks
- T022 (frontend) depends only on T021 (GET /attendance endpoint)

**Phase 5 (US3) Parallelization**:
- T023 (API summary endpoint) can start after Phase 2
- T024-T025 (frontend filter) depends only on T023

**Phase 6 (US4) Parallelization**:
- T026 (search endpoint) can start after Phase 2
- T027-T028 (frontend search) depends on T026

### Example: Two-Developer Team

```
Dev A (Backend):
  Week 1: T001-T003, T006-T007 (database foundation)
  Week 2: T009, T012-T013 (main GET /politicians endpoint)
  Week 3: T020-T021, T023, T026 (detail + search endpoints)
  Week 4: T031-T033 (automation + monitoring)

Dev B (Frontend):
  Week 1: T002-T005 (Astro setup, shared types)
  Week 2: T015-T019 (yearly page, charts, accessibility)
  Week 3: T022, T024-T025, T027-T028 (month/filter/search pages)
  Week 4: T029-T030, T035-T038 (mobile optimization, documentation)
```

After Week 2: MVP deployed (US1 working, yearly attendance visible with charts)
After Week 3: All user stories 1-4 working, mobile tested
After Week 4: Automation + documentation complete

---

## MVP Checkpoint

**After Tasks T001-T008, T009-T019 (Phase 1 + 2a + 3 complete)**:

✅ **Minimum Viable Product Ready**

What works:
- ✅ Citizens can load home page
- ✅ See all politicians with yearly attendance percentages
- ✅ View attendance breakdown in stacked charts
- ✅ Mobile responsive design working
- ✅ Data last-updated timestamp visible

What's deployable:
- Full database schema with test data
- All APIs for yearly view working
- Home page with politicians + charts
- Mobile responsive
- WCAG 2.1 AA accessible

**Can demonstrate to stakeholders** and gather feedback on core value (attendance transparency).

Remaining features (monthly detail, party filter, search) can be developed in parallel or on iterations 2+.

---

## Implementation Notes

### Code Quality (Constitution-Enforced)

Every task must verify:
- ✅ TypeScript strict mode passes (`noImplicitAny`, `strictNullChecks`)
- ✅ ESLint + Prettier pass (code formatting checked in PR)
- ✅ >80% test coverage for new code (unit + integration)
- ✅ No dead code, unused imports, console.logs
- ✅ Accessibility: WCAG 2.1 AA for UI components
- ✅ Performance: Meets constitutional goals (<500ms API, <2s frontend load)

### Testing Strategy

- **Unit tests**: Functions, services, components tested in isolation
- **Integration tests**: API endpoints tested with real database
- **Contract tests**: API responses validated against openapi.yaml
- **E2E tests**: User workflows tested end-to-end (Playwright)
- **Accessibility tests**: Manual screen reader testing + axe-core checks
- **Performance tests**: Load time, bundle size, p95 response times

### Test-First Approach (TDD)

Per constitution.md "Testing Standards":
1. Write test first (RED - fails)
2. Get user approval on test structure
3. Implement code (GREEN - passes)
4. Refactor if needed (REFACTOR)
5. Commit with test coverage proof

### Deployment Strategy

1. **Setup environment**: `.env`, database path, API configuration
2. **Run migrations**: `pnpm -F api run migrate`
3. **Seed data**: `pnpm -F api run seed` (development only)
4. **Run tests**: `pnpm -r test` (verify nothing broken)
5. **Build**: `pnpm -r build` (compile TypeScript, bundle frontend)
6. **Start servers**: API on port 3000, frontend on same or separate port
7. **Monitor**: Check logs for errors, verify API health (`GET /api/metadata`)

---

## Files Reference

**Design Documents**:
- `spec.md` - User stories, requirements, success criteria
- `plan.md` - Technical context, Phase 2 task planning
- `data-model.md` - Database schema, entities, validation
- `contracts/openapi.yaml` - API endpoints, request/response schemas
- `research.md` - Technology decisions with rationale
- `quickstart.md` - Developer local setup guide

**Code Organization**:
- `packages/api/` - Hono.js REST API
- `packages/frontend/` - Astro website
- `packages/shared/` - Shared TypeScript types + Zod schemas
- `packages/automation/` - GitHub Actions + Playwright scripts

**Quality Checklist Per Task**:
- [ ] Code follows style (TypeScript strict, ESLint pass)
- [ ] Tests written first (TDD)
- [ ] Coverage >80% (core logic)
- [ ] Referenced design docs in code/comments
- [ ] Accessibility verified (WCAG AA where applicable)
- [ ] Performance tested (meets constitution)
- [ ] Documentation updated (comments, README, user guide)

---

## Task Completion Criteria

Task is **DONE** when:
1. ✅ Code written per specification
2. ✅ Tests passing (unit + integration + e2e)
3. ✅ Code review approved (architecture, security, quality)
4. ✅ Accessibility verified (where applicable)
5. ✅ Performance tested (where applicable)
6. ✅ Documentation updated (inline + user-facing)
7. ✅ Committed to branch with clear message
8. ✅ PR merged to main

---

**Ready to begin**: Start with Phase 1 (T001-T005), then Phase 2 (T006-T008). After that, backend and frontend teams can work in parallel on Phases 3-6.

Good luck! 🚀
