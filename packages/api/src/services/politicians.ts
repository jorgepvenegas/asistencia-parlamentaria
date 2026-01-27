import { Database } from 'better-sqlite3';
import type { PoliticianWithSummary } from '@quienatiende/shared';

export interface GetPoliticiansOptions {
  year?: number;
  party_id?: string;
  sort?: 'attendance_desc' | 'attendance_asc' | 'name_asc' | 'name_desc';
  limit?: number;
  offset?: number;
}

/**
 * Get politicians with yearly attendance summary
 */
export function getPoliticiansWithSummary(
  db: Database.Database,
  options: GetPoliticiansOptions = {}
): PoliticianWithSummary[] {
  const {
    year,
    party_id,
    sort = 'name_asc',
    limit = 100,
    offset = 0,
  } = options;

  let query = `
    SELECT
      p.id,
      p.name,
      p.party_id,
      p.position,
      p.district,
      p.photo_url,
      p.is_active,
      p.created_at,
      p.updated_at,
      COALESCE(asy.percentage_attended, 0) as percentage_attended,
      COALESCE(asy.attended_count, 0) as attended_count,
      COALESCE(asy.unattended_count, 0) as unattended_count,
      COALESCE(asy.excused_count, 0) as excused_count
    FROM politicians p
    LEFT JOIN attendance_summaries asy ON
      p.id = asy.politician_id
      AND asy.year = ?
      AND asy.month IS NULL
    WHERE p.is_active = TRUE
  `;

  const params: (string | number | undefined)[] = [year || new Date().getFullYear()];

  if (party_id) {
    query += ' AND p.party_id = ?';
    params.push(party_id);
  }

  // Add sorting
  const sortMap: Record<string, string> = {
    attendance_desc: 'COALESCE(asy.percentage_attended, 0) DESC',
    attendance_asc: 'COALESCE(asy.percentage_attended, 0) ASC',
    name_asc: 'p.name ASC',
    name_desc: 'p.name DESC',
  };

  query += ` ORDER BY ${sortMap[sort] || sortMap['name_asc']}`;
  query += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const stmt = db.prepare(query);
  const politicians = stmt.all(...params) as PoliticianWithSummary[];

  return politicians;
}

/**
 * Get single politician detail
 */
export function getPoliticianDetail(
  db: Database.Database,
  politicianId: string
): PoliticianWithSummary | null {
  const query = `
    SELECT
      p.id,
      p.name,
      p.party_id,
      p.position,
      p.district,
      p.photo_url,
      p.is_active,
      p.created_at,
      p.updated_at
    FROM politicians p
    WHERE p.id = ? AND p.is_active = TRUE
  `;

  const stmt = db.prepare(query);
  const politician = stmt.get(politicianId) as PoliticianWithSummary | undefined;

  return politician || null;
}

/**
 * Search politicians by name
 */
export function searchPoliticians(
  db: Database.Database,
  query: string,
  limit = 10
): PoliticianWithSummary[] {
  const searchQuery = `
    SELECT
      id,
      name,
      party_id,
      position,
      district,
      photo_url,
      is_active,
      created_at,
      updated_at
    FROM politicians
    WHERE is_active = TRUE AND name LIKE ?
    ORDER BY name ASC
    LIMIT ?
  `;

  const stmt = db.prepare(searchQuery);
  const searchTerm = `%${query}%`;
  const results = stmt.all(searchTerm, limit) as PoliticianWithSummary[];

  return results;
}

/**
 * Get attendance history for politician
 */
export function getPoliticianAttendanceHistory(
  db: Database.Database,
  politicianId: string,
  options: { year?: number; month?: number } = {}
): Array<{
  date: string;
  status: string;
  reason?: string;
  session_type?: string;
}> {
  const { year, month } = options;

  let query = `
    SELECT date, status, reason, session_type
    FROM attendance_records
    WHERE politician_id = ?
  `;

  const params: (string | number)[] = [politicianId];

  if (year) {
    query += ' AND year = ?';
    params.push(year);
  }

  if (month) {
    query += ' AND month = ?';
    params.push(month);
  }

  query += ' ORDER BY date DESC';

  const stmt = db.prepare(query);
  const records = stmt.all(...params) as Array<{
    date: string;
    status: string;
    reason?: string;
    session_type?: string;
  }>;

  return records;
}

/**
 * Get attendance summary for politician
 */
export function getPoliticianAttendanceSummary(
  db: Database.Database,
  politicianId: string,
  year: number,
  month?: number
): {
  percentage_attended: number;
  attended_count: number;
  unattended_count: number;
  excused_count: number;
  total_sessions: number;
} | null {
  let query = `
    SELECT
      percentage_attended,
      attended_count,
      unattended_count,
      excused_count,
      total_sessions
    FROM attendance_summaries
    WHERE politician_id = ? AND year = ?
  `;

  const params: (string | number | null)[] = [politicianId, year];

  if (month) {
    query += ' AND month = ?';
    params.push(month);
  } else {
    query += ' AND month IS NULL';
  }

  const stmt = db.prepare(query);
  const summary = stmt.get(...params) as {
    percentage_attended: number;
    attended_count: number;
    unattended_count: number;
    excused_count: number;
    total_sessions: number;
  } | undefined;

  return summary || null;
}
