import { vi } from 'vitest';
import { mockSelect, mockInsert, chain } from '../utils/db-mock.js';

vi.mock('../../src/db/index.js', () => ({
  db: { select: mockSelect, insert: mockInsert, update: vi.fn() },
}));
vi.mock('dotenv/config', () => ({}));

import { Hono } from 'hono';
import politiciansRoute from '../../src/routes/politicians.js';

const app = new Hono().route('/api', politiciansRoute);

describe('GET /api/politicians', () => {
  it('returns all politicians', async () => {
    const politicians = [{ id: 1, name: 'John', partyId: 1 }];
    mockSelect.mockReturnValue(chain(politicians));

    const res = await app.request('/api/politicians');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(politicians);
  });

  it('returns 500 on db error', async () => {
    mockSelect.mockReturnValue(chain(Promise.reject(new Error('db error'))));

    const res = await app.request('/api/politicians');
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Failed to fetch politicians');
  });
});

describe('POST /api/politicians', () => {
  const validBody = { name: 'John', partySlug: 'demo' };

  it('returns existing on duplicate name', async () => {
    const existing = [{ id: 1, name: 'John', partyId: 1 }];
    mockSelect.mockReturnValue(chain(existing));

    const res = await app.request('/api/politicians', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(existing[0]);
  });

  it('creates new when party found', async () => {
    // First call: check existing politician (empty)
    // Second call: find party by slug
    mockSelect
      .mockReturnValueOnce(chain([]))
      .mockReturnValueOnce(chain([{ id: 1, name: 'Demo', slug: 'demo', abbreviation: 'DM' }]));

    const created = { id: 2, name: 'John', partyId: 1 };
    mockInsert.mockReturnValue(chain([created]));

    const res = await app.request('/api/politicians', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data).toEqual(created);
  });

  it('returns 404 when party not found', async () => {
    mockSelect
      .mockReturnValueOnce(chain([]))
      .mockReturnValueOnce(chain([]));

    const res = await app.request('/api/politicians', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toContain('Party not found');
  });

  it('returns 400 on invalid body', async () => {
    const res = await app.request('/api/politicians', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' }),
    });
    expect(res.status).toBe(400);
  });
});
