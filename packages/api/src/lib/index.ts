import { Hono } from "hono";
import { cors } from "hono/cors";

export default function createApp() {
  const app = new Hono()
    .use(cors({
      origin: '*',
      allowMethods: ['GET'],
      allowHeaders: ['Content-Type', 'Authorization'],
    }))
    .get('/', (c) => {
      return c.text('Hello Hono!')
    })
    .get('/health', (c) => {
      return c.json({ status: 'ok', timestamp: new Date().toISOString() });
    })
    .notFound((c) => {
      return c.json(
        { error: 'Not found', statusCode: 404 },
        404
      );
    })
  return app;
}
