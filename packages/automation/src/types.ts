import { z } from 'zod';

/**
 * Zod schemas for type-safe data validation at JSON boundaries.
 */

export const PoliticianAttendanceSchema = z.object({
  name: z.string().min(1),
  partySlug: z.string().min(1),
  attended: z.number().min(0),
  justifiedAbsent: z.number().min(0),
  unjustifiedAbsent: z.number().min(0),
  absent: z.number().min(0),
  percentage: z.number().min(0).max(100),
});

export type PoliticianAttendance = z.infer<typeof PoliticianAttendanceSchema>;

export const PartyDataSchema = z.object({
  slug: z.string().min(1),
  party: z.string().min(1),
});

export type PartyData = z.infer<typeof PartyDataSchema>;

export const CreatePartyRequestSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  abbreviation: z.string().min(1),
});

export type CreatePartyRequest = z.infer<typeof CreatePartyRequestSchema>;

export const CreatePoliticianRequestSchema = z.object({
  name: z.string().min(1),
  partySlug: z.string().min(1),
});

export type CreatePoliticianRequest = z.infer<typeof CreatePoliticianRequestSchema>;

export const CreateAttendanceRequestSchema = z.object({
  politicianId: z.number().min(1),
  year: z.number().min(2000).max(2100),
  month: z.number().min(1).max(12),
  attendanceCount: z.number().min(0),
  attendanceAverage: z.number().min(0).max(100),
});

export type CreateAttendanceRequest = z.infer<typeof CreateAttendanceRequestSchema>;

export const SyncResultSchema = z.object({
  success: z.boolean(),
  startTime: z.string(),
  endTime: z.string(),
  duration: z.number(),
  steps: z.object({
    scraping: z.object({
      success: z.boolean(),
      partiesCount: z.number(),
      politiciansCount: z.number(),
      attendanceCount: z.number(),
    }),
    partyCreation: z.object({
      success: z.boolean(),
      successCount: z.number(),
      failureCount: z.number(),
      errors: z.array(z.object({ slug: z.string(), error: z.string() })),
    }),
    politicianCreation: z.object({
      success: z.boolean(),
      successCount: z.number(),
      failureCount: z.number(),
      errors: z.array(z.object({ name: z.string(), error: z.string() })),
    }),
  }),
});

export type SyncResult = z.infer<typeof SyncResultSchema>;
