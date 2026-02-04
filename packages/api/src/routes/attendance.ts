import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { and, eq, sum, sql } from 'drizzle-orm';
import 'dotenv/config';
import { attendanceMonthlyTable, attendanceYearlyTable, politiciansTable, partiesTable } from '../db/schema.js';
import { db } from '../db/index.js';
import {
  createAttendanceMonthlySchema,
  createAttendanceYearlySchema,
  attendanceMonthlyQuerySchema,
  attendanceYearlyQuerySchema,
  partyAttendanceQuerySchema,
} from '../schemas/index.js';

const monthlyRoute = new Hono()
  .get('/', zValidator('query', attendanceMonthlyQuerySchema), async (c) => {
    try {
      const { year, month } = c.req.valid('query');

      if (year && month) {
        const records = await db.select().from(attendanceMonthlyTable)
          .where(and(
            eq(attendanceMonthlyTable.year, year),
            eq(attendanceMonthlyTable.month, month)
          ));
        return c.json({ data: records, statusCode: 200 });
      }

      if (year) {
        const records = await db.select().from(attendanceMonthlyTable)
          .where(eq(attendanceMonthlyTable.year, year));
        return c.json({ data: records, statusCode: 200 });
      }

      const records = await db.select().from(attendanceMonthlyTable);
      return c.json({ data: records, statusCode: 200 });
    } catch (error) {
      console.error('Error fetching monthly attendance:', error);
      return c.json({ error: 'Failed to fetch monthly attendance', statusCode: 500 }, 500);
    }
  })
  .post('/', zValidator('json', createAttendanceMonthlySchema), async (c) => {
    try {
      const data = c.req.valid('json');

      const existing = await db.select().from(attendanceMonthlyTable)
        .where(and(
          eq(attendanceMonthlyTable.politicianId, data.politicianId),
          eq(attendanceMonthlyTable.year, data.year),
          eq(attendanceMonthlyTable.month, data.month)
        ))
        .limit(1);

      if (existing.length > 0) {
        const updated = await db.update(attendanceMonthlyTable)
          .set(data)
          .where(and(
            eq(attendanceMonthlyTable.politicianId, data.politicianId),
            eq(attendanceMonthlyTable.year, data.year),
            eq(attendanceMonthlyTable.month, data.month)
          ))
          .returning();
        return c.json({ data: updated[0], statusCode: 200 });
      }

      const created = await db.insert(attendanceMonthlyTable).values(data).returning();
      return c.json({ data: created[0], statusCode: 201 }, 201);
    } catch (error) {
      console.error('Error creating monthly attendance:', error);
      return c.json({ error: 'Failed to create monthly attendance', statusCode: 500 }, 500);
    }
  });

const yearlyRoute = new Hono()
  .get('/', zValidator('query', attendanceYearlyQuerySchema), async (c) => {
    try {
      const { year } = c.req.valid('query');

      if (year) {
        const records = await db.select().from(attendanceYearlyTable)
          .where(eq(attendanceYearlyTable.year, year));
        return c.json({ data: records, statusCode: 200 });
      }

      const records = await db.select().from(attendanceYearlyTable);
      return c.json({ data: records, statusCode: 200 });
    } catch (error) {
      console.error('Error fetching yearly attendance:', error);
      return c.json({ error: 'Failed to fetch yearly attendance', statusCode: 500 }, 500);
    }
  })
  .post('/', zValidator('json', createAttendanceYearlySchema), async (c) => {
    try {
      const data = c.req.valid('json');

      const existing = await db.select().from(attendanceYearlyTable)
        .where(and(
          eq(attendanceYearlyTable.politicianId, data.politicianId),
          eq(attendanceYearlyTable.year, data.year)
        ))
        .limit(1);

      if (existing.length > 0) {
        const updated = await db.update(attendanceYearlyTable)
          .set(data)
          .where(and(
            eq(attendanceYearlyTable.politicianId, data.politicianId),
            eq(attendanceYearlyTable.year, data.year)
          ))
          .returning();
        return c.json({ data: updated[0], statusCode: 200 });
      }

      const created = await db.insert(attendanceYearlyTable).values(data).returning();
      return c.json({ data: created[0], statusCode: 201 }, 201);
    } catch (error) {
      console.error('Error creating yearly attendance:', error);
      return c.json({ error: 'Failed to create yearly attendance', statusCode: 500 }, 500);
    }
  });

