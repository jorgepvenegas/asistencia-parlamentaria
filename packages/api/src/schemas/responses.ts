import { z } from 'zod';

// Plain zod schemas for API responses (compatible with z.array())
// These mirror the drizzle table schemas but are standard zod types

export const politicianResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  partyId: z.number(),
});

export type PoliticianResponse = z.infer<typeof politicianResponseSchema>;

export const partyResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  abbreviation: z.string(),
});

export type PartyResponse = z.infer<typeof partyResponseSchema>;

export const attendanceYearlyResponseSchema = z.object({
  id: z.number(),
  politicianId: z.number(),
  year: z.number(),
  attendanceCount: z.number(),
  absentCount: z.number(),
  justifiedAbsentCount: z.number(),
  unjustifiedAbsentCount: z.number(),
  attendanceAverage: z.number(),
});

export type AttendanceYearlyResponse = z.infer<typeof attendanceYearlyResponseSchema>;

export const attendanceMonthlyResponseSchema = attendanceYearlyResponseSchema.extend({
  month: z.number(),
});

export type AttendanceMonthlyResponse = z.infer<typeof attendanceMonthlyResponseSchema>;

// Party attendance yearly aggregate (computed from joins)
export const partyAttendanceYearlyResponseSchema = z.object({
  partyId: z.number(),
  partyName: z.string(),
  year: z.number(),
  attendanceCount: z.number(),
  absentCount: z.number(),
  justifiedAbsentCount: z.number(),
  unjustifiedAbsentCount: z.number(),
  attendanceAverage: z.number(),
});

export type PartyAttendanceYearlyResponse = z.infer<typeof partyAttendanceYearlyResponseSchema>;

// Party attendance monthly aggregate
export const partyAttendanceMonthlyResponseSchema = partyAttendanceYearlyResponseSchema.extend({
  month: z.number(),
});

export type PartyAttendanceMonthlyResponse = z.infer<typeof partyAttendanceMonthlyResponseSchema>;
