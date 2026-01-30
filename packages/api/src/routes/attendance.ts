import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import 'dotenv/config';
import { attendanceRecordsTable } from '../db/schema.js';
import { db } from '../db/index.js';

const createAttendanceRecordSchema = z.object({
  politicianId: z.number().min(1, 'Politician ID is required'),
  date: z.string().min(1, 'Date is required'),
  attendanceCount: z.number().min(0, 'Attendance value is required'),
  attendanceAverage: z.number().min(0, 'Attendance average is required'),
});

const attendanceRoute = new Hono()
  .get('/attendance', async (c) => {
    try {
      const attendance = await db.select().from(attendanceRecordsTable);
      return c.json({
        data: attendance,
        statusCode: 200,
      });
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return c.json({
        error: 'Failed to fetch attendance',
        statusCode: 500,
      }, 500);
    }
  })
  .post('/attendance', zValidator('json', createAttendanceRecordSchema), async (c) => {
    try {
      const { attendanceAverage, attendanceCount, date, politicianId } = c.req.valid('json');

      // Check existing record
      const existing = await db
        .select()
        .from(attendanceRecordsTable)
        .where(eq(attendanceRecordsTable.politicianId, politicianId))
        .limit(1);

      if (existing.length > 0) {

        // update existing
        const updated = await db.update(attendanceRecordsTable).set({
          attendanceAverage,
          attendanceCount,
          date
        }).where(eq(attendanceRecordsTable.politicianId, politicianId)).returning();

        return c.json({
          data: updated[0],
          statusCode: 201,
        }, 200);
      }
      const created = await db.insert(attendanceRecordsTable).values({
        attendanceAverage,
        date,
        politicianId,
        attendanceCount
      }).returning();

      return c.json({
        data: created[0],
        statusCode: 201,
      }, 201);
    } catch (error) {
      console.error('Error creating attendance record:', error);
      return c.json({
        error: 'Failed to create attendance record',
        statusCode: 500,
      }, 500);
    }
  })

export default attendanceRoute;
