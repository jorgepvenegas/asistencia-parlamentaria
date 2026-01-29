import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, or } from 'drizzle-orm';
import 'dotenv/config';
import { partiesTable } from '../db/schema.js';
import { db } from '../db/index.js';

const createPartySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  abbreviation: z.string().min(1, 'Abbreviation is required'),
});

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
  })
  .post('/parties', zValidator('json', createPartySchema), async (c) => {
    try {
      const { name, slug, abbreviation } = c.req.valid('json');

      // Check if party already exists
      const existing = await db
        .select()
        .from(partiesTable)
        .where(or(eq(partiesTable.slug, slug), eq(partiesTable.abbreviation, abbreviation)))
        .limit(1);

      if (existing.length > 0) {
        return c.json({
          data: existing[0],
          statusCode: 200,
        }, 200);
      }

      // Party doesn't exist, create it
      const result = await db.insert(partiesTable).values({
        name,
        slug,
        abbreviation,
      }).returning();

      return c.json({
        data: result[0],
        statusCode: 201,
      }, 201);
    } catch (error) {
      console.error('Error creating party:', error);
      throw error;
    }
  })
  .get('/parties/:slug', async (c) => {
    try {
      const slug = c.req.param('slug');

      const party = await db
        .select()
        .from(partiesTable)
        .where(eq(partiesTable.slug, slug))
        .limit(1);

      if (party.length === 0) {
        return c.json({
          error: 'Party not found',
          statusCode: 404,
        }, 404);
      }

      return c.json({
        data: party[0],
        statusCode: 200,
      });
    } catch (error) {
      console.error('Error fetching party:', error);
      throw error;
    }
  })

export default partiesRoute;
