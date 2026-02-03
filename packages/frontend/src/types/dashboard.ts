


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

export interface PartyData {
  id: number;
  name: string;
  slug: string;
  color: string;
  abbreviation?: string;
}

export interface PartyAttendance {
  partyId: number;
  partyName: string;
  year: number;
  attendanceCount: number;
  absentCount: number;
  justifiedAbsentCount: number;
  unjustifiedAbsentCount: number;
  attendanceAverage: number;
}

export interface DashboardProps {
  politicians: PoliticianAttendance[];
  partyAttendance: PartyAttendance[];
  parties: PartyData[];
  years: number[];
  initialYear: number;
}
