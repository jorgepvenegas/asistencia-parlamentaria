import { Hono } from 'hono';
import { Database } from 'better-sqlite3';
import { searchPoliticians } from '../services/politicians';
import type { PoliticianWithSummary } from '@quienatiende/shared';

interface SearchContext {
  Variables: {
    db: Database.Database;
  };
}

export const searchRoute = new Hono<SearchContext>();

/**
 * GET /api/search
 * Search politicians by name (autocomplete support)
 * Query params: q (required), limit (optional, default 10, max 50)
 */
searchRoute.get('/search', (c) => {
  try {
    const db = c.get('db');
    const query = c.req.query('q');
    const limit = c.req.query('limit') ? Math.min(parseInt(c.req.query('limit') as string, 10), 50) : 10;

    if (!query || query.trim().length === 0) {
      return c.json(
        {
          error: 'Query parameter "q" is required',
          statusCode: 400,
        },
        400
      );
    }

    if (query.length > 100) {
      return c.json(
        {
          error: 'Query must be less than 100 characters',
          statusCode: 400,
        },
        400
      );
    }

    const results = searchPoliticians(db, query, limit);

    return c.json({
      data: results,
      statusCode: 200,
      metadata: {
        query,
        result_count: results.length,
        limit,
      },
    });
  } catch (error) {
    console.error('Error searching politicians:', error);
    throw error;
  }
});
