# Quickstart Guide: QuienAtiende Development

**Phase**: Phase 1 Design
**Purpose**: Get developers up and running with the full stack locally

---

## Prerequisites

- **Node.js**: 18+ (check with `node --version`)
- **pnpm**: 8+ (install with `npm install -g pnpm` if needed)
- **Git**: Clone the repository
- **SQLite3**: Optional, but helpful for manual DB inspection (`sqlite3 attendance.db`)

---

## 1. Setup Monorepo

### Clone and Install

```bash
# Clone repository
git clone https://github.com/example/quienatiende.git
cd quienatiende

# Install pnpm (if not already installed)
npm install -g pnpm@8

# Install all dependencies
pnpm install --frozen-lockfile
```

### Verify Installation

```bash
pnpm --version
node --version
ls packages/
# Should show: api frontend automation shared
```

---

## 2. Create Astro Frontend

Use pnpm create to bootstrap Astro:

```bash
# Create Astro project in packages/frontend
pnpm create astro -- --template minimal packages/frontend

# When prompted:
# - TypeScript: Yes (Strict)
# - Install dependencies: No (we'll do it via pnpm)
# - Git initialization: No (already in monorepo)
```

### Configure Frontend for Monorepo

Edit `packages/frontend/package.json`:

```json
{
  "name": "@quienatiende/frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "astro": "^4.0.0",
    "@astrojs/tailwind": "^0.4.0",
    "@astrojs/react": "^3.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tailwindcss": "^3.3.0",
    "vitest": "^0.34.0",
    "@playwright/test": "^1.40.0"
  }
}
```

Install Tailwind CSS:

```bash
cd packages/frontend
pnpm install
npx astro add tailwind
```

---

## 3. Create Hono.js API

Use pnpm create to bootstrap Hono:

```bash
# Create Hono project in packages/api
pnpm create hono -- packages/api

# When prompted:
# - Choose: cloudflare-workers (we'll adapt for Node.js)
# - Install dependencies: No (we'll do it via pnpm)
```

### Configure API for Node.js + SQLite

Edit `packages/api/package.json`:

```json
{
  "name": "@quienatiende/api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "test": "vitest",
    "test:contract": "vitest run tests/contract",
    "migrate": "tsx src/db/migrate.ts"
  },
  "dependencies": {
    "hono": "^3.10.0",
    "better-sqlite3": "^9.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsx": "^4.0.0",
    "vitest": "^0.34.0",
    "@types/better-sqlite3": "^7.6.5"
  }
}
```

Install dependencies:

```bash
cd packages/api
pnpm install
```

Create TypeScript config:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "bundler",
    "lib": ["ES2020"],
    "declaration": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "tests"]
}
```

---

## 4. Setup SQLite Database

### Initialize Database Structure

Create `packages/api/src/db/init.ts`:

```typescript
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../attendance.db');

