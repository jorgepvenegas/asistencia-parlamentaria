import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { runMigrations } from '../src/db/migrate';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../data/attendance.db');

/**
 * Seed database with sample data for testing and development
 */
async function seedDatabase(): Promise<void> {
  // Run migrations first
  runMigrations(dbPath);

  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');

  try {
    // Clear existing data (for clean seed)
    const tables = [
      'attendance_summaries',
      'attendance_records',
      'politicians',
      'parties',
      'metadata',
    ];
    for (const table of tables) {
      db.exec(`DELETE FROM ${table}`);
    }

    console.log('🌱 Seeding database with test data...');

    // Insert parties
    const insertParty = db.prepare(`
      INSERT INTO parties (id, name, slug, color, secondary_color, abbreviation)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const parties = [
      [
        'PARTY_001',
        'Partido Nacional',
        'partido-nacional',
        '#FF0000',
        '#CC0000',
        'PN',
      ],
      [
        'PARTY_002',
        'Partido Liberación Nacional',
        'partido-liberacion-nacional',
        '#0066FF',
        '#0052CC',
        'PLN',
      ],
      [
        'PARTY_003',
        'Frente Amplio',
        'frente-amplio',
        '#FF6600',
        '#CC5200',
        'FA',
      ],
    ];

    for (const party of parties) {
      insertParty.run(...party);
    }
    console.log('✓ Inserted 3 parties');

    // Insert politicians
    const insertPolitician = db.prepare(`
      INSERT INTO politicians (id, name, party_id, position, district, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const politicians = [
      [
        'POL_001',
        'María García López',
        'PARTY_001',
        'Diputada',
        'San José',
        1, // is_active
      ],
      ['POL_002', 'Carlos Rodríguez Silva', 'PARTY_002', 'Diputado', 'Cartago', 1],
      ['POL_003', 'Ana Martínez Campos', 'PARTY_003', 'Diputada', 'Alajuela', 1],
      ['POL_004', 'Juan Pérez Mora', 'PARTY_001', 'Diputado', 'Limón', 1],
      ['POL_005', 'Rosa Santos Díaz', 'PARTY_002', 'Diputada', 'Puntarenas', 1],
    ];

    for (const politician of politicians) {
      insertPolitician.run(...politician);
    }
    console.log(`✓ Inserted ${politicians.length} politicians`);

    // Insert attendance records (last 90 days from today)
    const insertRecord = db.prepare(`
      INSERT INTO attendance_records
      (id, politician_id, date, status, reason, year, month, session_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const statuses = ['attended', 'unattended', 'excused'];
    const reasons = [
      'Enfermedad personal',
      'Compromiso familiar',
      'Viaje oficial',
      'Falta justificada',
    ];

    let recordCount = 0;
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 90);

    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      // Skip weekends
      if (d.getDay() === 0 || d.getDay() === 6) continue;

      const dateStr = d.toISOString().split('T')[0];
      const year = d.getFullYear();
      const month = d.getMonth() + 1;

      for (const politician of politicians) {
        const politicianId = politician[0] as string;
        const statusIdx = Math.floor(Math.random() * statuses.length);
        const status = statuses[statusIdx];
        const reason =
          status === 'excused'
            ? reasons[Math.floor(Math.random() * reasons.length)]
            : undefined;

        const recordId = `${politicianId}-${dateStr}`;
        try {
          insertRecord.run(
            recordId,
            politicianId,
            dateStr,
            status,
            reason,
            year,
            month,
            'Plenary'
          );
          recordCount++;
        } catch (error) {
          // Ignore duplicate key errors (upsert would be better)
          if (!(error instanceof Error) || !error.message.includes('UNIQUE')) {
            throw error;
          }
        }
      }
    }
    console.log(`✓ Inserted ${recordCount} attendance records`);

    // Calculate and insert attendance summaries (yearly)
    const calculateSummary = db.prepare(`
      SELECT
        politician_id,
        year,
        NULL as month,
        COUNT(*) as total_sessions,
        SUM(CASE WHEN status = 'attended' THEN 1 ELSE 0 END) as attended_count,
        SUM(CASE WHEN status = 'unattended' THEN 1 ELSE 0 END) as unattended_count,
        SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused_count
      FROM attendance_records
      GROUP BY politician_id, year
    `);

    const summaries = calculateSummary.all() as Array<{
      politician_id: string;
      year: number;
      month: null;
      total_sessions: number;
      attended_count: number;
      unattended_count: number;
      excused_count: number;
    }>;

    const insertSummary = db.prepare(`
      INSERT INTO attendance_summaries
      (id, politician_id, year, month, total_sessions, attended_count, unattended_count, excused_count, percentage_attended)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const summary of summaries) {
      const percentage =
        summary.total_sessions > 0
          ? (summary.attended_count / summary.total_sessions) * 100
          : 0;
      const summaryId = `${summary.politician_id}-${summary.year}`;

      try {
        insertSummary.run(
          summaryId,
          summary.politician_id,
          summary.year,
          null,
          summary.total_sessions,
          summary.attended_count,
          summary.unattended_count,
          summary.excused_count,
          percentage
        );
      } catch {
        // Ignore duplicate errors
      }
    }
    console.log(`✓ Generated ${summaries.length} yearly summaries`);

    // Insert metadata
    const insertMetadata = db.prepare('INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)');
    insertMetadata.run('last_update', new Date().toISOString());
    insertMetadata.run(
      'data_source',
      'https://parliament.example.com/attendance'
    );
    insertMetadata.run('schema_version', '1.0.0');
    console.log('✓ Inserted metadata');

    console.log('\n✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run seeding
seedDatabase().catch(console.error);
