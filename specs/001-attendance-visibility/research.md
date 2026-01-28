# Research & Investigation: QuienAtiende

**Phase**: Phase 0
**Created**: 2026-01-27
**Purpose**: Document technology decisions, best practices, and alternatives evaluated

---

## 1. pnpm Workspaces Best Practices

**Decision**: Use pnpm monorepo with strict package isolation via workspaces.

**Rationale**:
- pnpm creates symlinked node_modules, reducing disk space and install time
- Workspaces enforce package boundaries (no implicit dependencies)
- Aligns with modularity principle: each package (frontend, API, automation) is independently testable
- Fast, performant CI/CD with shared dependency cache

**Implementation**:
- Root `pnpm-workspace.yaml` defines workspace globs: `packages/**`
- Each package has independent `package.json` with explicit dependencies
- Shared `tsconfig.json` at root; packages extend or override
- pnpm scripts at root: `pnpm -r run build` to build all packages
- CI/CD uses `pnpm install --frozen-lockfile` for reproducibility

**Alternatives Considered**:
- **Yarn workspaces**: Similar; less performant, larger node_modules footprint
- **npm workspaces**: Limited feature set; slower
- **Monorepo tools (Nx, Turborepo)**: Over-engineered for 3-4 packages; adds complexity

---

## 2. Astro Mobile-First Optimization

**Decision**: Astro 5+ with responsive design framework (Tailwind CSS), client hydration only where needed.

**Rationale**:
- Astro renders to static HTML by default (fast) + islands of interactivity
- Excellent mobile performance: minimal JS shipped to browser
- Built-in image optimization for mobile networks
- CSS-in-JS not needed (reduces JS bundle)
- Easy to integrate chart libraries (Recharts/Chart.js)

**Implementation**:
- Astro layout system for consistent mobile/desktop structure
- Tailwind CSS for responsive design (mobile-first utility classes)
- `astro:visible` hydration directive: only load interactive components when visible (lazy hydration)
- Responsive images with `<Image>` component (automatic WebP, srcset)
- CSS containment for performance (prevent full-page reflows)

**Performance Targets**:
- <100KB Astro runtime (JS)
- <400KB total initial JS including chart library
- Images optimized: WebP with JPEG fallback, lazy-loaded

**Alternatives Considered**:
- **Next.js**: More opinionated, larger default bundle
- **Svelte/SvelteKit**: Good but less stable ecosystem for large teams
- **Vue + Nuxt**: More boilerplate for this simple transparency use case
- **Remix**: Excellent but overkill for read-only data site

---

## 3. Hono.js API Framework

**Decision**: Hono.js for REST API, TypeScript strict mode, Zod for request/response validation.

**Rationale**:
- Hono is ultralight (<20KB), extremely fast, Cloudflare Workers compatible
- Excellent type safety with TypeScript-first design
- Built-in middleware ecosystem (CORS, error handling, logging)
- Works anywhere: Node.js, Workers, Deno, Bun
- Easy to deploy: Node.js server or serverless (AWS Lambda, Vercel Functions, Cloudflare Workers)

**Implementation**:
- Modular route handlers in `src/routes/`
- Zod schemas for validation: request body, query params, response contracts
- Middleware stack: error handling → logging → CORS → rate limiting (optional)
- Separate service layer: business logic isolated from HTTP concerns
- TypeScript strict mode: `noImplicitAny`, `strictNullChecks`

**Error Handling**:
- 404 for unknown endpoints
- 400 for validation errors (Zod messages)
- 500 with generic message (details in logs, never exposed)
- Consistent JSON error shape: `{ error: string, statusCode: number }`

**Alternatives Considered**:
- **Express**: More popular but verbose, less type-safe by default
- **Fastify**: Good but larger surface area; Hono sufficient for our needs
- **Deno Fresh**: Overkill; we need API-only, not full framework

---

## 4. SQLite for Web Data Storage

**Decision**: SQLite3 (sql.js variant for browser, native for Node.js API), simple schema, migrations via manual scripts.

**Rationale**:
- SQLite perfect for single-server, moderate concurrency (10k users easily)
- Zero external dependencies; file-based, portable
- ACID transactions; reliable data integrity
- Query performance excellent for our scale (~400 politicians, millions of attendance records)
- No DevOps overhead; backup is file copy

