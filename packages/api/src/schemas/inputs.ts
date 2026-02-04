import { z } from 'zod';

// Politicians
export const createPoliticianSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  partySlug: z.string().min(1, 'Party slug is required'),
});
export type CreatePoliticianInput = z.infer<typeof createPoliticianSchema>;

// Parties
export const createPartySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  abbreviation: z.string().min(1, 'Abbreviation is required'),
});
export type CreatePartyInput = z.infer<typeof createPartySchema>;

// Attendance Monthly
export const createAttendanceMonthlySchema = z.object({
  politicianId: z.number().min(1),
  year: z.number().min(2000).max(2100),
  month: z.number().min(1).max(12),
  attendanceCount: z.number().min(0),
  absentCount: z.number().min(0),
  justifiedAbsentCount: z.number().min(0),
  unjustifiedAbsentCount: z.number().min(0),
  attendanceAverage: z.number().min(0).max(100),
});
export type CreateAttendanceMonthlyInput = z.infer<typeof createAttendanceMonthlySchema>;

// Attendance Yearly
export const createAttendanceYearlySchema = z.object({
  politicianId: z.number().min(1),
  year: z.number().min(2000).max(2100),
  attendanceCount: z.number().min(0),
  absentCount: z.number().min(0),
  justifiedAbsentCount: z.number().min(0),
  unjustifiedAbsentCount: z.number().min(0),
  attendanceAverage: z.number().min(0).max(100),
});
export type CreateAttendanceYearlyInput = z.infer<typeof createAttendanceYearlySchema>;
