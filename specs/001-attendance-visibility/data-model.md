# Data Model: QuienAtiende

**Phase**: Phase 1 Design
**Created**: 2026-01-27
**Purpose**: Define entities, relationships, validation rules, and state transitions

---

## Core Entities

### 1. Politician (Government Official)

**Purpose**: Represents an elected official or government representative.

**Fields**:
- `id` (TEXT, PRIMARY KEY): Unique identifier (e.g., "POL001" or UUID). Immutable.
- `name` (TEXT, NOT NULL): Full name. Indexed for search.
- `party_id` (TEXT, NOT NULL, FK): Reference to Political Party.
- `position` (TEXT, NULLABLE): Official title or role (e.g., "Diputado", "Senador", "Concejal").
- `district` (TEXT, NULLABLE): Geographical area represented (e.g., "San José", "District 5").
- `photo_url` (TEXT, NULLABLE): Profile photo for UI display.
- `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP): Record creation time.
- `updated_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP ON UPDATE): Last modified.
- `is_active` (BOOLEAN, DEFAULT TRUE): Soft delete flag; inactive politicians excluded from current displays.

**Validation**:
- `name`: Required, min 2 chars, max 200 chars.
- `party_id`: Must exist in `parties` table.
- `position`: Optional, max 100 chars.

**Indices**:
- `(name)`: For search autocomplete (partial index: WHERE is_active = TRUE)
- `(party_id)`: For party filtering
- `(created_at)`: For data freshness checks

---

### 2. Political Party

**Purpose**: Represents a political party or coalition.

**Fields**:
- `id` (TEXT, PRIMARY KEY): Unique identifier (e.g., "PARTY_001").
- `name` (TEXT, NOT NULL, UNIQUE): Party name.
- `slug` (TEXT, NOT NULL, UNIQUE): URL-friendly identifier (e.g., "partido-nacional").
- `color` (TEXT, NOT NULL): Hex color code for charts/UI (e.g., "#FF0000").
- `secondary_color` (TEXT, NULLABLE): Optional secondary color for stacked charts.
- `abbreviation` (TEXT, NULLABLE): Short name (e.g., "PN", "PLN").
- `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP).

**Validation**:
- `name`: Required, unique, 2-100 chars.
- `color`: Valid hex color, used for chart consistency.
- `slug`: Unique, lowercase alphanumeric + hyphens.

**Indices**:
- `(slug)`: For routing and filtering

---

### 3. Attendance Record (Event)

**Purpose**: Records a politician's attendance at a specific event/session.

**Fields**:
- `id` (TEXT, PRIMARY KEY): Unique identifier (e.g., UUID or "ATT-POLID-DATE").
- `politician_id` (TEXT, NOT NULL, FK): Reference to Politician.
- `date` (DATE, NOT NULL): Session/event date.
- `session_type` (TEXT, NULLABLE): Type of session (e.g., "Plenary", "Committee", "Special").
- `status` (TEXT, NOT NULL): Attendance status (ENUM: "attended", "unattended", "excused").
  - `attended`: Present at session.
  - `unattended`: Absent (no explanation).
  - `excused`: Absent but with valid reason.
- `reason` (TEXT, NULLABLE): Explanation for absence (if status is "excused" or "unattended"). Max 500 chars.
- `notes` (TEXT, NULLABLE): Additional internal notes (not shown to public).
- `year` (INTEGER, NOT NULL): Year of session (denormalized for easy filtering; redundant with `date` but improves query performance).
- `month` (INTEGER, NULLABLE): Month of session (1-12; denormalized for easy filtering).
- `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP): Record creation time.
- `updated_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP ON UPDATE): Last modified (handles data corrections).

**Validation**:
- `politician_id`: Must exist in `politicians` table.
- `date`: Valid date, not future-dated (except for scheduled sessions).
- `status`: Must be one of the enum values.
- `reason`: Required if status is "excused"; optional for "unattended".
- `year`: Derived from `date` for efficiency (denormalization justified by query patterns).

**Unique Constraint**: `UNIQUE(politician_id, date)` - Only one record per politician per date.

**Indices**:
- `(politician_id, year, month)`: Fast politician-year-month lookups.
- `(politician_id, year)`: For yearly summaries.
- `(date)`: For date-range queries.
- `(year, month)`: For dashboard summaries.
- `(status)`: For filtering by status.

---

### 4. Attendance Summary (Denormalized Aggregate)

**Purpose**: Pre-calculated attendance statistics per politician per year/month to avoid expensive aggregations on every query.

**Fields**:
- `id` (TEXT, PRIMARY KEY): Unique identifier.
- `politician_id` (TEXT, NOT NULL, FK): Reference to Politician.
- `year` (INTEGER, NOT NULL): Year of summary.
- `month` (INTEGER, NULLABLE): Month of summary (NULL for yearly). Range: 1-12.
- `total_sessions` (INTEGER, NOT NULL): Total expected sessions (denominator).
- `attended_count` (INTEGER, NOT NULL): Number of "attended" records.
- `unattended_count` (INTEGER, NOT NULL): Number of "unattended" records.
- `excused_count` (INTEGER, NOT NULL): Number of "excused" records.
- `percentage_attended` (REAL, NOT NULL): Calculated % (attended / total * 100). Ranges 0-100.
- `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP).
- `updated_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP ON UPDATE).

**Validation**:
- `attended_count + unattended_count + excused_count <= total_sessions` (some sessions may not have data yet).
- `percentage_attended`: Calculated as `(attended_count / total_sessions * 100)` if `total_sessions > 0`, else 0.
- `month`: NULL for yearly summaries, 1-12 for monthly.

**Unique Constraint**: `UNIQUE(politician_id, year, month)` - One summary per politician per time period.

**Indices**:
- `(year, month, percentage_attended)`: For sorting by attendance % (dashboards, leaderboards).
- `(politician_id, year)`: For politician profiles.

**Refresh Strategy**: Updated after each `attendance_records` change via:
- API service layer: recalculates affected summary rows on upsert
- Batch job (optional): nightly recalculation for data consistency (idempotent)

---

### 5. Metadata

**Purpose**: Store system-level metadata (data source, last update time, schema version).

**Fields**:
- `key` (TEXT, PRIMARY KEY): Metadata key (e.g., "last_update", "data_source", "schema_version").
- `value` (TEXT, NOT NULL): Metadata value.
- `updated_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP ON UPDATE): When metadata was last updated.

