import type {
  AttendanceYearlyResponse,
  PoliticianResponse,
  PartyResponse,
  PartyAttendanceYearlyResponse,
} from '@quienatiende/shared/schemas';
import type { PoliticianAttendance, PartyAttendance } from '../types/dashboard';

export function computePct(count: number, total: number): number {
  return total > 0 ? parseFloat(((count / total) * 100).toFixed(2)) : 0;
}

export function transformPolitician(
  att: AttendanceYearlyResponse,
  politicianMap: Map<number, PoliticianResponse>,
  partyMap: Map<number, PartyResponse>
): PoliticianAttendance | null {
  const politician = politicianMap.get(att.politicianId);
  if (!politician) return null;
  const party = partyMap.get(politician.partyId);

  const total =
    att.attendanceCount + att.justifiedAbsentCount + att.unjustifiedAbsentCount + att.absentCount;

  return {
    id: att.politicianId,
    name: politician.name,
    party: party?.name || 'Sin partido',
    partyId: politician.partyId,
    attendanceCount: att.attendanceCount,
    avgAttendance: computePct(att.attendanceCount, total),
    justifiedAbsentCount: att.justifiedAbsentCount,
    avgValidJust: computePct(att.justifiedAbsentCount, total),
    unjustifiedAbsentCount: att.unjustifiedAbsentCount,
    avgInvalidJust: computePct(att.unjustifiedAbsentCount, total),
    absentCount: att.absentCount,
    avgNoJust: computePct(att.absentCount, total),
    pct: parseFloat(att.attendanceAverage.toFixed(2)),
  };
}

export function transformPartyAttendance(
  p: PartyAttendanceYearlyResponse,
  memberCountByParty: Map<number, number>
): PartyAttendance {
  const total =
    p.attendanceCount + p.justifiedAbsentCount + p.unjustifiedAbsentCount + p.absentCount;

  return {
    ...p,
    avgAttendance: computePct(p.attendanceCount, total),
    avgValidJust: computePct(p.justifiedAbsentCount, total),
    avgInvalidJust: computePct(p.unjustifiedAbsentCount, total),
    avgNoJust: computePct(p.absentCount, total),
    memberCount: memberCountByParty.get(p.partyId) ?? 0,
  };
}

export function buildMemberCountByParty(politicians: PoliticianResponse[]): Map<number, number> {
  const map = new Map<number, number>();
  for (const p of politicians) {
    map.set(p.partyId, (map.get(p.partyId) ?? 0) + 1);
  }
  return map;
}
