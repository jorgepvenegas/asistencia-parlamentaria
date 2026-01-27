import { Hono } from 'hono';
import { Database } from 'better-sqlite3';

interface MetadataContext {
  Variables: {
    db: Database.Database;
  };
}

export const metadataRoute = new Hono<MetadataContext>();

interface MetadataResponse {
  last_update?: string;
  data_source?: string;
  schema_version?: string;
  available_years?: number[];
}

/**
 * GET /api/metadata
 * Returns system metadata including last update time, data source, and schema version
 */
metadataRoute.get('/metadata', (c) => {
  try {
    const db = c.get('db');

    const getMetadata = db.prepare('SELECT key, value FROM metadata');
    const metadataRows = getMetadata.all() as Array<{ key: string; value: string }>;

    const metadata: MetadataResponse = {};
    for (const row of metadataRows) {
      if (row.key === 'last_update' || row.key === 'data_source' || row.key === 'schema_version') {
        metadata[row.key as keyof MetadataResponse] = row.value;
      }
    }

    // Get available years
    const getYears = db.prepare('SELECT DISTINCT year FROM attendance_records ORDER BY year DESC');
    const yearsData = getYears.all() as Array<{ year: number }>;
    metadata.available_years = yearsData.map((y) => y.year);

    return c.json({
      data: metadata,
      statusCode: 200,
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    throw error;
  }
});
