import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { runMigrations } from './migrate';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Initialize database connection with migrations
 */
export function initDatabase(): Database.Database {
  const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../../data/attendance.db');

  // Ensure data directory exists
  const dataDir = path.dirname(dbPath);
  if (!dataDir.includes(':') && dataDir !== '.' && dataDir !== '..') {
    // Simple directory creation (not a path variable)
    const fs = await import('fs');
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Run migrations
  runMigrations(dbPath);

  // Open database connection
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  return db;
}

export default initDatabase;
