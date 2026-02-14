## Purpose

- Keep changes correct, minimal, and verifiable.
- Prefer small, reviewable diffs over broad refactors.
- Preserve existing architecture and conventions unless explicitly asked to change them.

## Project Snapshot

- Monorepo: `pnpm` workspaces
- Frontend: Astro + React (`packages/frontend`)
- API: Hono + Drizzle + Cloudflare tooling (`packages/api`)
- Shared contracts: TypeScript types/schemas (`packages/shared`)

## Repository Layout

- `packages/frontend`: pages, UI components, client-side tests, Playwright E2E
- `packages/api`: API routes, data access, schema/migration tooling
- `packages/shared`: shared types and schemas used across frontend/api
- `packages/automation`: scraping scripts, sync pipeline, data ingestion
- `.github/workflows`: CI pipelines and automation

```
.
├── packages/
│   ├── frontend/
│   │   └── src/
│   │       ├── pages/
│   │       │   └── index.astro          # single-page entry
│   │       ├── components/
│   │       │   ├── Dashboard.tsx        # top-level dashboard
│   │       │   ├── MembersTable.tsx
│   │       │   ├── PartyBreakdownCard.tsx
│   │       │   ├── PartyPills.tsx
│   │       │   └── PartyStackedBars.tsx
│   │       ├── constants/
│   │       │   ├── colors.ts
│   │       │   └── styles.ts
│   │       ├── hooks/
│   │       │   └── useIsMobile.ts
│   │       └── types/
│   │           └── dashboard.ts
│   ├── api/
│   │   └── src/
│   │       ├── index.ts                 # Hono app entry
│   │       ├── routes/
│   │       │   ├── attendance.ts
│   │       │   ├── parties.ts
│   │       │   └── politicians.ts
│   │       ├── schemas/
│   │       │   ├── inputs.ts
│   │       │   ├── queries.ts
│   │       │   ├── responses.ts
│   │       │   └── tables.ts
│   │       ├── db/
│   │       │   ├── index.ts             # Drizzle client
│   │       │   └── schema.ts            # table definitions
│   │       └── lib/
│   │           └── index.ts
│   ├── shared/
│   │   └── src/
│   │       ├── index.ts
│   │       └── schemas.ts               # shared Zod schemas/types
│   └── automation/
│       ├── scripts/                     # runnable entry points
│       │   ├── sync-data.ts
│       │   ├── sync-year.ts
│       │   ├── scrape-attendance.ts
│       │   ├── create-parties.ts
│       │   └── create-politicians.ts
│       └── src/
│           ├── scrapers/
│           │   └── attendance.ts
│           ├── api-clients/
│           │   ├── parties.ts
│           │   ├── politicians.ts
│           │   └── shared.ts
│           ├── orchestration/
│           │   └── sync-pipeline.ts
│           └── utils/
│               ├── dates.ts
│               ├── http.ts
│               ├── parse.ts
│               └── slugs.ts
└── .github/
    └── workflows/
        ├── frontend-build.yaml
        ├── sync-automation.yaml
        └── lighthouse.yaml
```

## Core Commands

Run from repo root unless noted.

- Install deps: `pnpm install`
- Dev (all packages except automation): `pnpm dev`
- Build: `pnpm build`
- Test: `pnpm test`
- Lint: `pnpm lint`
- Format check: `pnpm format:check`
- Format write: `pnpm format`

Package-specific commands:

- Frontend dev: `pnpm -F @quienatiende/frontend dev`
- Frontend tests: `pnpm -F @quienatiende/frontend test`
- Frontend E2E: `pnpm -F @quienatiende/frontend test:e2e`
- API dev: `pnpm -F @quienatiende/api dev`
- Shared tests: `pnpm -F @quienatiende/shared test`

## Agent Workflow

1. Make the smallest change that satisfies the request.
2. Validate with targeted checks first, then broader checks if needed.
3. Report exactly what changed and what was verified.

## Coding Guardrails

- Do not introduce unrelated refactors.
- Do not change public interfaces (API routes, shared schemas/types) without explicit need.
- Keep TypeScript strictness and existing lint/format conventions.
- Reuse existing utilities and patterns before adding new abstractions.
- Avoid new dependencies unless required and justified.

## Validation Policy

Minimum validation before handing off:

- For frontend-only changes: run frontend lint/tests relevant to the scope.
- For API-only changes: run API-related checks relevant to the scope.
- For shared contract changes: run checks for both frontend and API consumers.
- If full test suite is too expensive, run focused checks and clearly state what was not run.

## Safety and Operations

- Never run deploy commands (`deploy.sh`, `wrangler deploy`, Pages deploy) unless explicitly requested.
- Treat database/schema changes as high impact; document migration and rollback considerations.
- Prefer non-destructive git operations; do not discard user changes.

## Definition of Done

A task is done when:

- Requested behavior is implemented.
- Relevant checks pass (or gaps are explicitly called out).
- Diff is scoped to the task.
- Handoff notes include changed files, verification steps, and known risks.
