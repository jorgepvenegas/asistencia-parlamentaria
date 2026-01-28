import { Hono } from 'hono';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { partiesTable } from '../db/schema';
import { db } from '../db';

export const partiesRoute = new Hono();

partiesRoute.get('/parties', async (c) => {  
  try {
    
    // const db = drizzle(process.env.DB_FILE_NAME!);
    const parties = await db.select().from(partiesTable);
    return c.json({
      data: parties,
      statusCode: 200,
    });
  } catch (error) {
    console.error('Error fetching parties:', error);
    throw error;
  }
});
