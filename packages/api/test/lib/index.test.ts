import createApp from '../../src/lib/index.js';

describe('createApp', () => {
  const app = createApp();

  it('GET / returns Hello Hono!', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('Hello Hono!');
  });

  it('GET /health returns status ok with timestamp', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
  });

  it('unknown route returns 404 JSON', async () => {
    const res = await app.request('/nonexistent');
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Not found');
    expect(body.statusCode).toBe(404);
  });

  it('includes CORS headers', async () => {
    const res = await app.request('/', {
      method: 'GET',
      headers: { Origin: 'http://example.com' },
    });
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
  });
});
