import type { PartyAttendanceYearlyResponse } from '@quienatiende/shared/schemas';

// Frontend-specific computed type for politician attendance display
export interface PoliticianAttendance {
  id: number;
  name: string;
  party: string;
  partyId: number;
  attendance: number;
  avgAttendance: number;
  validJust: number;
  avgValidJust: number;
  invalidJust: number;
  avgInvalidJust: number;
  noJust: number;
  avgNoJust: number;
  pct: number;
}

// PartyAttendanceYearlyResponse extended with computed percentage fields
export interface PartyAttendance extends PartyAttendanceYearlyResponse {
  avgAttendance: number;
  avgValidJust: number;
  avgInvalidJust: number;
  avgNoJust: number;
}

export interface PartyAttendanceProps {
  politicians: PoliticianAttendance[];
  partyAttendance: PartyAttendance[];
  initialYear: number;
}
