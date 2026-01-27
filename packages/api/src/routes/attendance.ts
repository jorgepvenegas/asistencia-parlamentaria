import { Hono } from 'hono';
import { Database } from 'better-sqlite3';

interface AttendanceContext {
  Variables: {
    db: Database.Database;
  };
}

export const attendanceRoute = new Hono<AttendanceContext>();

/**
 * GET /api/attendance/summary
 * Get aggregated attendance statistics by party
 * Query params: year (required), parties (optional, comma-separated), month (optional)
 */
attendanceRoute.get('/attendance/summary', (c) => {
  try {
    const db = c.get('db');

    const year = c.req.query('year') ? parseInt(c.req.query('year') as string, 10) : undefined;
    const partiesParam = c.req.query('parties');
    const month = c.req.query('month') ? parseInt(c.req.query('month') as string, 10) : undefined;

    if (!year) {
      return c.json(
        {
          error: 'Query parameter "year" is required',
          statusCode: 400,
        },
        400
      );
    }

    // Parse party IDs
    let partyIds: string[] | null = null;
    if (partiesParam) {
      partyIds = (partiesParam as string).split(',').map((id) => id.trim()).filter((id) => id.length > 0);
    }

    let query = `
      SELECT
        p.id,
        p.party_id,
        p.name,
        p.position,
        pt.name as party_name,
        COUNT(ar.id) as total_sessions,
        SUM(CASE WHEN ar.status = 'attended' THEN 1 ELSE 0 END) as attended_count,
        SUM(CASE WHEN ar.status = 'unattended' THEN 1 ELSE 0 END) as unattended_count,
        SUM(CASE WHEN ar.status = 'excused' THEN 1 ELSE 0 END) as excused_count,
        ROUND(
          CAST(SUM(CASE WHEN ar.status = 'attended' THEN 1 ELSE 0 END) AS FLOAT) * 100.0 /
          NULLIF(COUNT(ar.id), 0),
          2
        ) as percentage_attended
      FROM politicians p
      JOIN parties pt ON p.party_id = pt.id
      LEFT JOIN attendance_records ar ON p.id = ar.politician_id AND ar.year = ?
    `;

    const params: (number | string)[] = [year];

    if (month) {
      query += ' AND ar.month = ?';
      params.push(month);
    }

    query += ' WHERE p.is_active = TRUE';

    if (partyIds && partyIds.length > 0) {
      const placeholders = partyIds.map(() => '?').join(',');
      query += ` AND p.party_id IN (${placeholders})`;
      params.push(...partyIds);
    }

    query += `
      GROUP BY p.id
      ORDER BY percentage_attended DESC, p.name ASC
    `;

    const stmt = db.prepare(query);
    const summary = stmt.all(...params) as Array<{
      id: string;
      party_id: string;
      name: string;
      position?: string;
      party_name: string;
      total_sessions: number;
      attended_count: number;
      unattended_count: number;
      excused_count: number;
      percentage_attended: number;
    }>;

    // Group by party
    const byParty: Record<string, Array<typeof summary[0]>> = {};
    for (const record of summary) {
      if (!byParty[record.party_id]) {
        byParty[record.party_id] = [];
      }
      byParty[record.party_id].push(record);
    }

    return c.json({
      data: summary,
      grouped_by_party: byParty,
      metadata: {
        year,
        month: month || null,
        parties_filtered: partyIds || null,
        total_politicians: summary.length,
      },
    });
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    throw error;
  }
});