const partyMonthlyRoute = new Hono()
  .get('/:partyId', zValidator('query', partyAttendanceQuerySchema), async (c) => {
    try {
      const partyId = parseInt(c.req.param('partyId'));
      const { year, month } = c.req.valid('query');

      const baseQuery = db
        .select({
          partyId: politiciansTable.partyId,
          year: attendanceMonthlyTable.year,
          month: attendanceMonthlyTable.month,
          attendanceCount: sum(attendanceMonthlyTable.attendanceCount).mapWith(Number),
          absentCount: sum(attendanceMonthlyTable.absentCount).mapWith(Number),
          justifiedAbsentCount: sum(attendanceMonthlyTable.justifiedAbsentCount).mapWith(Number),
          unjustifiedAbsentCount: sum(attendanceMonthlyTable.unjustifiedAbsentCount).mapWith(Number),
          attendanceAverage: sql<number>`avg(${attendanceMonthlyTable.attendanceAverage})`.mapWith(Number),
        })
        .from(attendanceMonthlyTable)
        .innerJoin(politiciansTable, eq(attendanceMonthlyTable.politicianId, politiciansTable.id))
        .where(eq(politiciansTable.partyId, partyId))
        .groupBy(politiciansTable.partyId, attendanceMonthlyTable.year, attendanceMonthlyTable.month);

      let records;
      if (year && month) {
        records = await db
          .select({
            partyId: politiciansTable.partyId,
            year: attendanceMonthlyTable.year,
            month: attendanceMonthlyTable.month,
            attendanceCount: sum(attendanceMonthlyTable.attendanceCount).mapWith(Number),
            absentCount: sum(attendanceMonthlyTable.absentCount).mapWith(Number),
            justifiedAbsentCount: sum(attendanceMonthlyTable.justifiedAbsentCount).mapWith(Number),
            unjustifiedAbsentCount: sum(attendanceMonthlyTable.unjustifiedAbsentCount).mapWith(Number),
            attendanceAverage: sql<number>`avg(${attendanceMonthlyTable.attendanceAverage})`.mapWith(Number),
          })
          .from(attendanceMonthlyTable)
          .innerJoin(politiciansTable, eq(attendanceMonthlyTable.politicianId, politiciansTable.id))
          .where(and(
            eq(politiciansTable.partyId, partyId),
            eq(attendanceMonthlyTable.year, year),
            eq(attendanceMonthlyTable.month, month)
          ))
          .groupBy(politiciansTable.partyId, attendanceMonthlyTable.year, attendanceMonthlyTable.month);
      } else if (year) {
        records = await db
          .select({
            partyId: politiciansTable.partyId,
            year: attendanceMonthlyTable.year,
            month: attendanceMonthlyTable.month,
            attendanceCount: sum(attendanceMonthlyTable.attendanceCount).mapWith(Number),
            absentCount: sum(attendanceMonthlyTable.absentCount).mapWith(Number),
            justifiedAbsentCount: sum(attendanceMonthlyTable.justifiedAbsentCount).mapWith(Number),
            unjustifiedAbsentCount: sum(attendanceMonthlyTable.unjustifiedAbsentCount).mapWith(Number),
            attendanceAverage: sql<number>`avg(${attendanceMonthlyTable.attendanceAverage})`.mapWith(Number),
          })
          .from(attendanceMonthlyTable)
          .innerJoin(politiciansTable, eq(attendanceMonthlyTable.politicianId, politiciansTable.id))
          .where(and(
            eq(politiciansTable.partyId, partyId),
            eq(attendanceMonthlyTable.year, year)
          ))
          .groupBy(politiciansTable.partyId, attendanceMonthlyTable.year, attendanceMonthlyTable.month);
      } else {
        records = await baseQuery;
      }

      return c.json({ data: records, statusCode: 200 });
    } catch (error) {
      console.error('Error fetching party monthly attendance:', error);
      return c.json({ error: 'Failed to fetch party monthly attendance', statusCode: 500 }, 500);
    }
  });

