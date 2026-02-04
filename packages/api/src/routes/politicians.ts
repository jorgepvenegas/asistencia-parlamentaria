import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import 'dotenv/config';
import { partiesTable, politiciansTable } from '../db/schema.js';
import { db } from '../db/index.js';
import { createPoliticianSchema } from '../schemas/index.js';

const politiciansRoute = new Hono()
  .get('/politicians', async (c) => {
    try {
      const politicians = await db.select().from(politiciansTable);
      return c.json({
        data: politicians,
        statusCode: 200,
      });
    } catch (error) {
      console.error('Error fetching politicians:', error);
      return c.json({
        error: 'Failed to fetch politicians',
        statusCode: 500,
      }, 500);
    }
  })
  .post('/politicians', zValidator('json', createPoliticianSchema), async (c) => {
    try {
      const { name, partySlug } = c.req.valid('json');

      // Check if already exists
      const existing = await db
        .select()
        .from(politiciansTable)
        .where(eq(politiciansTable.name, name))
        .limit(1);

      if (existing.length > 0) {
        return c.json({
          data: existing[0],
          statusCode: 200,
        }, 200);
      }

      const party = await db.select()
        .from(partiesTable)
        .where(eq(partiesTable.slug, partySlug))
        .limit(1);

      if(party.length === 0) {
        return c.json({
          error: `Party not found: ${partySlug}`,
          statusCode: 404,
        }, 404);
      }

      // doesn't exist, create it
      const result = await db.insert(politiciansTable).values({
        name,
        partyId: party[0].id
      }).returning();

      return c.json({
        data: result[0],
        statusCode: 201,
      }, 201);
    } catch (error) {
      console.error('Error creating politician:', error);
      return c.json({
        error: 'Failed to create politician',
        statusCode: 500,
      }, 500);
    }
  })

export default politiciansRoute;
