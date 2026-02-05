import type { PartyAttendanceYearlyResponse } from '@quienatiende/shared/schemas';
import type { PartyWithColor } from './extended';

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
export type PartyData = PartyWithColor;
export type PartyAttendance = PartyAttendanceYearlyResponse;

export interface DashboardProps {
  politicians: PoliticianAttendance[];
  partyAttendance: PartyAttendance[];
  parties: PartyData[];
  years: number[];
  initialYear: number;
}
