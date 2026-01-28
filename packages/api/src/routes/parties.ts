import { Hono } from 'hono';
import 'dotenv/config';
import { partiesTable } from '../db/schema.js';
import { db } from '../db/index.js';

const partiesRoute = new Hono()
  .get('/parties', async (c) => {  
    try {
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

export default partiesRoute;
