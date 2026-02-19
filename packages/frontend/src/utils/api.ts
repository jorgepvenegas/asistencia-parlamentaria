import { z } from 'zod';
import {
  politicianResponseSchema,
  partyResponseSchema,
  attendanceYearlyResponseSchema,
  partyAttendanceYearlyResponseSchema,
} from '@quienatiende/shared/schemas';

export const API_URL = import.meta.env.PUBLIC_BASE_URL_API || 'http://localhost:3000';

export const politiciansArraySchema = z.array(politicianResponseSchema);
export const partiesArraySchema = z.array(partyResponseSchema);
export const attendanceArraySchema = z.array(attendanceYearlyResponseSchema);
export const partyAttendanceArraySchema = z.array(partyAttendanceYearlyResponseSchema);

export async function parseResponse<T>(
  res: Response,
  schema: z.ZodType<T>,
  label: string
): Promise<T | null> {
  if (!res.ok) return null;
  const { data } = await res.json();
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  console.error(`${label} validation failed:`, result.error);
  return null;
}
