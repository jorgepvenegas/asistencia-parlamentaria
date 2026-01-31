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

export const attendanceRecordsTable = sqliteTable("attendance_records", {
  id: int().primaryKey({ autoIncrement: true }),
  politicianId: int().notNull().references(() => politiciansTable.id),
  date: text().notNull(),
  attendanceCount: int().notNull(),
  unattendedCount: int().notNull(),
  unattendedValidCount: int().notNull(),
  unattendedInvalidCount: int().notNull(),
  // validJustifications: text(),
  // invalidJustifications: text(),
  attendanceAverage: real().notNull(),
}, (table) => [
  uniqueIndex("politicianId").on(table.politicianId)
]);
