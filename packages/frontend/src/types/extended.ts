import { z } from 'zod';

// Party with color - frontend extension (API doesn't have color field)
export const partyWithColorSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  abbreviation: z.string().nullable(),
  color: z.string(),
});

export type PartyWithColor = z.infer<typeof partyWithColorSchema>;
