import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import {
  politiciansTable,
  partiesTable,
  attendanceMonthlyTable,
  attendanceYearlyTable,
} from '../db/schema.js';

// Politicians
export const insertPoliticianSchema = createInsertSchema(politiciansTable);
export const selectPoliticianSchema = createSelectSchema(politiciansTable);
export type InsertPolitician = typeof politiciansTable.$inferInsert;
export type SelectPolitician = typeof politiciansTable.$inferSelect;

// Parties
export const insertPartySchema = createInsertSchema(partiesTable);
export const selectPartySchema = createSelectSchema(partiesTable);
export type InsertParty = typeof partiesTable.$inferInsert;
export type SelectParty = typeof partiesTable.$inferSelect;

// Attendance Monthly
export const insertAttendanceMonthlySchema = createInsertSchema(attendanceMonthlyTable);
export const selectAttendanceMonthlySchema = createSelectSchema(attendanceMonthlyTable);
export type InsertAttendanceMonthly = typeof attendanceMonthlyTable.$inferInsert;
export type SelectAttendanceMonthly = typeof attendanceMonthlyTable.$inferSelect;

// Attendance Yearly
export const insertAttendanceYearlySchema = createInsertSchema(attendanceYearlyTable);
export const selectAttendanceYearlySchema = createSelectSchema(attendanceYearlyTable);
export type InsertAttendanceYearly = typeof attendanceYearlyTable.$inferInsert;
export type SelectAttendanceYearly = typeof attendanceYearlyTable.$inferSelect;
