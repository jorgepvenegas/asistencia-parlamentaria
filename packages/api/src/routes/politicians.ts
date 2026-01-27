import { Hono } from 'hono';
import { Database } from 'better-sqlite3';
import { getPoliticiansWithSummary, getPoliticianDetail, getPoliticianAttendanceHistory } from '../services/politicians';
import type { PoliticianWithSummary, PaginatedResponse } from '@quienatiende/shared';

interface PoliticiansContext {
  Variables: {
    db: Database.Database;
  };
}

export const politiciansRoute = new Hono<PoliticiansContext>();

/**
 * GET /api/politicians
 * List all politicians with yearly attendance summary
 * Query params: year, party_id, sort, limit, offset
 */
politiciansRoute.get('/politicians', (c) => {
  try {
    const db = c.get('db');

    const year = c.req.query('year') ? parseInt(c.req.query('year') as string, 10) : undefined;
    const party_id = c.req.query('party_id');
    const sort = (c.req.query('sort') as 'attendance_desc' | 'attendance_asc' | 'name_asc' | 'name_desc') || 'name_asc';
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit') as string, 10) : 100;
    const offset = c.req.query('offset') ? parseInt(c.req.query('offset') as string, 10) : 0;

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM politicians WHERE is_active = TRUE';
    const countParams: (string | number)[] = [];

    if (party_id) {
      countQuery += ' AND party_id = ?';
      countParams.push(party_id);
    }

    const countResult = db.prepare(countQuery).get(...countParams) as { total: number };
    const total = countResult.total;

    // Get paginated results
    const politicians = getPoliticiansWithSummary(db, {
      year,
      party_id,
      sort,
      limit,
      offset,
    });

    const response: PaginatedResponse<PoliticianWithSummary> = {
      data: politicians,
      pagination: {
        limit,
        offset,
        total,
      },
      metadata: {
        year: year || new Date().getFullYear(),
        party_id: party_id || null,
        sort,
      },
    };

    return c.json(response);
  } catch (error) {
    console.error('Error fetching politicians:', error);
    throw error;
  }
});

/**
 * GET /api/politicians/:id
 * Get politician profile with detail
 */
politiciansRoute.get('/politicians/:id', (c) => {
  try {
    const db = c.get('db');
    const politicianId = c.req.param('id');

    const politician = getPoliticianDetail(db, politicianId);

    if (!politician) {
      return c.json(
        { error: 'Politician not found', statusCode: 404 },
        404
      );
    }

    return c.json({
      data: politician,
      statusCode: 200,
    });
  } catch (error) {
    console.error('Error fetching politician detail:', error);
    throw error;
  }
});

/**
 * GET /api/politicians/:id/attendance
 * Get attendance records for a politician (monthly or yearly)
 * Query params: year, month
 */
politiciansRoute.get('/politicians/:id/attendance', (c) => {
  try {
    const db = c.get('db');
    const politicianId = c.req.param('id');
    const year = c.req.query('year') ? parseInt(c.req.query('year') as string, 10) : new Date().getFullYear();
    const month = c.req.query('month') ? parseInt(c.req.query('month') as string, 10) : undefined;

    // Verify politician exists
    const politician = getPoliticianDetail(db, politicianId);
    if (!politician) {
      return c.json(
        { error: 'Politician not found', statusCode: 404 },
        404
      );
    }

    const records = getPoliticianAttendanceHistory(db, politicianId, { year, month });

    return c.json({
      data: records,
      statusCode: 200,
      metadata: {
        politician_id: politicianId,
        year,
        month: month || null,
        record_count: records.length,
      },
    });
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    throw error;
  }
});