**Key Examples**:
- `last_update`: ISO 8601 timestamp of last data fetch (e.g., "2026-01-27T10:00:00Z").
- `data_source`: Source URL or system (e.g., "https://parliament.example.com/attendance").
- `schema_version`: Current database schema version (e.g., "1.0.0") for migrations.
- `data_version`: Version of data payload (e.g., "2026-01" if data per month).

**Usage**:
- UI displays last_update timestamp to users (transparency).
- API includes in metadata endpoint response.

---

## Entity Relationships (ER Diagram)

```
Politician (1) ──── (M) AttendanceRecord
    ↓ (M)
    ↓
PartyId
    ↓
Party (1) ──── (M) Politician

Politician (1) ──── (M) AttendanceSummary
                         (year/month aggregates)

AttendanceRecord (1) ──── (M) [implied by politician_id + date]

Metadata [system-level, no FK]
```

---

## Data Validation & Constraints

### Business Rules

1. **Attendance Status Values**: Only "attended", "unattended", "excused" allowed.
2. **Future Dates**: Attendance records should not be created for future dates (except planned sessions if applicable).
3. **Percentage Calculation**: Always `(attended_count / total_sessions * 100)`. Handles division-by-zero gracefully (return 0).
4. **Soft Deletes**: Politicians marked `is_active = FALSE` are excluded from public displays but retained for historical data.
5. **Data Immutability**: Once entered, attendance records should not be deleted. Corrections via `updated_at` and optional reason updates only.
6. **Party Consistency**: All politicians must be assigned to exactly one party (immutable).

### Validation Rules (API/Service Layer)

```typescript
// Example validation schemas (Zod)

const AttendanceRecordSchema = z.object({
  politician_id: z.string().min(1),
  date: z.coerce.date().max(new Date()), // No future dates
  session_type: z.string().optional(),
  status: z.enum(["attended", "unattended", "excused"]),
  reason: z.string().max(500).optional(),
  notes: z.string().optional(),
});

const PoliticianSchema = z.object({
  name: z.string().min(2).max(200),
  party_id: z.string().min(1),
  position: z.string().max(100).optional(),
  district: z.string().optional(),
  photo_url: z.string().url().optional(),
});

const AttendanceSummarySchema = z.object({
  politician_id: z.string(),
  year: z.number().int().min(2000).max(9999),
  month: z.number().int().min(1).max(12).optional(),
  total_sessions: z.number().int().nonnegative(),
  attended_count: z.number().int().nonnegative(),
  // ... other fields
});
```

---

## Data Freshness & Consistency

### Update Patterns

**Attendance Record Insert/Upsert**:
```sql
INSERT INTO attendance_records (id, politician_id, date, status, reason, year, month)
VALUES (?, ?, ?, ?, ?, YEAR(date), MONTH(date))
ON CONFLICT(politician_id, date) DO UPDATE SET
  status = excluded.status,
  reason = excluded.reason,
  updated_at = CURRENT_TIMESTAMP;
```

After each insert/update, recalculate affected `attendance_summaries`:

```sql
WITH summary_data AS (
  SELECT
    politician_id,
    YEAR(date) as year,
    MONTH(date) as month,
    COUNT(*) as total_sessions,
    SUM(CASE WHEN status = 'attended' THEN 1 ELSE 0 END) as attended_count,
    SUM(CASE WHEN status = 'unattended' THEN 1 ELSE 0 END) as unattended_count,
    SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused_count
  FROM attendance_records
  WHERE politician_id = ? AND YEAR(date) = ? AND MONTH(date) = ?
  GROUP BY politician_id, year, month
)
INSERT INTO attendance_summaries (politician_id, year, month, total_sessions, attended_count, ...)
SELECT * FROM summary_data
ON CONFLICT(politician_id, year, month) DO UPDATE SET
  total_sessions = excluded.total_sessions,
  attended_count = excluded.attended_count,
  unattended_count = excluded.unattended_count,
  excused_count = excluded.excused_count,
  percentage_attended = (excluded.attended_count * 100.0 / NULLIF(excluded.total_sessions, 0)),
  updated_at = CURRENT_TIMESTAMP;
```

**Metadata Update**:
```sql
INSERT INTO metadata (key, value) VALUES ('last_update', ?)
ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP;
```

---

## Query Patterns (Optimized by Index)

### 1. Get Yearly Summary (All Politicians)

```sql
SELECT p.id, p.name, p.party_id, asym.percentage_attended
FROM politicians p
LEFT JOIN attendance_summaries asym ON p.id = asym.politician_id AND asym.year = 2025 AND asym.month IS NULL
WHERE p.is_active = TRUE
ORDER BY asym.percentage_attended DESC;
-- Uses index: attendance_summaries(year, month, percentage_attended)
```

### 2. Get Monthly Detail (Single Year)

```sql
SELECT p.id, p.name, ar.date, ar.status, ar.reason, asym.percentage_attended
FROM politicians p
LEFT JOIN attendance_records ar ON p.id = ar.politician_id AND ar.year = 2026 AND ar.month = 1
LEFT JOIN attendance_summaries asym ON p.id = asym.politician_id AND asym.year = 2026 AND asym.month = 1
WHERE p.is_active = TRUE AND p.party_id = ?
ORDER BY p.name;
-- Uses indices: attendance_records(politician_id, year, month), politicians(party_id)
```

### 3. Search Politicians by Name

```sql
SELECT id, name, party_id FROM politicians
WHERE is_active = TRUE AND name LIKE ?
LIMIT 10;
-- Uses index: politicians(name, is_active)
```

### 4. Get Politician Profile (Yearly + Monthly Trend)

```sql
SELECT ar.date, ar.status, ar.reason
FROM attendance_records ar
WHERE ar.politician_id = ? AND ar.year >= 2024
ORDER BY ar.date DESC;
-- Uses index: attendance_records(politician_id, year)
```

### 5. Party Summary (Aggregate Attendance %)

```sql
SELECT p.id, p.name, COUNT(ar.id) as total,
       SUM(CASE WHEN ar.status = 'attended' THEN 1 ELSE 0 END) as attended,
       (SUM(CASE WHEN ar.status = 'attended' THEN 1 ELSE 0 END) * 100.0 / COUNT(ar.id)) as percentage
FROM politicians p
JOIN attendance_records ar ON p.id = ar.politician_id
WHERE p.party_id = ? AND ar.year = 2025
GROUP BY p.id;
-- Uses indices: politicians(party_id), attendance_records(politician_id, year)
```

---

## Future Extensions (Out of Scope for MVP)

- **Voting Records**: Separate entity for legislative votes.
- **Committee Assignments**: Track committee memberships over time.
- **Historical Positions**: Track when politicians changed roles/districts.
- **Audit Trail**: Full history of data corrections (instead of just `updated_at`).
- **Public Annotations**: Allow citizens to comment on attendance (requires moderation).

---

## Migration & Seeding

### Initial Schema Creation

File: `packages/api/db/migrations/001_init.sql`

Contains all CREATE TABLE statements, indices, and constraints (see schema above).

### Data Seeding (Development)

File: `packages/api/db/seed.sql`

Insert sample data:
- 3-5 test politicians across 2-3 parties
- 30 days of attendance records for 2025-2026
- Realistic mix of "attended", "unattended", "excused" statuses

### Migration Runner

File: `packages/api/src/db/migrate.ts`

```typescript
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export function runMigrations(dbPath: string) {
  const db = new Database(dbPath);

  // Create migrations table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      name TEXT PRIMARY KEY,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Find and run pending migrations
  const migrationsDir = path.join(__dirname, '../migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    const name = file.replace('.sql', '');
    const applied = db.prepare('SELECT 1 FROM migrations WHERE name = ?').get(name);

    if (!applied) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      db.exec(sql);
      db.prepare('INSERT INTO migrations (name) VALUES (?)').run(name);
      console.log(`✓ Applied migration: ${name}`);
    }
  }

  db.close();
}
```

---

## Summary

**Entities**: 5 core tables (Politicians, Parties, AttendanceRecords, AttendanceSummaries, Metadata)
**Relationships**: Politician ← → AttendanceRecord, Politician ← → Party
**Performance**: Denormalized summaries, strategic indices, optimized queries for common access patterns
**Consistency**: Unique constraints, foreign keys, transactional updates
**Extensibility**: Schema supports future features (committees, votes, audit trails) without breaking current queries