**Schema Design**:
```sql
CREATE TABLE politicians (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  party_id TEXT NOT NULL,
  position TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (party_id) REFERENCES parties(id)
);

CREATE TABLE parties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT,
  slug TEXT UNIQUE
);

CREATE TABLE attendance_records (
  id TEXT PRIMARY KEY,
  politician_id TEXT NOT NULL,
  date DATE NOT NULL,
  session_type TEXT,
  status TEXT NOT NULL, -- 'attended', 'unattended', 'excused'
  reason TEXT,
  year INTEGER NOT NULL,
  month INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (politician_id) REFERENCES politicians(id),
  UNIQUE(politician_id, date)
);

CREATE TABLE attendance_summaries (
  id TEXT PRIMARY KEY,
  politician_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER,
  total_sessions INTEGER,
  attended_count INTEGER,
  unattended_count INTEGER,
  excused_count INTEGER,
  percentage_attended REAL,
  FOREIGN KEY (politician_id) REFERENCES politicians(id),
  UNIQUE(politician_id, year, month)
);

CREATE TABLE metadata (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Indices** (performance):
- `attendance_records(politician_id, year, month)`
- `attendance_records(date)`
- `politicians(party_id)`
- `attendance_summaries(year, month, percentage_attended)`

**Migrations**:
- Manual SQL migration files in `packages/api/db/migrations/001_init.sql`, etc.
- Migration runner: simple Node.js script checking applied migrations table
- No ORM; direct SQL + parameterized queries (security + simplicity)

**Alternatives Considered**:
- **PostgreSQL**: Over-engineered; DevOps overhead
- **MongoDB**: No schema enforcement; less suitable for relational data
- **Firebase/Supabase**: Vendor lock-in; this data is public anyway
- **Prisma ORM**: Adds abstraction layer; direct SQL faster + clearer

---

## 5. Playwright for Data Fetching Automation

**Decision**: Playwright script running in GitHub Actions, scheduled daily 3 am PT, fetches from external source and upserts to SQLite.

**Rationale**:
- Playwright handles complex, JavaScript-heavy government websites
- Can wait for elements, handle dynamic content, screenshots for debugging
- TypeScript support for type-safe scripts
- Error recovery: retry logic, graceful degradation if source unavailable

**Implementation**:
```typescript
// packages/automation/scripts/fetch-attendance.ts
import { chromium } from 'playwright';
import Database from 'better-sqlite3';

