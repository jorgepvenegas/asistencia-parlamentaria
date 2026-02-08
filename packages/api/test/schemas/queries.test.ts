import {
  attendanceMonthlyQuerySchema,
  attendanceYearlyQuerySchema,
  partyAttendanceQuerySchema,
} from '../../src/schemas/queries.js';

describe('attendanceMonthlyQuerySchema', () => {
  it('accepts valid year + month', () => {
    const result = attendanceMonthlyQuerySchema.safeParse({ year: '2024', month: '6' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.year).toBe(2024);
      expect(result.data.month).toBe(6);
    }
  });

  it('accepts both optional (empty object)', () => {
    const result = attendanceMonthlyQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.year).toBeUndefined();
      expect(result.data.month).toBeUndefined();
    }
  });

  it('rejects 3-digit year', () => {
    expect(attendanceMonthlyQuerySchema.safeParse({ year: '999' }).success).toBe(false);
  });

  it('rejects month 0', () => {
    expect(attendanceMonthlyQuerySchema.safeParse({ month: '0' }).success).toBe(false);
  });

  it('rejects month 13', () => {
    expect(attendanceMonthlyQuerySchema.safeParse({ month: '13' }).success).toBe(false);
  });

  it('coerces strings to numbers', () => {
    const result = attendanceMonthlyQuerySchema.safeParse({ year: '2024', month: '12' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.year).toBe('number');
      expect(typeof result.data.month).toBe('number');
    }
  });
});

describe('attendanceYearlyQuerySchema', () => {
  it('accepts valid year', () => {
    const result = attendanceYearlyQuerySchema.safeParse({ year: '2024' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.year).toBe(2024);
  });

  it('accepts optional year', () => {
    const result = attendanceYearlyQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('partyAttendanceQuerySchema', () => {
  it('accepts valid year + month', () => {
    const result = partyAttendanceQuerySchema.safeParse({ year: '2024', month: '1' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.year).toBe(2024);
      expect(result.data.month).toBe(1);
    }
  });

  it('rejects invalid month', () => {
    expect(partyAttendanceQuerySchema.safeParse({ month: '13' }).success).toBe(false);
  });
});
