import {
  createPoliticianSchema,
  createPartySchema,
  createAttendanceMonthlySchema,
  createAttendanceYearlySchema,
} from '../../src/schemas/inputs.js';

describe('createPoliticianSchema', () => {
  it('accepts valid input', () => {
    const result = createPoliticianSchema.safeParse({ name: 'John', partySlug: 'demo' });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = createPoliticianSchema.safeParse({ name: '', partySlug: 'demo' });
    expect(result.success).toBe(false);
  });

  it('rejects missing partySlug', () => {
    const result = createPoliticianSchema.safeParse({ name: 'John' });
    expect(result.success).toBe(false);
  });
});

describe('createPartySchema', () => {
  it('accepts valid input', () => {
    const result = createPartySchema.safeParse({ name: 'Demo', slug: 'demo', abbreviation: 'DM' });
    expect(result.success).toBe(true);
  });

  it('rejects missing fields', () => {
    expect(createPartySchema.safeParse({ name: 'Demo' }).success).toBe(false);
    expect(createPartySchema.safeParse({}).success).toBe(false);
  });
});

describe('createAttendanceMonthlySchema', () => {
  const valid = {
    politicianId: 1,
    year: 2024,
    month: 6,
    attendanceCount: 10,
    absentCount: 2,
    justifiedAbsentCount: 1,
    unjustifiedAbsentCount: 1,
    attendanceAverage: 83.3,
  };

  it('accepts valid input', () => {
    expect(createAttendanceMonthlySchema.safeParse(valid).success).toBe(true);
  });

  it('rejects year < 2000', () => {
    expect(createAttendanceMonthlySchema.safeParse({ ...valid, year: 1999 }).success).toBe(false);
  });

  it('rejects year > 2100', () => {
    expect(createAttendanceMonthlySchema.safeParse({ ...valid, year: 2101 }).success).toBe(false);
  });

  it('rejects month 0', () => {
    expect(createAttendanceMonthlySchema.safeParse({ ...valid, month: 0 }).success).toBe(false);
  });

  it('rejects month 13', () => {
    expect(createAttendanceMonthlySchema.safeParse({ ...valid, month: 13 }).success).toBe(false);
  });

  it('rejects negative counts', () => {
    expect(createAttendanceMonthlySchema.safeParse({ ...valid, attendanceCount: -1 }).success).toBe(false);
  });

  it('rejects average > 100', () => {
    expect(createAttendanceMonthlySchema.safeParse({ ...valid, attendanceAverage: 101 }).success).toBe(false);
  });
});

describe('createAttendanceYearlySchema', () => {
  const valid = {
    politicianId: 1,
    year: 2024,
    attendanceCount: 100,
    absentCount: 20,
    justifiedAbsentCount: 10,
    unjustifiedAbsentCount: 10,
    attendanceAverage: 83.3,
  };

  it('accepts valid input', () => {
    expect(createAttendanceYearlySchema.safeParse(valid).success).toBe(true);
  });

  it('rejects year boundaries', () => {
    expect(createAttendanceYearlySchema.safeParse({ ...valid, year: 1999 }).success).toBe(false);
    expect(createAttendanceYearlySchema.safeParse({ ...valid, year: 2101 }).success).toBe(false);
  });

  it('accepts boundary values', () => {
    expect(createAttendanceYearlySchema.safeParse({ ...valid, year: 2000 }).success).toBe(true);
    expect(createAttendanceYearlySchema.safeParse({ ...valid, year: 2100 }).success).toBe(true);
    expect(createAttendanceYearlySchema.safeParse({ ...valid, attendanceAverage: 0 }).success).toBe(true);
    expect(createAttendanceYearlySchema.safeParse({ ...valid, attendanceAverage: 100 }).success).toBe(true);
  });
});
