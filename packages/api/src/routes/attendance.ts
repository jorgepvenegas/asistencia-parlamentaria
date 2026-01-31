import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import 'dotenv/config';
import { attendanceMonthlyTable, attendanceYearlyTable } from '../db/schema.js';
import { db } from '../db/index.js';

const monthlySchema = z.object({
  politicianId: z.number().min(1),
  year: z.number().min(2000).max(2100),
  month: z.number().min(1).max(12),
  attendanceCount: z.number().min(0),
  absentCount: z.number().min(0),
  justifiedAbsentCount: z.number().min(0),
  unjustifiedAbsentCount: z.number().min(0),
  attendanceAverage: z.number().min(0).max(100),
});

const yearlySchema = z.object({
  politicianId: z.number().min(1),
  year: z.number().min(2000).max(2100),
  attendanceCount: z.number().min(0),
  absentCount: z.number().min(0),
  justifiedAbsentCount: z.number().min(0),
  unjustifiedAbsentCount: z.number().min(0),
  attendanceAverage: z.number().min(0).max(100),
});

const attendanceRoute = new Hono()
  // Monthly endpoints
  .get('/attendance/monthly', async (c) => {
    try {
      const year = c.req.query('year');
      const month = c.req.query('month');

      if (year && month) {
        const records = await db.select().from(attendanceMonthlyTable)
          .where(and(
            eq(attendanceMonthlyTable.year, parseInt(year)),
            eq(attendanceMonthlyTable.month, parseInt(month))
          ));
        return c.json({ data: records, statusCode: 200 });
      }

      if (year) {
        const records = await db.select().from(attendanceMonthlyTable)
          .where(eq(attendanceMonthlyTable.year, parseInt(year)));
        return c.json({ data: records, statusCode: 200 });
      }

      const records = await db.select().from(attendanceMonthlyTable);
      return c.json({ data: records, statusCode: 200 });
    } catch (error) {
      console.error('Error fetching monthly attendance:', error);
      return c.json({ error: 'Failed to fetch monthly attendance', statusCode: 500 }, 500);
    }
  })
  .post('/attendance/monthly', zValidator('json', monthlySchema), async (c) => {
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
  })
  // Yearly endpoints
  .get('/attendance/yearly', async (c) => {
    try {
      const year = c.req.query('year');

      if (year) {
        const records = await db.select().from(attendanceYearlyTable)
          .where(eq(attendanceYearlyTable.year, parseInt(year)));
        return c.json({ data: records, statusCode: 200 });
      }

      const records = await db.select().from(attendanceYearlyTable);
      return c.json({ data: records, statusCode: 200 });
    } catch (error) {
      console.error('Error fetching yearly attendance:', error);
      return c.json({ error: 'Failed to fetch yearly attendance', statusCode: 500 }, 500);
    }
  })
  .post('/attendance/yearly', zValidator('json', yearlySchema), async (c) => {
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

export default attendanceRoute;