export function initializeDatabase() {
  const db = new Database(dbPath);

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS parties (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL,
      abbreviation TEXT
    );

    CREATE TABLE IF NOT EXISTS politicians (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      party_id TEXT NOT NULL,
      position TEXT,
      district TEXT,
      photo_url TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (party_id) REFERENCES parties(id)
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
      id TEXT PRIMARY KEY,
      politician_id TEXT NOT NULL,
      date DATE NOT NULL,
      session_type TEXT,
      status TEXT NOT NULL,
      reason TEXT,
      year INTEGER NOT NULL,
      month INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (politician_id) REFERENCES politicians(id),
      UNIQUE(politician_id, date)
    );

    CREATE TABLE IF NOT EXISTS attendance_summaries (
      id TEXT PRIMARY KEY,
      politician_id TEXT NOT NULL,
      year INTEGER NOT NULL,
      month INTEGER,
      total_sessions INTEGER,
      attended_count INTEGER,
      unattended_count INTEGER,
      excused_count INTEGER,
      percentage_attended REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (politician_id) REFERENCES politicians(id),
      UNIQUE(politician_id, year, month)
    );

    CREATE TABLE IF NOT EXISTS metadata (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_politicians_name ON politicians(name);
    CREATE INDEX IF NOT EXISTS idx_politicians_party ON politicians(party_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_politician_year_month
      ON attendance_records(politician_id, year, month);
    CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
    CREATE INDEX IF NOT EXISTS idx_summaries_year_month_percent
      ON attendance_summaries(year, month, percentage_attended);
  `);

  console.log('✓ Database initialized:', dbPath);
  return db;
}

export function seedSampleData() {
  const db = new Database(dbPath);

  // Seed parties
  const parties = [
    { id: 'PARTY_001', name: 'Partido Nacional', slug: 'partido-nacional', color: '#0066CC', abbreviation: 'PN' },
    { id: 'PARTY_002', name: 'Liberación Nacional', slug: 'liberacion-nacional', color: '#FF6600', abbreviation: 'PLN' },
    { id: 'PARTY_003', name: 'Frente Amplio', slug: 'frente-amplio', color: '#FF0000', abbreviation: 'FA' },
  ];

  for (const party of parties) {
    db.prepare(`
      INSERT OR IGNORE INTO parties (id, name, slug, color, abbreviation)
      VALUES (?, ?, ?, ?, ?)
    `).run(party.id, party.name, party.slug, party.color, party.abbreviation);
  }

  // Seed politicians
  const politicians = [
    { id: 'POL001', name: 'Carlos Méndez', party_id: 'PARTY_001', position: 'Diputado' },
    { id: 'POL002', name: 'María García', party_id: 'PARTY_002', position: 'Diputada' },
    { id: 'POL003', name: 'Luis Rodríguez', party_id: 'PARTY_003', position: 'Diputado' },
  ];

  for (const politician of politicians) {
    db.prepare(`
      INSERT OR IGNORE INTO politicians (id, name, party_id, position)
      VALUES (?, ?, ?, ?)
    `).run(politician.id, politician.name, politician.party_id, politician.position);
  }

  // Seed sample attendance records
  const today = new Date();
  const records = [];
  const statuses = ['attended', 'unattended', 'excused'];

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    for (const politician of politicians) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      records.push({
        id: `ATT-${politician.id}-${dateStr}`,
        politician_id: politician.id,
        date: dateStr,
        session_type: 'Plenary',
        status,
        reason: status === 'excused' ? 'Medical appointment' : null,
        year: date.getFullYear(),
        month: date.getMonth() + 1,
      });
    }
  }

  for (const record of records) {
    db.prepare(`
      INSERT OR IGNORE INTO attendance_records
      (id, politician_id, date, session_type, status, reason, year, month)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      record.id, record.politician_id, record.date, record.session_type,
      record.status, record.reason, record.year, record.month
    );
  }

  // Update metadata
  db.prepare(`
    INSERT OR REPLACE INTO metadata (key, value)
    VALUES ('last_update', ?)
  `).run(new Date().toISOString());

  console.log('✓ Sample data seeded');
}
```

### Run Initialization

```bash
cd packages/api
node -e "import('./src/db/init.js').then(m => { m.initializeDatabase(); m.seedSampleData(); })"
```

---

## 5. Create API Server

Create `packages/api/src/index.ts`:

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import Database from 'better-sqlite3';
import { initializeDatabase } from './db/init';

const app = new Hono();
const db = initializeDatabase();

// Middleware
app.use('*', cors());

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET /api/politicians - List all
app.get('/politicians', (c) => {
  const year = c.req.query('year') || '2025';
  const party_id = c.req.query('party_id');

  let query = `
    SELECT p.id, p.name, p.party_id,
           COALESCE(s.percentage_attended, 0) as attendance_percent
    FROM politicians p
    LEFT JOIN attendance_summaries s ON p.id = s.politician_id
      AND s.year = ? AND s.month IS NULL
    WHERE p.is_active = 1
  `;
  const params: any[] = [parseInt(year)];

  if (party_id) {
    query += ` AND p.party_id = ?`;
    params.push(party_id);
  }

  query += ` ORDER BY attendance_percent DESC LIMIT 100`;

  const politicians = db.prepare(query).all(...params);
  return c.json({ data: politicians });
});

// GET /api/politicians/:id - Detail
app.get('/politicians/:id', (c) => {
  const id = c.req.param('id');
  const politician = db.prepare(`
    SELECT * FROM politicians WHERE id = ?
  `).get(id);

  if (!politician) {
    return c.json({ error: 'Not found' }, 404);
  }

  return c.json({ data: politician });
});

// GET /api/metadata - System info
app.get('/metadata', (c) => {
  const lastUpdate = db.prepare(`
    SELECT value FROM metadata WHERE key = 'last_update'
  `).get() as any;

  return c.json({
    data: {
      last_update: lastUpdate?.value || new Date().toISOString(),
      data_source: 'Sample data',
      schema_version: '1.0.0',
      available_years: [2024, 2025, 2026],
    },
  });
});

// Start server
const PORT = process.env.PORT || 3000;
console.log(`🚀 Server running on http://localhost:${PORT}`);
export default app;
```

---

## 6. Run Development Servers

### In Separate Terminals

**Terminal 1: Start API**

```bash
cd packages/api
pnpm dev
# Output: 🚀 Server running on http://localhost:3000
```

**Terminal 2: Start Frontend**

```bash
cd packages/frontend
pnpm dev
# Output: 🚀 Server running on http://localhost:3000/
```

Or use pnpm workspace commands:

```bash
# From root, run all dev servers in parallel
pnpm -r run dev
```

---

## 7. Verify Setup

### API Endpoints

```bash
# Health check
curl http://localhost:3000/health

