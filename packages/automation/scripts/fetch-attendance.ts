/**
 * Automated data fetching script for QuienAtiende
 *
 * Fetches attendance data from external sources (if available)
 * and upserts into SQLite database.
 *
 * Intended to run daily via GitHub Actions at 3am PT (10am UTC)
 */

import Database from 'better-sqlite3';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DATABASE_URL || path.join(__dirname, '../../api/data/attendance.db');

// Validation schema
const AttendanceRecordSchema = z.object({
  politician_id: z.string(),
  date: z.string().date(),
  status: z.enum(['attended', 'unattended', 'excused']),
  reason: z.string().optional().nullable(),
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
});

type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>;

interface FetchResult {
  success: boolean;
  recordsProcessed: number;
  recordsInserted: number;
  error?: string;
  timestamp: string;
}

/**
 * Mock data fetcher - in production would connect to real data source
 */
async function fetchDataFromSource(): Promise<AttendanceRecord[]> {
  console.log('Fetching attendance data from source...');

  // NOTE: This is a placeholder implementation
  // In production, this would:
  // 1. Use Playwright to navigate to data source website
  // 2. Extract attendance records from HTML/table
  // 3. Transform to our schema
  // 4. Return array of records

  // Example of what this might look like:
  /*
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto('https://data-source.example.com');
    const records = await page.evaluate(() => {
      // Extract data from page
      const rows = document.querySelectorAll('table tbody tr');
      return Array.from(rows).map(row => ({
        politician_id: row.cells[0].textContent,
        date: row.cells[1].textContent,
        status: row.cells[2].textContent,
        reason: row.cells[3]?.textContent,
      }));
    });
    return records;
  } finally {
    await browser.close();
  }
  */

  // For now, return empty array (no production data source configured)
  console.log('No production data source configured. Returning empty data.');
  return [];
}

/**
 * Validate and transform records
 */
function validateRecords(records: unknown[]): AttendanceRecord[] {
  const validated: AttendanceRecord[] = [];
  const errors: string[] = [];

  for (let i = 0; i < records.length; i++) {
    try {
      const record = AttendanceRecordSchema.parse(records[i]);
      validated.push(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(`Row ${i}: ${error.errors[0]?.message}`);
      }
    }
  }

  if (errors.length > 0) {
    console.warn(`Validation warnings (${errors.length} records skipped):`);
    errors.slice(0, 10).forEach(e => console.warn(`  - ${e}`));
    if (errors.length > 10) {
      console.warn(`  ... and ${errors.length - 10} more`);
    }
  }

  return validated;
}

/**
 * Upsert records into database
 */
function upsertRecords(db: Database.Database, records: AttendanceRecord[]): number {
  const insert = db.prepare(`
    INSERT INTO attendance_records (politician_id, date, status, reason, year, month)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(politician_id, date) DO UPDATE SET
      status = excluded.status,
      reason = excluded.reason
  `);

  const transaction = db.transaction((recs: AttendanceRecord[]) => {
    let count = 0;
    for (const rec of recs) {
      const result = insert.run(
        rec.politician_id,
        rec.date,
        rec.status,
        rec.reason || null,
        rec.year,
        rec.month
      );
      if (result.changes > 0) count += result.changes;
    }
    return count;
  });

  return transaction(records);
}

/**
 * Update metadata with last fetch timestamp
 */
function updateMetadata(db: Database.Database): void {
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO metadata (key, value)
    VALUES ('last_update', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(now);

  console.log(`Updated metadata: last_update = ${now}`);
}

/**
 * Main execution
 */
async function main(): Promise<FetchResult> {
  const startTime = Date.now();

  try {
    console.log('QuienAtiende: Automated attendance data fetch');
    console.log(`Started at: ${new Date().toISOString()}`);
    console.log(`Database: ${DB_PATH}`);
    console.log('');

    // Fetch data from source
    const rawData = await fetchDataFromSource();
    console.log(`Retrieved ${rawData.length} records from source`);

    // Validate data
    const validatedData = validateRecords(rawData);
    console.log(`Validated ${validatedData.length} records`);

    // Connect to database
    const db = new Database(DB_PATH);

    try {
      // Upsert records
      const inserted = upsertRecords(db, validatedData);
      console.log(`Inserted/updated ${inserted} records in database`);

      // Update metadata
      updateMetadata(db);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`\nCompleted successfully in ${duration}s`);

      return {
        success: true,
        recordsProcessed: rawData.length,
        recordsInserted: inserted,
        timestamp: new Date().toISOString(),
      };
    } finally {
      db.close();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ Error: ${message}`);

    return {
      success: false,
      recordsProcessed: 0,
      recordsInserted: 0,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await main();
  process.exit(result.success ? 0 : 1);
}

export { main, validateRecords, upsertRecords };
