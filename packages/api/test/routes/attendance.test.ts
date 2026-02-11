import { vi } from 'vitest';
import { mockSelect, mockInsert, mockUpdate, chain } from '../utils/db-mock.js';

vi.mock('../../src/db/index.js', () => ({
  db: { select: mockSelect, insert: mockInsert, update: mockUpdate },
}));
vi.mock('dotenv/config', () => ({}));

import { Hono } from 'hono';
import attendanceRoute from '../../src/routes/attendance.js';

const app = new Hono().route('/api', attendanceRoute);

// --- Monthly individual ---

describe('GET /api/attendance/monthly', () => {
  it('returns all records with no filters', async () => {
    const records = [{ id: 1, politicianId: 1, year: 2024, month: 6, attendanceCount: 10, absentCount: 2, justifiedAbsentCount: 1, unjustifiedAbsentCount: 1, attendanceAverage: 83 }];
    mockSelect.mockReturnValue(chain(records));

    const res = await app.request('/api/attendance/monthly');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(records);
  });

  it('filters by year only', async () => {
    mockSelect.mockReturnValue(chain([]));
    const res = await app.request('/api/attendance/monthly?year=2024');
    expect(res.status).toBe(200);
  });

  it('filters by year + month', async () => {
    mockSelect.mockReturnValue(chain([]));
    const res = await app.request('/api/attendance/monthly?year=2024&month=6');
    expect(res.status).toBe(200);
  });

  it('returns 500 on db error', async () => {
    mockSelect.mockReturnValue(chain(Promise.reject(new Error('fail'))));
    const res = await app.request('/api/attendance/monthly');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/attendance/monthly', () => {
  const validBody = {
    politicianId: 1, year: 2024, month: 6,
    attendanceCount: 10, absentCount: 2,
    justifiedAbsentCount: 1, unjustifiedAbsentCount: 1,
    attendanceAverage: 83,
  };

  it('creates new record', async () => {
    mockSelect.mockReturnValue(chain([]));
    mockInsert.mockReturnValue(chain([{ id: 1, ...validBody }]));

    const res = await app.request('/api/attendance/monthly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(201);
  });

  it('updates existing record (upsert)', async () => {
    const existing = [{ id: 1, ...validBody }];
    mockSelect.mockReturnValue(chain(existing));
    mockUpdate.mockReturnValue(chain([{ id: 1, ...validBody, attendanceCount: 15 }]));

    const res = await app.request('/api/attendance/monthly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(200);
  });

  it('returns 500 on db error', async () => {
    mockSelect.mockReturnValue(chain(Promise.reject(new Error('fail'))));
    const res = await app.request('/api/attendance/monthly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(500);
  });
});

// --- Yearly individual ---

describe('GET /api/attendance/yearly', () => {
  it('returns all records with no filter', async () => {
    mockSelect.mockReturnValue(chain([{ id: 1 }]));
    const res = await app.request('/api/attendance/yearly');
    expect(res.status).toBe(200);
  });

  it('filters by year', async () => {
    mockSelect.mockReturnValue(chain([]));
    const res = await app.request('/api/attendance/yearly?year=2024');
    expect(res.status).toBe(200);
  });

  it('returns 500 on db error', async () => {
    mockSelect.mockReturnValue(chain(Promise.reject(new Error('fail'))));
    const res = await app.request('/api/attendance/yearly');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/attendance/yearly', () => {
  const validBody = {
    politicianId: 1, year: 2024,
    attendanceCount: 100, absentCount: 20,
    justifiedAbsentCount: 10, unjustifiedAbsentCount: 10,
    attendanceAverage: 83,
  };

  it('creates new record', async () => {
    mockSelect.mockReturnValue(chain([]));
    mockInsert.mockReturnValue(chain([{ id: 1, ...validBody }]));

    const res = await app.request('/api/attendance/yearly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(201);
  });

  it('updates existing record (upsert)', async () => {
    mockSelect.mockReturnValue(chain([{ id: 1, ...validBody }]));
    mockUpdate.mockReturnValue(chain([{ id: 1, ...validBody }]));

    const res = await app.request('/api/attendance/yearly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(200);
  });
});

// --- Party monthly ---

describe('GET /api/attendance/party/monthly/:partyId', () => {
  it('returns records with no filter', async () => {
    mockSelect.mockReturnValue(chain([{ partyId: 1, year: 2024, month: 6 }]));
    const res = await app.request('/api/attendance/party/monthly/1');
    expect(res.status).toBe(200);
  });

  it('filters by year', async () => {
    mockSelect.mockReturnValue(chain([]));
    const res = await app.request('/api/attendance/party/monthly/1?year=2024');
    expect(res.status).toBe(200);
  });

  it('filters by year + month', async () => {
    mockSelect.mockReturnValue(chain([]));
    const res = await app.request('/api/attendance/party/monthly/1?year=2024&month=6');
    expect(res.status).toBe(200);
  });

  it('returns 500 on db error', async () => {
    mockSelect.mockReturnValue(chain(Promise.reject(new Error('fail'))));
    const res = await app.request('/api/attendance/party/monthly/1');
    expect(res.status).toBe(500);
  });
});

// --- Party yearly ---

describe('GET /api/attendance/party/yearly/:partyId', () => {
  it('returns records with no filter', async () => {
    mockSelect.mockReturnValue(chain([{ partyId: 1, year: 2024 }]));
    const res = await app.request('/api/attendance/party/yearly/1');
    expect(res.status).toBe(200);
  });

  it('filters by year', async () => {
    mockSelect.mockReturnValue(chain([]));
    const res = await app.request('/api/attendance/party/yearly/1?year=2024');
    expect(res.status).toBe(200);
  });

  it('returns 500 on db error', async () => {
    mockSelect.mockReturnValue(chain(Promise.reject(new Error('fail'))));
    const res = await app.request('/api/attendance/party/yearly/1');
    expect(res.status).toBe(500);
  });
});

// --- All parties monthly ---

describe('GET /api/attendance/parties/monthly', () => {
  it('returns records with no filter', async () => {
    mockSelect.mockReturnValue(chain([{ partyId: 1, partyName: 'Demo', year: 2024, month: 6 }]));
    const res = await app.request('/api/attendance/parties/monthly');
    expect(res.status).toBe(200);
  });

  it('filters by year', async () => {
    mockSelect.mockReturnValue(chain([]));
    const res = await app.request('/api/attendance/parties/monthly?year=2024');
    expect(res.status).toBe(200);
  });

  it('filters by year + month', async () => {
    mockSelect.mockReturnValue(chain([]));
    const res = await app.request('/api/attendance/parties/monthly?year=2024&month=6');
    expect(res.status).toBe(200);
  });

  it('returns 500 on db error', async () => {
    mockSelect.mockReturnValue(chain(Promise.reject(new Error('fail'))));
    const res = await app.request('/api/attendance/parties/monthly');
    expect(res.status).toBe(500);
  });
});

// --- All parties yearly ---

describe('GET /api/attendance/parties/yearly', () => {
  it('returns records with no filter', async () => {
    mockSelect.mockReturnValue(chain([{ partyId: 1, partyName: 'Demo', year: 2024 }]));
    const res = await app.request('/api/attendance/parties/yearly');
    expect(res.status).toBe(200);
  });

  it('filters by year', async () => {
    mockSelect.mockReturnValue(chain([]));
    const res = await app.request('/api/attendance/parties/yearly?year=2024');
    expect(res.status).toBe(200);
  });

  it('returns 500 on db error', async () => {
    mockSelect.mockReturnValue(chain(Promise.reject(new Error('fail'))));
    const res = await app.request('/api/attendance/parties/yearly');
    expect(res.status).toBe(500);
  });
});
