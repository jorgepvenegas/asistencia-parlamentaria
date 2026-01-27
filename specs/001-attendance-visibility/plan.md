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
