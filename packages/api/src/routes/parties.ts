import { Hono } from 'hono';
import { Database } from 'better-sqlite3';
import type { Party } from '@quienatiende/shared';

interface PartiesContext {
  Variables: {
    db: Database.Database;
  };
}

export const partiesRoute = new Hono<PartiesContext>();

/**
 * GET /api/parties
 * Returns all political parties with colors for chart rendering
 */
partiesRoute.get('/parties', (c) => {
  try {
    const db = c.get('db');

    const getParties = db.prepare(`
      SELECT id, name, slug, color, secondary_color, abbreviation, created_at
      FROM parties
      ORDER BY name ASC
    `);

    const parties = getParties.all() as Party[];

    return c.json({
      data: parties,
      statusCode: 200,
    });
  } catch (error) {
    console.error('Error fetching parties:', error);
    throw error;
  }
});
