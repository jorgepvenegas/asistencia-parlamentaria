import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface MigrationTracker {
  name: string;
  applied_at: string;
}

/**
 * Runs pending migrations against the SQLite database
 * Tracks applied migrations to ensure idempotence
 */
export function runMigrations(dbPath: string): void {
  const db = new Database(dbPath);

  try {
    // Create migrations table if not exists
    db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        name TEXT PRIMARY KEY,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Find and run pending migrations
    const migrationsDir = path.join(__dirname, '../../db/migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.warn(`Migrations directory not found: ${migrationsDir}`);
      return;
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.warn('No migration files found');
      return;
    }

    const getApplied = db.prepare('SELECT 1 FROM migrations WHERE name = ?');
    const insertApplied = db.prepare('INSERT INTO migrations (name) VALUES (?)');

    for (const file of files) {
      const name = file.replace('.sql', '');
      const applied = getApplied.get(name);

      if (!applied) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
        db.exec(sql);
        insertApplied.run(name);
        console.log(`✓ Applied migration: ${name}`);
      } else {
        console.log(`⊘ Skipped migration (already applied): ${name}`);
      }
    }

    console.log('✓ All migrations applied successfully');
  } catch (error) {
    console.error('✗ Migration failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

/**
 * Initialize database with migrations (useful for testing/setup)
 */
export function initializeDatabase(dbPath: string): Database.Database {
  runMigrations(dbPath);
  return new Database(dbPath);
}

/**
 * CLI entry point
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const dbPath = process.env.DATABASE_URL || 'data/attendance.db';
  runMigrations(dbPath);
}