# List politicians (2025)
curl "http://localhost:3000/api/politicians?year=2025"

# Get politician detail
curl http://localhost:3000/api/politicians/POL001

# System metadata
curl http://localhost:3000/api/metadata
```

### Frontend

Open browser: http://localhost:3000

Should see Astro welcome page with navigation.

---

## 8. Run Tests

### API Tests

```bash
cd packages/api
pnpm test              # Run all tests
pnpm test:contract    # Contract tests only
```

### Frontend Tests

```bash
cd packages/frontend
pnpm test              # Unit tests
pnpm test:e2e          # E2E tests (Playwright)
```

### All Packages

```bash
pnpm -r test
```

---

## 9. Build for Production

### Frontend

```bash
cd packages/frontend
pnpm build
# Output: dist/ folder ready for deployment
```

### API

```bash
cd packages/api
pnpm build
# Output: dist/ folder with compiled JS
```

---

## 10. Troubleshooting

**Issue**: `pnpm install` fails
**Solution**: Clear cache: `pnpm store prune && pnpm install`

**Issue**: Port 3000 already in use
**Solution**: Change port: `PORT=3001 pnpm dev` (API) or `npm run dev -- --port 3001` (Astro)

**Issue**: Database is locked
**Solution**: Delete `attendance.db` and rerun init: `rm packages/api/attendance.db && node ...`

**Issue**: TypeScript errors
**Solution**: Check strict mode: `pnpm -r check` and fix type errors before running

---

## Next Steps

1. **Create feature branches**: `git checkout -b feature/attendance-charts`
2. **Add components**: Build Astro components in `packages/frontend/src/components/`
3. **Add API routes**: Add endpoints in `packages/api/src/routes/`
4. **Write tests**: Create tests alongside features
5. **Check constitution**: Ensure code quality, modularity, accessibility per constitution principles

---

## Development Workflow

```bash
# 1. Create feature branch
git checkout -b 001-attendance-visibility-frontend

# 2. Make changes
# - Edit files in packages/frontend/ or packages/api/
# - Tests run automatically in watch mode

# 3. Run linting/formatting
pnpm -r lint
pnpm -r format

# 4. Commit
git add .
git commit -m "feat: Add attendance chart component"

# 5. Push and create PR
git push origin 001-attendance-visibility-frontend
```

---

## Useful pnpm Commands

```bash
# List all workspaces
pnpm list --depth 0

# Run script in specific workspace
pnpm -F @quienatiende/frontend run build

# Install dependency across workspaces
pnpm add -D typescript --save-peer

# Add dependency to specific workspace
pnpm -F @quienatiende/api add better-sqlite3

# Remove dependency
pnpm remove package-name
```

---

## Files to Check

- **Spec**: `specs/001-attendance-visibility/spec.md` (feature requirements)
- **Data Model**: `specs/001-attendance-visibility/data-model.md` (database schema)
- **API Contracts**: `specs/001-attendance-visibility/contracts/openapi.yaml` (API endpoints)
- **Constitution**: `.specify/memory/constitution.md` (development principles)

Good luck! 🚀
