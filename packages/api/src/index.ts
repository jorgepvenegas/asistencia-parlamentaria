import { Hono } from 'hono'
import { partiesRoute } from './routes/parties';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';

const app = new Hono()

app.use(logger());
app.use(
  cors({
    origin: '*',
    allowMethods: ['GET'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

app.route('/api', partiesRoute);

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

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