const partyYearlyRoute = new Hono()
  .get('/:partyId', zValidator('query', attendanceYearlyQuerySchema), async (c) => {
    try {
      const partyId = parseInt(c.req.param('partyId'));
      const { year } = c.req.valid('query');
      let records;
      if (year) {
        records = await db
          .select({
            partyId: politiciansTable.partyId,
            year: attendanceYearlyTable.year,
            attendanceCount: sum(attendanceYearlyTable.attendanceCount).mapWith(Number),
            absentCount: sum(attendanceYearlyTable.absentCount).mapWith(Number),
            justifiedAbsentCount: sum(attendanceYearlyTable.justifiedAbsentCount).mapWith(Number),
            unjustifiedAbsentCount: sum(attendanceYearlyTable.unjustifiedAbsentCount).mapWith(Number),
            attendanceAverage: sql<number>`avg(${attendanceYearlyTable.attendanceAverage})`.mapWith(Number),
          })
          .from(attendanceYearlyTable)
          .innerJoin(politiciansTable, eq(attendanceYearlyTable.politicianId, politiciansTable.id))
          .where(and(
            eq(politiciansTable.partyId, partyId),
            eq(attendanceYearlyTable.year, year)
          ))
          .groupBy(politiciansTable.partyId, attendanceYearlyTable.year);
      } else {
        records = await db
          .select({
            partyId: politiciansTable.partyId,
            year: attendanceYearlyTable.year,
            attendanceCount: sum(attendanceYearlyTable.attendanceCount).mapWith(Number),
            absentCount: sum(attendanceYearlyTable.absentCount).mapWith(Number),
            justifiedAbsentCount: sum(attendanceYearlyTable.justifiedAbsentCount).mapWith(Number),
            unjustifiedAbsentCount: sum(attendanceYearlyTable.unjustifiedAbsentCount).mapWith(Number),
            attendanceAverage: sql<number>`avg(${attendanceYearlyTable.attendanceAverage})`.mapWith(Number),
          })
          .from(attendanceYearlyTable)
          .innerJoin(politiciansTable, eq(attendanceYearlyTable.politicianId, politiciansTable.id))
          .where(eq(politiciansTable.partyId, partyId))
          .groupBy(politiciansTable.partyId, attendanceYearlyTable.year);
      }

      return c.json({ data: records, statusCode: 200 });
    } catch (error) {
      console.error('Error fetching party yearly attendance:', error);
      return c.json({ error: 'Failed to fetch party yearly attendance', statusCode: 500 }, 500);
    }
  });

const partiesMonthlyRoute = new Hono()
  .get('/', zValidator('query', partyAttendanceQuerySchema), async (c) => {
    try {
      const { year, month } = c.req.valid('query');

      let records;
      if (year && month) {
        records = await db
          .select({
            partyId: politiciansTable.partyId,
            partyName: partiesTable.name,
            year: attendanceMonthlyTable.year,
            month: attendanceMonthlyTable.month,
            attendanceCount: sum(attendanceMonthlyTable.attendanceCount).mapWith(Number),
            absentCount: sum(attendanceMonthlyTable.absentCount).mapWith(Number),
            justifiedAbsentCount: sum(attendanceMonthlyTable.justifiedAbsentCount).mapWith(Number),
            unjustifiedAbsentCount: sum(attendanceMonthlyTable.unjustifiedAbsentCount).mapWith(Number),
            attendanceAverage: sql<number>`avg(${attendanceMonthlyTable.attendanceAverage})`.mapWith(Number),
          })
          .from(attendanceMonthlyTable)
          .innerJoin(politiciansTable, eq(attendanceMonthlyTable.politicianId, politiciansTable.id))
          .innerJoin(partiesTable, eq(politiciansTable.partyId, partiesTable.id))
          .where(and(
            eq(attendanceMonthlyTable.year, year),
            eq(attendanceMonthlyTable.month, month)
          ))
          .groupBy(politiciansTable.partyId, partiesTable.name, attendanceMonthlyTable.year, attendanceMonthlyTable.month);
      } else if (year) {
        records = await db
          .select({
            partyId: politiciansTable.partyId,
            partyName: partiesTable.name,
            year: attendanceMonthlyTable.year,
            month: attendanceMonthlyTable.month,
            attendanceCount: sum(attendanceMonthlyTable.attendanceCount).mapWith(Number),
            absentCount: sum(attendanceMonthlyTable.absentCount).mapWith(Number),
            justifiedAbsentCount: sum(attendanceMonthlyTable.justifiedAbsentCount).mapWith(Number),
            unjustifiedAbsentCount: sum(attendanceMonthlyTable.unjustifiedAbsentCount).mapWith(Number),
            attendanceAverage: sql<number>`avg(${attendanceMonthlyTable.attendanceAverage})`.mapWith(Number),
          })
          .from(attendanceMonthlyTable)
          .innerJoin(politiciansTable, eq(attendanceMonthlyTable.politicianId, politiciansTable.id))
          .innerJoin(partiesTable, eq(politiciansTable.partyId, partiesTable.id))
          .where(eq(attendanceMonthlyTable.year, year))
          .groupBy(politiciansTable.partyId, partiesTable.name, attendanceMonthlyTable.year, attendanceMonthlyTable.month);
      } else {
        records = await db
          .select({
            partyId: politiciansTable.partyId,
            partyName: partiesTable.name,
            year: attendanceMonthlyTable.year,
            month: attendanceMonthlyTable.month,
            attendanceCount: sum(attendanceMonthlyTable.attendanceCount).mapWith(Number),
            absentCount: sum(attendanceMonthlyTable.absentCount).mapWith(Number),
            justifiedAbsentCount: sum(attendanceMonthlyTable.justifiedAbsentCount).mapWith(Number),
            unjustifiedAbsentCount: sum(attendanceMonthlyTable.unjustifiedAbsentCount).mapWith(Number),
            attendanceAverage: sql<number>`avg(${attendanceMonthlyTable.attendanceAverage})`.mapWith(Number),
          })
          .from(attendanceMonthlyTable)
          .innerJoin(politiciansTable, eq(attendanceMonthlyTable.politicianId, politiciansTable.id))
          .innerJoin(partiesTable, eq(politiciansTable.partyId, partiesTable.id))
          .groupBy(politiciansTable.partyId, partiesTable.name, attendanceMonthlyTable.year, attendanceMonthlyTable.month);
      }

      return c.json({ data: records, statusCode: 200 });
    } catch (error) {
      console.error('Error fetching all parties monthly attendance:', error);
      return c.json({ error: 'Failed to fetch all parties monthly attendance', statusCode: 500 }, 500);
    }
  });

