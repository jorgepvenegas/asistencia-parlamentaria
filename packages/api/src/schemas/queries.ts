import { z } from 'zod';

const yearString = z.string().regex(/^\d{4}$/, 'Year must be 4 digits').transform(Number).optional();
const monthString = z.string().regex(/^(1[0-2]|[1-9])$/, 'Month must be 1-12').transform(Number).optional();

export const attendanceMonthlyQuerySchema = z.object({
  year: yearString,
  month: monthString,
});
export type AttendanceMonthlyQuery = z.infer<typeof attendanceMonthlyQuerySchema>;

export const attendanceYearlyQuerySchema = z.object({
  year: yearString,
});
export type AttendanceYearlyQuery = z.infer<typeof attendanceYearlyQuerySchema>;

export const partyAttendanceQuerySchema = z.object({
  year: yearString,
  month: monthString,
});
export type PartyAttendanceQuery = z.infer<typeof partyAttendanceQuerySchema>;
