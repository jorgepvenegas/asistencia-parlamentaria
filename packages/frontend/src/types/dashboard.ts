import type { PartyAttendanceYearlyResponse } from '@quienatiende/shared/schemas';

// Frontend-specific computed type for politician attendance display
export interface PoliticianAttendance {
  id: number;
  name: string;
  party: string;
  partyId: number;
  attendance: number;
  validJust: number;
  invalidJust: number;
  noJust: number;
  pct: number;
}

// Use shared types
export type PartyAttendance = PartyAttendanceYearlyResponse;

export interface DashboardProps {
  politicians: PoliticianAttendance[];
  partyAttendance: PartyAttendance[];
  initialYear: number;
}
