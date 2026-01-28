/**
 * Zod validation schemas for API request/response validation
 */

import { z } from 'zod';

export const PartySchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(100),
  slug: z.string(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  secondary_color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  abbreviation: z.string().max(10).optional(),
  created_at: z.string().datetime().optional(),
});

export const PoliticianSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(200),
  party_id: z.string(),
  position: z.string().max(100).optional(),
  district: z.string().optional(),
  photo_url: z.string().url().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const AttendanceRecordSchema = z.object({
  id: z.string(),
  politician_id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  session_type: z.string().optional(),
  status: z.enum(['attended', 'unattended', 'excused']),
  reason: z.string().max(500).optional(),
  notes: z.string().optional(),
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const AttendanceSummarySchema = z.object({
  id: z.string(),
  politician_id: z.string(),
  year: z.number().int().min(2000).max(9999),
  month: z.number().int().min(1).max(12).optional(),
  total_sessions: z.number().int().nonnegative(),
  attended_count: z.number().int().nonnegative(),
  unattended_count: z.number().int().nonnegative(),
  excused_count: z.number().int().nonnegative(),
  percentage_attended: z.number().min(0).max(100),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const MetadataSchema = z.object({
  key: z.string(),
  value: z.string(),
  updated_at: z.string().datetime().optional(),
});

export const PoliticianWithSummarySchema = PoliticianSchema.extend({
  party: PartySchema.optional(),
  yearly_summary: AttendanceSummarySchema.optional(),
  percentage_attended: z.number().optional(),
});

export const PaginationParamsSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(100),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export const GetPoliticiansParamsSchema = PaginationParamsSchema.extend({
  year: z.coerce.number().int().min(2000).max(9999).optional(),
  party_id: z.string().optional(),
  sort: z.enum([
    'attendance_desc',
    'attendance_asc',
    'name_asc',
    'name_desc',
  ]).default('name_asc'),
});

export const SearchParamsSchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export const AttendanceSummaryParamsSchema = z.object({
  year: z.coerce.number().int().min(2000).max(9999),
  month: z.coerce.number().int().min(1).max(12).optional(),
  parties: z.string().optional(), // Comma-separated party IDs
  ...PaginationParamsSchema.shape,
});

export type Party = z.infer<typeof PartySchema>;
export type Politician = z.infer<typeof PoliticianSchema>;
export type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>;
export type AttendanceSummary = z.infer<typeof AttendanceSummarySchema>;
export type Metadata = z.infer<typeof MetadataSchema>;
export type PoliticianWithSummary = z.infer<typeof PoliticianWithSummarySchema>;
export type GetPoliticiansParams = z.infer<typeof GetPoliticiansParamsSchema>;
export type SearchParams = z.infer<typeof SearchParamsSchema>;
