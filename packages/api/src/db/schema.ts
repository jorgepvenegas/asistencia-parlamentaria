import { int, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";


export const politiciansTable = sqliteTable("politicians", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  partyId: int().notNull().references(() => partiesTable.id),
}, (table) => [
  uniqueIndex("name").on(table.name),
]);

export const partiesTable = sqliteTable("parties", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  slug: text().notNull().unique(),
  abbreviation: text().notNull().unique(),
}, (table) => [
  uniqueIndex("slug").on(table.slug),
]);

export const attendanceMonthlyTable = sqliteTable("attendance_monthly", {
  id: int().primaryKey({ autoIncrement: true }),
  politicianId: int().notNull().references(() => politiciansTable.id),
  year: int().notNull(),
  month: int().notNull(),
  attendanceCount: int().notNull(),
  absentCount: int().notNull(),
  justifiedAbsentCount: int().notNull(),
  unjustifiedAbsentCount: int().notNull(),
  attendanceAverage: real().notNull(),
}, (table) => [
  uniqueIndex("politician_month_idx").on(table.politicianId, table.year, table.month)
]);

export const attendanceYearlyTable = sqliteTable("attendance_yearly", {
  id: int().primaryKey({ autoIncrement: true }),
  politicianId: int().notNull().references(() => politiciansTable.id),
  year: int().notNull(),
  attendanceCount: int().notNull(),
  absentCount: int().notNull(),
  justifiedAbsentCount: int().notNull(),
  unjustifiedAbsentCount: int().notNull(),
  attendanceAverage: real().notNull(),
}, (table) => [
  uniqueIndex("politician_year_idx").on(table.politicianId, table.year)
]);
