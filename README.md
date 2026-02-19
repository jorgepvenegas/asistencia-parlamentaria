# QuienAtiende

**Citizen Attendance Tracker for Government Officials**

A transparent platform for tracking Costa Rican parliamentary attendance.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Astro + React + Tailwind CSS |
| API | Hono.js on Cloudflare Workers |
| Database | Cloudflare D1 via Drizzle ORM |
| Automation | Playwright + Cheerio scraper |
| Charts | Recharts |
| Testing | Vitest + Playwright (E2E) |

## Prerequisites

- **Node.js** 20+
- **pnpm** 9+
- **Wrangler** CLI (installed via devDependencies)

## Quick Start

```bash
# Install dependencies
pnpm install

# Start all dev servers (frontend + API worker)
pnpm dev
```

- Frontend: `http://localhost:4321` (Astro default)
- API: `http://localhost:8787` (Wrangler default)

## Project Structure

```
asistencia-camara/
├── packages/
│   ├── api/                  # Hono.js on Cloudflare Workers
│   │   ├── src/
│   │   │   ├── index.ts      # App entry + route registration
│   │   │   ├── db/           # Drizzle schema & client
│   │   │   ├── routes/       # attendance, politicians, parties
│   │   │   ├── schemas/      # Zod input/output schemas
│   │   │   └── lib/          # Business logic
│   │   ├── wrangler.jsonc    # Cloudflare Workers config
│   │   └── drizzle.config.ts
│   │
│   ├── frontend/             # Astro static site
│   │   ├── src/
│   │   │   ├── pages/        # File-based routing
│   │   │   │   ├── index.astro
│   │   │   │   ├── acerca-de.astro
│   │   │   │   ├── diputados/
│   │   │   │   │   ├── index.astro
│   │   │   │   │   └── [year].astro
│   │   │   │   └── partidos/
│   │   │   │       ├── index.astro
│   │   │   │       ├── [year].astro
│   │   │   │       └── [partySlug]/
│   │   │   ├── components/   # React + Astro components
│   │   │   ├── layouts/
│   │   │   ├── styles/
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   └── playwright.config.ts
│   │
│   ├── shared/               # @quienatiende/shared
│   │   └── src/
│   │       ├── index.ts
│   │       └── schemas.ts    # Zod schemas shared across packages
│   │
│   └── automation/           # Data scraping
│       ├── src/
│       │   ├── scrapers/     # attendance.ts
│       │   ├── api-clients/
│       │   ├── orchestration/
│       │   └── utils/
│       └── scripts/          # Runnable scripts
│
├── ops/                      # Session logs & operational data
├── .github/workflows/
│   ├── frontend-build.yaml   # Build & deploy frontend
│   ├── lighthouse.yaml       # Performance audits
│   └── sync-automation.yaml  # Data sync pipeline
└── pnpm-workspace.yaml
```

## Development Commands

### All Packages

```bash
pnpm dev          # Start all dev servers in parallel
pnpm build        # Build frontend + API (excludes automation)
pnpm test         # Run all tests (excludes automation)
pnpm lint         # Lint all packages
pnpm format       # Format all packages
```

### API (Cloudflare Workers)

```bash
pnpm -F @quienatiende/api dev        # Start wrangler dev
pnpm -F @quienatiende/api test       # Vitest
pnpm -F @quienatiende/api db:push    # Push schema to D1
pnpm -F @quienatiende/api db:generate # Generate migrations
pnpm -F @quienatiende/api db:migrate  # Run migrations
pnpm -F @quienatiende/api db:studio  # Drizzle Studio
pnpm -F @quienatiende/api deploy     # Deploy to Cloudflare
```

### Frontend (Astro)

```bash
pnpm -F @quienatiende/frontend dev       # Astro dev server
pnpm -F @quienatiende/frontend build     # Static build
pnpm -F @quienatiende/frontend test      # Vitest
pnpm -F @quienatiende/frontend test:e2e  # Playwright E2E
pnpm -F @quienatiende/frontend deploy    # Deploy to CF Pages
```

### Automation (Scraper)

```bash
pnpm -F @quienatiende/automation scrape-attendance  # Scrape attendance data
pnpm -F @quienatiende/automation create-parties      # Seed parties
pnpm -F @quienatiende/automation create-politicians  # Seed politicians
pnpm -F @quienatiende/automation sync                # Full sync
pnpm -F @quienatiende/automation sync:year           # Sync by year
```

## API Routes

Base URL: `https://api.quienatiende.cr` (or `http://localhost:8787` locally)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/politicians` | List politicians with attendance |
| GET | `/api/politicians/:id` | Politician detail |
| GET | `/api/parties` | List parties |
| GET | `/api/attendance/summary` | Attendance summary |

## GitHub Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `frontend-build.yaml` | Push / PR | Build & deploy frontend to CF Pages |
| `lighthouse.yaml` | Schedule / Manual | Lighthouse performance audits |
| `sync-automation.yaml` | Schedule / Manual | Scrape & sync attendance data |

## Key Conventions (from AGENTS.md)

- Data flow: Astro SSR fetch → pass to React via `client:load`
- Colors: `ATTENDANCE_COLORS` in `constants/colors.ts` is single source of truth
- Types: shared schemas from `@quienatiende/shared`; frontend-specific in `src/types/`
- Validation: Zod schemas for all API responses
- Routing: year-based static paths (2022–2025)

## Deployment

```bash
# Frontend → Cloudflare Pages
pnpm -F @quienatiende/frontend deploy

# API → Cloudflare Workers
pnpm -F @quienatiende/api deploy
```

Configure D1 bindings in `wrangler.jsonc` before deploying.

## Security

- Prepared statements via Drizzle ORM (no SQL injection)
- XSS protection via Astro auto-escaping
- CORS configured in Hono middleware
- No secrets committed — use Wrangler secrets or `.env`

## License

MIT