async function fetchAttendanceData() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to source, extract data
    await page.goto(SOURCE_URL);
    const data = await page.evaluate(() => {
      // Custom extraction logic based on page structure
      return extractAttendanceFromDOM();
    });

    // Validate, transform, upsert to SQLite
    const db = new Database('attendance.db');
    db.exec('BEGIN TRANSACTION');

    for (const record of data) {
      db.prepare(`
        INSERT INTO attendance_records (id, politician_id, date, status, reason, year, month)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(politician_id, date) DO UPDATE SET
          status = excluded.status, reason = excluded.reason
      `).run(...record);
    }

    // Update metadata
    db.prepare(`
      INSERT INTO metadata (key, value) VALUES ('last_update', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(new Date().toISOString());

    db.exec('COMMIT');
  } catch (error) {
    console.error('Fetch failed:', error);
    // Retry logic: exponential backoff up to 3x
  } finally {
    await browser.close();
  }
}
```

**Error Handling**:
- Retry on network failure: 3 attempts with exponential backoff
- If source unavailable: log warning, keep existing data, skip update
- Successful fetch: update metadata timestamp
- GitHub Actions logs: visible for debugging

**Alternatives Considered**:
- **Puppeteer**: Heavier, more memory; Playwright faster
- **Cheerio**: Can't handle JavaScript-heavy sites
- **GitHub Actions REST API**: Source likely not REST-compatible
- **External scraping service**: Cost, latency, privacy concerns

---

## 6. GitHub Actions Scheduling (3 am PT daily)

**Decision**: GitHub Actions cron workflow, scheduled daily 3 am PT.

**Rationale**:
- Free, built into GitHub
- Reliable trigger for daily tasks
- Secrets management built-in (if API keys needed)
- Workflow logs visible for debugging

**Implementation**:
```yaml
# .github/workflows/fetch-daily.yml
name: Fetch Attendance Data

on:
  schedule:
    - cron: '0 10 * * *'  # 10 am UTC = 3 am PT (accounting for DST)

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Fetch attendance data
        run: pnpm -F automation run fetch
        env:
          SOURCE_URL: ${{ secrets.SOURCE_URL }}

      - name: Commit and push
        run: |
          git config user.email "bot@example.com"
          git config user.name "Attendance Bot"
          git add attendance.db
          git commit -m "chore: update attendance data" || true
          git push
```

**Timezone Handling**:
- GitHub Actions runs in UTC
- 3 am PT = 10 am UTC (standard time) or 11 am UTC (daylight time)
- Use single cron: `0 10 * * *` with note that this shifts +1h during daylight saving
- Alternative: use Actions `jobs.schedule` with explicit offset calculation (over-engineered)

**Alternatives Considered**:
- **GitHub Pages with Actions**: Good but no database persistence
- **External scheduler (EasyCron, AWS EventBridge)**: Cost, complexity
- **Manual trigger**: Unacceptable; needs automation
- **Polling API**: If source supports webhook, but likely doesn't

---

## 7. Accessibility: Astro + Chart Libraries

**Decision**: Semantic HTML from Astro + Recharts (strong a11y support) or Chart.js with aria-labels. WCAG 2.1 AA compliance mandatory.

**Rationale**:
- Recharts: Built-in accessibility patterns, SVG-based, responsive
- Chart.js: Lightweight, good a11y with `canvas-based` + `aria-label` + `aria-describedby`
- Both support: alt text, keyboard navigation, screen reader descriptions

**Implementation**:
- Every chart: `aria-label` describing what it shows + `aria-describedby` to detailed description
- Color: never sole means of information; always include labels + patterns/hatch
- Keyboard nav: tab through interactive elements, Enter to select filters
- Screen reader testing: NVDA (Windows) + JAWS (if available) + VoiceOver (macOS)
- Semantic HTML: use `<button>`, `<nav>`, `<main>`, proper heading hierarchy

**Chart Example (Recharts)**:
```tsx
<ResponsiveContainer>
  <BarChart
    data={data}
    aria-label="Attendance breakdown: attended vs unattended by politician"
  >
    <Bar dataKey="attended" fill="#4CAF50" name="Attended" />
    <Bar dataKey="unattended" fill="#FF5252" name="Unattended" />
    <Bar dataKey="excused" fill="#FFC107" name="Excused" />
  </BarChart>
</ResponsiveContainer>
```

**Alternatives Considered**:
- **D3.js**: Powerful but requires manual a11y (lots of work)
- **Observable Plot**: Good but newer, smaller ecosystem
- **Nivo**: Full-featured; heavier bundle
- **Tables instead of charts**: Accessible but poor UX (violates usability principle)

---

## 8. Performance Budgeting & Monitoring

**Decision**: Bundle analysis in CI/CD, automated performance testing (Lighthouse), monitoring in production.

**Rationale**:
- Constitution requires <500KB initial JS, <3s load time
- CI/CD prevents regression
- Production monitoring catches real-world issues

**Implementation**:

**Build-time**:
- `pnpm build` runs Astro build + bundle analyzer
- Fail if JS exceeds 500KB (with warnings at 400KB)
- CSS bundle check: <100KB
- Image sizes checked: no unoptimized images

**Pre-merge**:
- Lighthouse audit in GitHub Actions (mobile + desktop)
- Pass if all core metrics green (LCP <2.5s, FID <100ms, CLS <0.1)
- Performance budget: any regression blocks merge

**Runtime** (optional, Phase 2):
- Web Vitals tracking (if analytics needed)
- Error reporting (Sentry or similar)
- Database query monitoring (slow query log)

**Tools**:
- **Bundle analyzer**: Webpack Bundle Analyzer (Astro compatible)
- **Lighthouse**: `lighthouse-ci` npm package, GitHub Actions integration
- **Performance**: `web-vitals` library (optional, frontend only)

---

## Summary: Technology Decisions Validated

| Component | Technology | Reason | Status |
|-----------|-----------|--------|--------|
| Frontend | Astro 5+ | Static generation + islands of interactivity = fast mobile | ✅ Approved |
| API | Hono.js | Lightweight, TypeScript-first, fast | ✅ Approved |
| Database | SQLite | Perfect for single-server, file-based, ACID | ✅ Approved |
| Data Fetch | Playwright + GitHub Actions | Handles JS-heavy sites, free scheduling | ✅ Approved |
| Package Mgr | pnpm | Fast, dependency enforcement, workspaces | ✅ Approved |
| Charts | Recharts or Chart.js | Both accessible, performant | ⏳ Choose in Phase 1 |
| Testing | Vitest + Playwright | Modern, fast, browser testing | ✅ Approved |
| Styling | Tailwind CSS | Mobile-first utility CSS, zero runtime JS | ✅ Approved |

---

## Next: Phase 1 Design

Ready to proceed with:
1. Data model finalization
2. API contract documentation
3. Astro component architecture
4. Accessibility testing plan
5. Performance budgeting setup