const partiesYearlyRoute = new Hono()
  .get('/', zValidator('query', attendanceYearlyQuerySchema), async (c) => {
    try {
      const { year } = c.req.valid('query');

      let records;
      if (year) {
        records = await db
          .select({
            partyId: politiciansTable.partyId,
            partyName: partiesTable.name,
            year: attendanceYearlyTable.year,
            attendanceCount: sum(attendanceYearlyTable.attendanceCount).mapWith(Number),
            absentCount: sum(attendanceYearlyTable.absentCount).mapWith(Number),
            justifiedAbsentCount: sum(attendanceYearlyTable.justifiedAbsentCount).mapWith(Number),
            unjustifiedAbsentCount: sum(attendanceYearlyTable.unjustifiedAbsentCount).mapWith(Number),
            attendanceAverage: sql<number>`avg(${attendanceYearlyTable.attendanceAverage})`.mapWith(Number),
          })
          .from(attendanceYearlyTable)
          .innerJoin(politiciansTable, eq(attendanceYearlyTable.politicianId, politiciansTable.id))
          .innerJoin(partiesTable, eq(politiciansTable.partyId, partiesTable.id))
          .where(eq(attendanceYearlyTable.year, year))
          .groupBy(politiciansTable.partyId, partiesTable.name, attendanceYearlyTable.year);
      } else {
        records = await db
          .select({
            partyId: politiciansTable.partyId,
            partyName: partiesTable.name,
            year: attendanceYearlyTable.year,
            attendanceCount: sum(attendanceYearlyTable.attendanceCount).mapWith(Number),
            absentCount: sum(attendanceYearlyTable.absentCount).mapWith(Number),
            justifiedAbsentCount: sum(attendanceYearlyTable.justifiedAbsentCount).mapWith(Number),
            unjustifiedAbsentCount: sum(attendanceYearlyTable.unjustifiedAbsentCount).mapWith(Number),
            attendanceAverage: sql<number>`avg(${attendanceYearlyTable.attendanceAverage})`.mapWith(Number),
          })
          .from(attendanceYearlyTable)
          .innerJoin(politiciansTable, eq(attendanceYearlyTable.politicianId, politiciansTable.id))
          .innerJoin(partiesTable, eq(politiciansTable.partyId, partiesTable.id))
          .groupBy(politiciansTable.partyId, partiesTable.name, attendanceYearlyTable.year);
      }

      return c.json({ data: records, statusCode: 200 });
    } catch (error) {
      console.error('Error fetching all parties yearly attendance:', error);
      return c.json({ error: 'Failed to fetch all parties yearly attendance', statusCode: 500 }, 500);
    }
  });

const attendanceRoute = new Hono()
  .route('/attendance/monthly', monthlyRoute)
  .route('/attendance/yearly', yearlyRoute)
  .route('/attendance/party/monthly', partyMonthlyRoute)
  .route('/attendance/party/yearly', partyYearlyRoute)
  .route('/attendance/parties/monthly', partiesMonthlyRoute)
  .route('/attendance/parties/yearly', partiesYearlyRoute);

export default attendanceRoute;
