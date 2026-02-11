import { vi } from 'vitest';
import { mockSelect, mockInsert, chain } from '../utils/db-mock.js';

vi.mock('../../src/db/index.js', () => ({
  db: { select: mockSelect, insert: mockInsert, update: vi.fn() },
}));
vi.mock('dotenv/config', () => ({}));

import { Hono } from 'hono';
import partiesRoute from '../../src/routes/parties.js';

const app = new Hono().route('/api', partiesRoute);

describe('GET /api/parties', () => {
  it('returns list of parties', async () => {
    const parties = [{ id: 1, name: 'Demo', slug: 'demo', abbreviation: 'DM' }];
    mockSelect.mockReturnValue(chain(parties));

    const res = await app.request('/api/parties');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(parties);
  });

  it('returns 500 on db error', async () => {
    mockSelect.mockReturnValue(chain(Promise.reject(new Error('db error'))));

    const res = await app.request('/api/parties');
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Failed to fetch parties');
  });
});

describe('POST /api/parties', () => {
  const validBody = { name: 'Demo', slug: 'demo', abbreviation: 'DM' };

  it('returns existing party on duplicate slug/abbreviation', async () => {
    const existing = [{ id: 1, ...validBody }];
    mockSelect.mockReturnValue(chain(existing));

    const res = await app.request('/api/parties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(existing[0]);
  });

  it('creates new party when not existing', async () => {
    const created = { id: 2, ...validBody };
    mockSelect.mockReturnValue(chain([]));
    mockInsert.mockReturnValue(chain([created]));

    const res = await app.request('/api/parties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data).toEqual(created);
  });

  it('returns 400 on invalid body', async () => {
    const res = await app.request('/api/parties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Demo' }),
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/parties/:slug', () => {
  it('returns party by slug', async () => {
    const party = [{ id: 1, name: 'Demo', slug: 'demo', abbreviation: 'DM' }];
    mockSelect.mockReturnValue(chain(party));

    const res = await app.request('/api/parties/demo');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(party[0]);
  });

  it('returns 404 when not found', async () => {
    mockSelect.mockReturnValue(chain([]));

    const res = await app.request('/api/parties/nonexistent');
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Party not found');
  });
});
