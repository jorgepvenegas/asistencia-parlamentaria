import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { Database } from 'better-sqlite3';
import { initDatabase } from './db/init';

// Import routes
import { metadataRoute } from './routes/metadata';
import { partiesRoute } from './routes/parties';
import { politiciansRoute } from './routes/politicians';
import { searchRoute } from './routes/search';

interface AppContext {
  Variables: {
    db: Database.Database;
  };
}

const app = new Hono<AppContext>();

// Middleware
app.use(logger());
app.use(
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// Database middleware
app.use(async (c, next) => {
  if (!c.get('db')) {
    c.set('db', initDatabase());
  }
  await next();
});

// Error handling middleware
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json(
    {
      error: err.message || 'Internal server error',
      statusCode: 500,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
    500
  );
});

// Routes
app.route('/api', metadataRoute);
app.route('/api', partiesRoute);
app.route('/api', politiciansRoute);
app.route('/api', searchRoute);

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.notFound((c) => {
  return c.json(
    { error: 'Not found', statusCode: 404 },
    404
  );
});

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

console.log(`🚀 API server running at http://localhost:${port}`);
console.log(`📊 Metadata endpoint: GET /api/metadata`);
console.log(`🏛️  Parties endpoint: GET /api/parties`);
console.log(`👥 Politicians endpoint: GET /api/politicians`);
console.log(`🔍 Search endpoint: GET /api/search`);

export default {
  port,
  fetch: app.fetch,
};
